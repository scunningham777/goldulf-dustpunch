import { ANCESTOR_CONFIGS, TOKEN_CONFIGS, RELIC_CONFIGS } from "../config";
import { ANCESTORS_TEXTURE_KEY, GAME_SCALE, HERO_FRAMES, INVENTORY_TOKENS_REGISTRY_KEY, INVENTORY_RELICS_REGISTRY_KEY, SITE_TYPES, STATIC_TEXTURE_KEY, TYPEWRITER_WORD_INTERVAL } from "../constants";
import { AncestorConfig } from "../interfaces/ancestorConfig";
import { SiteConfig } from "../interfaces/siteConfig";
import { Hero } from "../objects/hero";
import { Token } from "../objects/token";
// @ts-ignore - module sometimes not picked up by TS watcher until rebuild
import { Relic } from "../objects/relic.ts";
import { TypewriterText } from "../objects/typewriterText";
import { TEXT_ANCESTOR_BESTOWED_TOKEN_CTA, TEXT_ANCESTOR_FREED_CTA, TEXT_ANCESTOR_FREED_SPEECH, TEXT_FIRST_TOKEN_RECEIVED } from "../text";
import { CARDINAL_DIRECTION, weightedRandomizeAnything } from "../utils";
import { SiteScene } from "./site";

export interface SiteCompleteSceneProps {
    heroDisplayX: number;
    heroDisplayY: number;
    heroDirection: CARDINAL_DIRECTION;
    siteConfig: SiteConfig;
    callingSceneKey: SITE_TYPES;
}

const BLACKOUT_DURATION = 600;
const CENTERING_DELAY = 400;
const CENTERING_DURATION = 600;
const ANCESTOR_DELAY = CENTERING_DELAY + CENTERING_DURATION + 400;
const ANCESTOR_LEVITATION_DURATION = 1600;
const SPEECH_DELAY = ANCESTOR_DELAY + ANCESTOR_LEVITATION_DURATION + 500;
const FLASH_DELAY = 240;
const FLASH_DURATION = 60;
const FLASH_RGB = 128;
const FADEOUT_DELAY = FLASH_DELAY * 2 + FLASH_DURATION;
const FADEOUT_DURATION = 700;
const FADEOUT_RGB = 190;


export class SiteCompleteScene extends Phaser.Scene {
    private hero: Hero;
    private ancestorSpirit: {
        image: Phaser.GameObjects.Image,
        config: AncestorConfig,
    };
    private background: Phaser.GameObjects.Rectangle;
    private speechText: TypewriterText;
    private isMovingOn: boolean;
    private callingSceneKey: SITE_TYPES;
    private token: Token | undefined;
    private relic: Relic | undefined;

    // set to true when the current token/relic being granted was never in the
    // player's inventory before.  used to trigger the special tutorial message
    private firstTokenReceived: boolean = false;
    private firstRelicReceived: boolean = false;

