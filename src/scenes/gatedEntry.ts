import { MAP_CONFIGS, TOKEN_CONFIGS } from "../config";
import { GAME_SCALE, HERO_FRAMES, INVENTORY_TOKENS_REGISTRY_KEY, SITE_TYPES, STATIC_TEXTURE_KEY, TERRAIN_TEXTURE_KEY, TYPEWRITER_WORD_INTERVAL } from "../constants";
import { TokenConfig } from "../interfaces/tokenConfig";
import { InventoryItem } from "../interfaces/stuffInInventory";
import { Hero } from "../objects/hero";
import { TypewriterText } from "../objects/typewriterText";
import { TEXT_GATED_ENTRY_CHALLENGE } from "../text";
import { CARDINAL_DIRECTION } from "../utils";
import { SiteScene } from "./site";

export interface GatedEntrySceneProps {
    heroDisplayX: number;
    heroDisplayY: number;
    heroDirection: CARDINAL_DIRECTION;
    entranceDisplayX: number;
    entranceDisplayY: number;
    callingSceneKey: SITE_TYPES;
    exitConfig: {
        linkedMapSceneType: SITE_TYPES;
        linkedMapConfigName: string;
        requiredTokens?: { [tokenKey: string]: number };
    };
}

interface TokenIconLayout {
    tokenConfig: TokenConfig;
    x: number;
    y: number;
}

const BLACKOUT_DURATION = 600;
const CENTERING_DELAY = 400;
const CENTERING_DURATION = 600;
const CHALLENGE_DELAY = CENTERING_DELAY + CENTERING_DURATION + 500;
const GHOST_TOKEN_FADE_IN_DURATION = 400;
const GHOST_TINT = 0x888888;
const TOKEN_PAY_DURATION = 900;
const PAY_TO_FLASH_DELAY = 1500;
const FLASH_DELAY = 240;
const FLASH_DURATION = 60;
const FLASH_RGB = 128;
const FADEOUT_DELAY = FLASH_DELAY * 2 + FLASH_DURATION;
const FADEOUT_DURATION = 700;
const FADEOUT_RGB = 255;

export class GatedEntryScene extends Phaser.Scene {
    private hero: Hero;
    private entranceIcon: Phaser.GameObjects.Image;
    private entranceIconBlinkTint: number;
    private entranceIconBlinkState: 0 | 1 | 2 | 3 = 0;
    private entranceIconBlinkTimer: Phaser.Time.TimerEvent;
    private background: Phaser.GameObjects.Rectangle;
    private tokenLayout: TokenIconLayout[];
    private isMovingOn: boolean;
    private callingSceneKey: SITE_TYPES;
    private exitConfig: GatedEntrySceneProps['exitConfig'];

    create(): void {
        this.isMovingOn = false;

        const { heroDisplayX, heroDisplayY, heroDirection, entranceDisplayX, entranceDisplayY, callingSceneKey, exitConfig } = this.scene.settings.data as GatedEntrySceneProps;
        this.callingSceneKey = callingSceneKey;
        this.exitConfig = exitConfig;

        this.hero = new Hero(heroDisplayX, heroDisplayY, this, 0, heroDirection);
        this.hero.currentDirection = CARDINAL_DIRECTION.RIGHT;
        this.hero.entity.setFrame(HERO_FRAMES.standing[CARDINAL_DIRECTION.RIGHT]);

        const targetSiteConfig = MAP_CONFIGS[exitConfig.linkedMapSceneType].find(mc => mc.mapConfigName === exitConfig.linkedMapConfigName);
        // starts directly on top of the in-place exit icon from the site map, then
        // lerps over to sit beside the hero as part of the centering tween below
        this.entranceIconBlinkTint = targetSiteConfig?.tileTints?.[0] ?? 0xffffff;
        this.entranceIcon = this.add.image(entranceDisplayX, entranceDisplayY, TERRAIN_TEXTURE_KEY, targetSiteConfig?.externalIconTileIndex);
        this.entranceIcon.setScale(GAME_SCALE);
        this.entranceIcon.setTint(this.entranceIconBlinkTint);
        this.entranceIcon.setDepth(1);

        this.background = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2 * -1, window.innerWidth, window.innerHeight, 0x000000);
        this.tweens.add({
            targets: this.background,
            y: window.innerHeight / 2,
            ease: 'linear',
            duration: BLACKOUT_DURATION,
        });

        this.time.delayedCall(CENTERING_DELAY, () => {
            const targetX = window.innerWidth / 2 - this.hero.entity.displayWidth;
            const targetY = window.innerHeight * .6;
            this.tweens.add({
                targets: this.hero.entity,
                x: targetX,
                y: targetY,
                duration: CENTERING_DURATION,
            });
            this.tweens.add({
                targets: this.entranceIcon,
                x: targetX + this.hero.entity.displayWidth,
                y: targetY,
                duration: CENTERING_DURATION,
                // don't start blinking until the icon has finished lerping into place,
                // so it doesn't clash with the still-blinking in-place icon on the map
                onComplete: () => this.blinkEntranceIcon(),
            });
        });

