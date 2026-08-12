import { MAP_CONFIGS, TOKEN_CONFIGS } from "../config";
import { GAME_SCALE, HERO_FRAMES, INVENTORY_TOKENS_REGISTRY_KEY, SITE_TYPES, STATIC_TEXTURE_KEY, TERRAIN_TEXTURE_KEY } from "../constants";
import { InventoryItem } from "../interfaces/stuffInInventory";
import { Hero } from "../objects/hero";
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

const BLACKOUT_DURATION = 600;
const CENTERING_DELAY = 400;
const CENTERING_DURATION = 600;
const TOKENS_DELAY = CENTERING_DELAY + CENTERING_DURATION + 1500;
const TOKEN_FADE_IN_DURATION = 400;
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

        this.time.delayedCall(TOKENS_DELAY, () => this.showRequiredTokens());
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

    private showRequiredTokens() {
        // one icon per required unit, e.g. { ring: 2 } shows two ring icons
        const tokenIcons: typeof TOKEN_CONFIGS = [];
        Object.entries(this.exitConfig.requiredTokens ?? {}).forEach(([key, qty]) => {
            const tokenConfig = TOKEN_CONFIGS.find(tc => tc.key === key);
            if (!tokenConfig) {
                return;
            }
            for (let i = 0; i < qty; i++) {
                tokenIcons.push(tokenConfig);
            }
        });

        const iconSpacing = this.hero.entity.displayWidth;
        const totalWidth = (tokenIcons.length - 1) * iconSpacing;
        // center the row over the midpoint between the hero and the entrance icon,
        // not the screen midpoint (which sits directly above the entrance icon)
        const pairCenterX = window.innerWidth / 2 - this.hero.entity.displayWidth / 2;
        const startX = pairCenterX - totalWidth / 2;
        const iconY = window.innerHeight * .6 - this.hero.entity.displayHeight * 1.5;

        tokenIcons.forEach((tokenConfig, i) => {
            const icon = this.add.image(startX + i * iconSpacing, iconY, STATIC_TEXTURE_KEY, tokenConfig.frameIndex);
            icon.setScale(GAME_SCALE);
            icon.setTint(tokenConfig.tint);
            icon.setDepth(1);
            icon.setAlpha(0);
            this.tweens.add({
                targets: icon,
                alpha: 1,
                duration: TOKEN_FADE_IN_DURATION,
            });
        });

        this.input.keyboard.on('keydown', this.continueToSite, this);
        this.input.on('pointerdown', this.continueToSite, this);
        this.input.gamepad.on('down', this.continueToSite, this);
    }

    private continueToSite() {
        if (this.isMovingOn) {
            return;
        }
        this.isMovingOn = true;

        this.input.keyboard.off('keydown', this.continueToSite, this);
        this.input.off('pointerdown', this.continueToSite, this);
        this.input.gamepad.off('down', this.continueToSite, this);

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