    create(): void {
        this.add.graphics();

        this.isMovingOn = false;

        const { heroDisplayX, heroDisplayY, heroDirection, siteConfig, callingSceneKey } = this.scene.settings.data as SiteCompleteSceneProps;
        this.hero = new Hero(heroDisplayX, heroDisplayY, this, 0, heroDirection)
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection]);
        this.callingSceneKey = callingSceneKey;

        this.background = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2 * -1, window.innerWidth, window.innerHeight, 0x000000);
        this.tweens.add({
            targets: this.background,
            y: window.innerHeight / 2,
            ease: 'linear',
            duration: BLACKOUT_DURATION,
        });
        this.time.delayedCall(CENTERING_DELAY, () => {
            this.tweens.add({
                targets: this.hero.entity,
                x: window.innerWidth / 2 - this.hero.entity.displayWidth,
                y: window.innerHeight * .6,
                duration: CENTERING_DURATION,
            });
        });
        this.time.delayedCall(ANCESTOR_DELAY, () => {
            this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[CARDINAL_DIRECTION.RIGHT] + 2);

            this.createAncestorSpirit(siteConfig);

            if (this.ancestorSpirit.config.tokenKey) {
                const firstTime = this.bestowToken();
                if (firstTime) {
                    this.firstTokenReceived = true;
                }
            }

            if (this.ancestorSpirit.config.relicKey) {
                const firstRelic = this.bestowRelic();
                if (firstRelic) {
                    this.firstRelicReceived = true;
                }
            }
        });
        this.time.delayedCall(SPEECH_DELAY, () => {
            const halfHeight = this.cameras.main.displayHeight / 2
            const speechTextYOffset = (this.hero.entity.y > halfHeight - (this.hero.entity.height * GAME_SCALE)) ? 0 : halfHeight;
            const speechTextY = this.cameras.main.displayHeight * .1 + speechTextYOffset;
            const speechText = `${TEXT_ANCESTOR_FREED_SPEECH}\n\n${this.ancestorSpirit.config.tokenKey ? TEXT_ANCESTOR_BESTOWED_TOKEN_CTA : TEXT_ANCESTOR_FREED_CTA}`;
            this.speechText = new TypewriterText(speechText, this, speechTextY, TYPEWRITER_WORD_INTERVAL, () => {
                this.sound.play('glory');
                this.input.keyboard.on('keydown', this.nextMap, this);
                this.input.on('pointerdown', this.nextMap, this);
                this.input.gamepad.on('down', this.nextMap, this);
            });
        });
    }

    createAncestorSpirit(siteConfig: SiteConfig) {
        this.hero.currentDirection = CARDINAL_DIRECTION.RIGHT;
        const ancestorPlacementX = this.hero.entity.x + this.hero.entity.displayWidth;
        const ancestorPlacementY = this.hero.entity.y + this.hero.entity.displayHeight;

        const ancestorConfigTypeKey = weightedRandomizeAnything(siteConfig.ancestorTypeWeights);
        const ancestorConfig = ANCESTOR_CONFIGS.find(ac => ac.key == ancestorConfigTypeKey) ?? ANCESTOR_CONFIGS[0];
        const ancestorImage = this.add.image(ancestorPlacementX, ancestorPlacementY, ANCESTORS_TEXTURE_KEY, 0);
        ancestorImage.setScale(GAME_SCALE);
        ancestorImage.setTint(ancestorConfig.overrideTint ?? siteConfig.defaultTileTint);
        const ancestorMaskShape = this.make.graphics({});
        ancestorMaskShape.fillStyle(0xffffff);
        ancestorMaskShape.fillRect(ancestorPlacementX - ancestorImage.displayWidth / 2, this.hero.entity.y - ancestorImage.displayHeight / 2, ancestorImage.displayWidth, ancestorImage.displayHeight);
        ancestorImage.setMask(ancestorMaskShape.createGeometryMask());
        this.ancestorSpirit = {
            image: ancestorImage,
            config: ancestorConfig
        };
        this.cameras.main.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB);
        this.tweens.add({
            targets: ancestorImage,
            y: this.hero.entity.y,
            duration: ANCESTOR_LEVITATION_DURATION,
        });
    }

    nextMap() {
        if (!this.isMovingOn) {
            this.isMovingOn = true;

            this.sound.play('spirit', { rate: 1.2 });

            const cam = this.cameras.main;

            // relics take precedence over tokens when both are present
            if (this.ancestorSpirit.config.relicKey) {
                this.ancestorSpirit.image.setVisible(false);

                if (this.firstRelicReceived) {
                    this.firstRelicReceived = false;
                    this.showFirstRelicMessage(this.ancestorSpirit.config.relicKey!);

                    this.relic = this.createRelic();

                    this.time.delayedCall(1, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
                    this.time.delayedCall(FLASH_DELAY, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));

                    return; // wait for scheduleTransition later via input
                } else {
                    this.relic = this.createRelic();
                }
            } else if (this.ancestorSpirit.config.tokenKey) {
                this.ancestorSpirit.image.setVisible(false);

                if (this.firstTokenReceived) {
                    // show the tutorial tip immediately alongside the token
                    this.firstTokenReceived = false;
                    this.showFirstTokenMessage(this.ancestorSpirit.config.tokenKey!);

                    // create the token
                    this.token = this.createToken();

                    // fire the immediate flashes (same as before)
                    this.time.delayedCall(1, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
                    this.time.delayedCall(FLASH_DELAY, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));

                    // do not schedule the fadeout yet – it will happen in
                    // scheduleTransition when the player presses a key after the
                    // token animation completes.
                    return;
                } else {
                    this.token = this.createToken();
                }
            }

            // if we reach here either there's no relevant drop or it wasn't a
            // first-time receipt; transition immediately.
            this.time.delayedCall(1, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
            this.time.delayedCall(FLASH_DELAY, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
            this.scheduleTransition();
        }
    }

    /**
     * Adds the bestowed token to the registry and returns true if this is the
     * first time the player has ever received this particular token type.
     */
    bestowToken(): boolean {
        const inventory = this.registry.get(INVENTORY_TOKENS_REGISTRY_KEY) || [];
        const currentTokenType = inventory.find(i => i.inventoryItemKey == this.ancestorSpirit.config.tokenKey);
        const firstTime = currentTokenType === undefined;
        if (firstTime) {
            inventory.push({ inventoryItemKey: this.ancestorSpirit.config.tokenKey, quantity: 1 });
        } else {
            currentTokenType.quantity++;
        }
        this.registry.set(INVENTORY_TOKENS_REGISTRY_KEY, inventory);
        return firstTime;
    }

    /**
     * Adds the bestowed relic to the registry and returns true if this is the
     * first time the player has ever received this particular relic type.
     */
    bestowRelic(): boolean {
        const inventory = this.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const currentRelicType = inventory.find(i => i.inventoryItemKey == this.ancestorSpirit.config.relicKey);
        const firstTime = currentRelicType === undefined;
        if (firstTime) {
            inventory.push({ inventoryItemKey: this.ancestorSpirit.config.relicKey, quantity: 1 });
        } else {
            currentRelicType.quantity++;
        }
        this.registry.set(INVENTORY_RELICS_REGISTRY_KEY, inventory);
        return firstTime;
    }

    /**
     * Instantiate a token and optionally run a callback when its final animation
     * completes.
     */
    createToken() {
        const tokenConfig = TOKEN_CONFIGS.find(tC => tC.key === this.ancestorSpirit.config.tokenKey);
        if (!tokenConfig) {
            console.warn('createToken called but no config for', this.ancestorSpirit.config.tokenKey);
            return;
        }
        return new Token(this, this.ancestorSpirit.image.x, this.ancestorSpirit.image.y, STATIC_TEXTURE_KEY, tokenConfig);
    }

    /**
     * Instantiate a relic and optionally run a callback when its animation completes.
     */
    createRelic() {
        const relicConfig = RELIC_CONFIGS.find(rC => rC.key === this.ancestorSpirit.config.relicKey);
        if (!relicConfig) {
            console.warn('createRelic called but no config for', this.ancestorSpirit.config.relicKey);
            return;
        }
        return new Relic(this, this.ancestorSpirit.image.x, this.ancestorSpirit.image.y, STATIC_TEXTURE_KEY, relicConfig);
    }

    /**
     * Return the y coordinate where speech text is displayed (same calculation
     * used in the initial speech).  Extracted to avoid duplication.
     */
    private getSpeechTextY(): number {
        const halfHeight = this.cameras.main.displayHeight / 2;
        const speechTextYOffset = (this.hero.entity.y > halfHeight - (this.hero.entity.height * GAME_SCALE)) ? 0 : halfHeight;
        return this.cameras.main.displayHeight * .1 + speechTextYOffset;
    }

    private showFirstTokenMessage(tokenKey: string) {
        if (this.speechText) {
            this.speechText.destroy();
        }

        const name = tokenKey.charAt(0).toUpperCase() + tokenKey.slice(1);
        const message = TEXT_FIRST_TOKEN_RECEIVED(name);
        this.speechText = new TypewriterText(message, this, this.getSpeechTextY(), TYPEWRITER_WORD_INTERVAL, () => {
            // once the token message has finished displaying, allow the player
            // to press a key (or click/tap) to continue.
            this.input.keyboard.on('keydown', this.scheduleTransition, this);
            this.input.on('pointerdown', this.scheduleTransition, this);
            this.input.gamepad.on('down', this.scheduleTransition, this);
        });
    }

    private showFirstRelicMessage(relicKey: string) {
        if (this.speechText) {
            this.speechText.destroy();
        }

        const relicConfig = RELIC_CONFIGS.find(r => r.key === relicKey);
        const message = relicConfig ? relicConfig.description : '';
        this.speechText = new TypewriterText(message, this, this.getSpeechTextY(), TYPEWRITER_WORD_INTERVAL, () => {
            this.input.keyboard.on('keydown', this.scheduleTransition, this);
            this.input.on('pointerdown', this.scheduleTransition, this);
            this.input.gamepad.on('down', this.scheduleTransition, this);
        });
    }

    /**
     * Called when the scene should begin its camera fade and eventually switch
     * back to the overworld.  This is extracted so both the standard path and
     * the delayed (first-token) path can reuse it.
     */
    private scheduleTransition() {
        // detach any auxiliary listeners added by the token callback
        this.input.keyboard.off('keydown', this.scheduleTransition, this);
        this.input.off('pointerdown', this.scheduleTransition, this);
        this.input.gamepad.off('down', this.scheduleTransition, this);

        // animate the token or relic to the inventory if present
        if (this.token && this.token.visible) {
            this.token.animateToInventory(() => {
                this.token = undefined;
            });
        }
        if (this.relic && this.relic.visible) {
            this.relic.animateToInventory(() => {
                this.relic = undefined;
            });
        }

        const cam = this.cameras.main;
        const delay = (this.ancestorSpirit.config.tokenKey || this.ancestorSpirit.config.relicKey) ? 5 * FADEOUT_DELAY : FADEOUT_DELAY;
        this.time.delayedCall(delay, () => {
            cam.fade(FADEOUT_DURATION, FADEOUT_RGB, FADEOUT_RGB, FADEOUT_RGB, false);
            cam.once('camerafadeoutcomplete', () => {
                const sceneConfig = {
                    mapConfigName: 'forest_temples',
                };
                (this.scene.get(this.callingSceneKey) as SiteScene).clearListeners();
                this.scene.stop(this.callingSceneKey);
                this.scene.start(SITE_TYPES.overworld, sceneConfig);
            });
        });
    }
}