        this.tokenLayout = this.computeTokenLayout();
        this.time.delayedCall(CHALLENGE_DELAY, () => this.showChallenge());
    }

    private blinkEntranceIcon() {
        if (this.entranceIconBlinkTimer) {
            this.time.removeEvent(this.entranceIconBlinkTimer);
        }

        this.entranceIconBlinkState = ((this.entranceIconBlinkState + 1) % 4) as 0 | 1 | 2 | 3;

        let delay = 200;
        switch (this.entranceIconBlinkState) {
            case 0:
                this.entranceIcon.setTint(this.entranceIconBlinkTint);
                delay = 1000;
                break;
            case 1:
                this.entranceIcon.setTint(0xffffff);
                break;
            case 2:
                this.entranceIcon.setTint(this.entranceIconBlinkTint);
                delay = 100;
                break;
            case 3:
                this.entranceIcon.setTint(0xffffff);
                break;
        }

        this.entranceIconBlinkTimer = this.time.delayedCall(delay, this.blinkEntranceIcon, [], this);
    }

    /**
     * Lays out one slot per required unit, e.g. { ring: 2 } gets two ring slots,
     * centered over the midpoint between the hero and the entrance icon (not the
     * screen midpoint, which sits directly above the entrance icon).
     */
    private computeTokenLayout(): TokenIconLayout[] {
        const tokenConfigs: TokenConfig[] = [];
        Object.entries(this.exitConfig.requiredTokens ?? {}).forEach(([key, qty]) => {
            const tokenConfig = TOKEN_CONFIGS.find(tc => tc.key === key);
            if (!tokenConfig) {
                return;
            }
            for (let i = 0; i < qty; i++) {
                tokenConfigs.push(tokenConfig);
            }
        });

        const iconSpacing = this.hero.entity.displayWidth;
        const totalWidth = (tokenConfigs.length - 1) * iconSpacing;
        const pairCenterX = window.innerWidth / 2 - this.hero.entity.displayWidth / 2;
        const startX = pairCenterX - totalWidth / 2;
        const iconY = window.innerHeight * .6 - this.hero.entity.displayHeight * 1.5;

        return tokenConfigs.map((tokenConfig, i) => ({
            tokenConfig,
            x: startX + i * iconSpacing,
            y: iconY,
        }));
    }

    private showChallenge() {
        this.tokenLayout.forEach(({ tokenConfig, x, y }) => {
            const ghostIcon = this.add.image(x, y, STATIC_TEXTURE_KEY, tokenConfig.frameIndex);
            ghostIcon.setScale(GAME_SCALE);
            ghostIcon.setTint(GHOST_TINT);
            ghostIcon.setDepth(1);
            ghostIcon.setAlpha(0);
            this.tweens.add({
                targets: ghostIcon,
                alpha: 1,
                duration: GHOST_TOKEN_FADE_IN_DURATION,
            });
        });

        const speechTextY = this.cameras.main.displayHeight * .1;
        new TypewriterText(TEXT_GATED_ENTRY_CHALLENGE, this, speechTextY, TYPEWRITER_WORD_INTERVAL, () => {
            this.input.keyboard.on('keydown', this.payTokens, this);
            this.input.on('pointerdown', this.payTokens, this);
            this.input.gamepad.on('down', this.payTokens, this);
        });
    }

    /**
     * Lerps correctly-tinted token icons up from the bottom-left corner of the
     * screen to cover the ghost icons -- the inverse of Token.animateToInventory,
     * which flies a bestowed token from the center out to that same corner.
     */
    private payTokens() {
        if (this.isMovingOn) {
            return;
        }
        this.isMovingOn = true;

        this.input.keyboard.off('keydown', this.payTokens, this);
        this.input.off('pointerdown', this.payTokens, this);
        this.input.gamepad.off('down', this.payTokens, this);

        const cam = this.cameras.main;
        const startX = cam.scrollX;
        const startY = cam.scrollY + this.scale.height;

        this.tokenLayout.forEach(({ tokenConfig, x, y }) => {
            const paidIcon = this.add.image(startX, startY, STATIC_TEXTURE_KEY, tokenConfig.frameIndex);
            paidIcon.setScale(1);
            paidIcon.setTint(tokenConfig.tint);
            paidIcon.setDepth(1);
            this.tweens.add({
                targets: paidIcon,
                x: { value: x, ease: 'Quad.easeOut' },
                y: { value: y, ease: 'Back.easeOut' },
                scale: { value: GAME_SCALE, ease: 'Back.easeOut' },
                duration: TOKEN_PAY_DURATION,
            });
        });

        this.time.delayedCall(TOKEN_PAY_DURATION + PAY_TO_FLASH_DELAY, () => this.beginFlashAndFade());
    }

    private beginFlashAndFade() {
        const cam = this.cameras.main;
        this.time.delayedCall(1, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
        this.time.delayedCall(FLASH_DELAY, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
        this.time.delayedCall(FADEOUT_DELAY, () => {
            cam.fade(FADEOUT_DURATION, FADEOUT_RGB, FADEOUT_RGB, FADEOUT_RGB, false);
            cam.once('camerafadeoutcomplete', () => {
                if (this.exitConfig.requiredTokens) {
                    const inventory: InventoryItem[] = this.registry.get(INVENTORY_TOKENS_REGISTRY_KEY) || [];
                    Object.entries(this.exitConfig.requiredTokens).forEach(([key, qty]) => {
                        const item = inventory.find(i => i.inventoryItemKey === key);
                        if (item) {
                            item.quantity = Math.max(0, item.quantity - qty);
                        }
                    });
                    this.registry.set(INVENTORY_TOKENS_REGISTRY_KEY, inventory);
                }

                (this.scene.get(this.callingSceneKey) as SiteScene).clearListeners();
                this.scene.stop(this.callingSceneKey);
                this.scene.start(this.exitConfig.linkedMapSceneType, {
                    mapConfigName: this.exitConfig.linkedMapConfigName,
                });
            });
        });
    }
}
