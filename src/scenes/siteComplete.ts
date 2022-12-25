import { ANCESTOR_CONFIGS } from "../config";
import { ANCESTORS_TEXTURE_KEY, GAME_SCALE, HERO_FRAMES, INVENTORY_TOKENS_REGISTRY_KEY, SITE_TYPES, STUFF_TINT, TYPEWRITER_WORD_INTERVAL } from "../constants";
import { AncestorConfig } from "../interfaces/ancestorConfig";
import { SiteConfig } from "../interfaces/siteConfig";
import { Hero } from "../objects/hero";
import { TypewriterText } from "../objects/typewriterText";
import { CARDINAL_DIRECTION, weightedRandomizeAnything } from "../utils";
import { SiteScene } from "./site";

export interface SiteCompleteSceneProps {
    heroDisplayX: number;
    heroDisplayY: number;
    heroDirection: CARDINAL_DIRECTION;
    siteConfig: SiteConfig;
}

const ALPHA_DELAY = 500;
const FLASH_DELAY = 200;
const SPEECH_DELAY = 600;


export class SiteCompleteScene extends Phaser.Scene {
    private hero: Hero;
    private ancestorSpirit: {
        image: Phaser.GameObjects.Image,
        config: AncestorConfig,
    };
    private background: Phaser.GameObjects.Rectangle;
    private speechText: TypewriterText;
    private isMovingOn: boolean;
    
    create(): void {
        this.isMovingOn = false;
        
        const {heroDisplayX, heroDisplayY, heroDirection, siteConfig} = this.scene.settings.data as SiteCompleteSceneProps;
        this.hero = new Hero(heroDisplayX, heroDisplayY, this, 0, heroDirection)
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection]);

        this.background = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000).setAlpha(.3);
        this.time.delayedCall(ALPHA_DELAY, () => this.background.setAlpha(.5));
        this.time.delayedCall(2 * ALPHA_DELAY, () => this.background.setAlpha(.7));
        this.time.delayedCall(3 * ALPHA_DELAY, () => this.cameras.main.flash(10));
        this.time.delayedCall(3 * ALPHA_DELAY + FLASH_DELAY, () => this.cameras.main.flash(10));
        this.time.delayedCall(3 * ALPHA_DELAY + 2 * FLASH_DELAY, () => {
            this.cameras.main.flash(10);
            
            this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection] + 2);

            this.createAncestorSpirit(siteConfig);
        });
        this.time.delayedCall(3 * ALPHA_DELAY + 2 * FLASH_DELAY + SPEECH_DELAY, () => {
            const halfHeight = this.cameras.main.displayHeight / 2
            const speechTextYOffset = (this.hero.entity.y > halfHeight - (this.hero.entity.height * GAME_SCALE)) ? 0 : halfHeight;
            const speechTextY = this.cameras.main.displayHeight * .1 + speechTextYOffset;
            const speechText = 'Trapped here for centuries by the final curse of Goldulf, my spirit has at last been set free by your fastidious fistwork!\n\nPunch on to free the rest of our bodacious bloodline!';
            this.speechText = new TypewriterText(speechText, this, speechTextY, TYPEWRITER_WORD_INTERVAL, () => {
                this.sound.play('glory');
                this.input.keyboard.on('keydown', this.nextMap, this);
                this.input.on('pointerdown', this.nextMap, this);
                this.input.gamepad.on('down', this.nextMap, this);
            });
        });
    }

    createAncestorSpirit(siteConfig: SiteConfig) {
        let ancestorPlacementX = this.hero.entity.x - this.hero.entity.displayWidth;
        if (this.hero.entity.x > this.cameras.main.displayWidth / 2) {
            this.hero.currentDirection = CARDINAL_DIRECTION.LEFT;
        } else {
            this.hero.currentDirection = CARDINAL_DIRECTION.RIGHT;
            ancestorPlacementX = this.hero.entity.x + this.hero.entity.displayWidth;
        }

        const ancestorConfigTypeKey =  weightedRandomizeAnything(siteConfig.ancestorTypeWeights);
        const ancestorConfig = ANCESTOR_CONFIGS.find(ac => ac.key == ancestorConfigTypeKey) ?? ANCESTOR_CONFIGS[0];
        const ancestorImage = this.add.image(ancestorPlacementX, this.hero.entity.y, ANCESTORS_TEXTURE_KEY, 0);
        ancestorImage.setScale(GAME_SCALE);
        ancestorImage.setTint(ancestorConfig.overrideTint ?? siteConfig.defaultTileTint);
        this.ancestorSpirit = {
            image: ancestorImage,
            config: ancestorConfig
        };
    }

    nextMap() {
        if (!this.isMovingOn) {
            this.isMovingOn = true;

            this.sound.play('spirit', {rate: 1.2});
            
            if (this.ancestorSpirit.config.tokenKey) {
                this.bestowToken();
            }
            
            const cam = this.cameras.main;
            this.time.delayedCall(1, () => cam.flash(10));
            this.time.delayedCall(FLASH_DELAY, () => cam.flash(10));
            this.time.delayedCall(FLASH_DELAY * 2, () => cam.flash(10));
            this.time.delayedCall(FLASH_DELAY * 3, () => cam.flash(10));
            this.time.delayedCall(FLASH_DELAY * 6, () => {
                cam.fade(700, 255, 255, 255, false);
                cam.once('camerafadeoutcomplete', () => {
                    const sceneConfig = {
                        mapConfigName: 'forest_temples',
                    };
                    (this.scene.get(SITE_TYPES.site) as SiteScene).clearListeners();
                    this.scene.stop(SITE_TYPES.site);
                    this.scene.start(SITE_TYPES.overworld, sceneConfig);
                });
            });
        }
    }

    bestowToken() {
        console.log('you get a token called: ', this.ancestorSpirit.config.tokenKey);
        const inventory = this.registry.get(INVENTORY_TOKENS_REGISTRY_KEY) || [];
        const currentTokenType = inventory.find(i => i.inventoryItemKey == this.ancestorSpirit.config.tokenKey);
        if (currentTokenType === undefined) {
            inventory.push({inventoryItemKey: this.ancestorSpirit.config.tokenKey, quantity: 1})
        } else {
            currentTokenType.quantity++;
        }
        this.registry.set(INVENTORY_TOKENS_REGISTRY_KEY, inventory);
    }
}