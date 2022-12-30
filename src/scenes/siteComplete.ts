import { ANCESTOR_CONFIGS, TOKEN_CONFIGS } from "../config";
import { ANCESTORS_TEXTURE_KEY, GAME_SCALE, HERO_FRAMES, INVENTORY_TOKENS_REGISTRY_KEY, SITE_TYPES, STATIC_TEXTURE_KEY, TYPEWRITER_WORD_INTERVAL } from "../constants";
import { AncestorConfig } from "../interfaces/ancestorConfig";
import { SiteConfig } from "../interfaces/siteConfig";
import { Hero } from "../objects/hero";
import { Token } from "../objects/token";
import { TypewriterText } from "../objects/typewriterText";
import { TEXT_ANCESTOR_BESTOWED_TOKEN_CTA, TEXT_ANCESTOR_FREED_CTA, TEXT_ANCESTOR_FREED_SPEECH } from "../text";
import { CARDINAL_DIRECTION, weightedRandomizeAnything } from "../utils";
import { SiteScene } from "./site";

export interface SiteCompleteSceneProps {
    heroDisplayX: number;
    heroDisplayY: number;
    heroDirection: CARDINAL_DIRECTION;
    siteConfig: SiteConfig;
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
    
    create(): void {
        this.add.graphics();

        this.isMovingOn = false;

        const {heroDisplayX, heroDisplayY, heroDirection, siteConfig} = this.scene.settings.data as SiteCompleteSceneProps;
        this.hero = new Hero(heroDisplayX, heroDisplayY, this, 0, heroDirection)
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection]);

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
                this.bestowToken();
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

        const ancestorConfigTypeKey =  weightedRandomizeAnything(siteConfig.ancestorTypeWeights);
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

            this.sound.play('spirit', {rate: 1.2});

            if (this.ancestorSpirit.config.tokenKey) {
                this.ancestorSpirit.image.setVisible(false);
                this.createToken();
            }
            
            const cam = this.cameras.main;
            this.time.delayedCall(1, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
            this.time.delayedCall(FLASH_DELAY, () => cam.flash(FLASH_DURATION, FLASH_RGB, FLASH_RGB, FLASH_RGB));
            this.time.delayedCall(this.ancestorSpirit.config.tokenKey ? 5 * FADEOUT_DELAY : FADEOUT_DELAY, () => {
                cam.fade(FADEOUT_DURATION, FADEOUT_RGB, FADEOUT_RGB, FADEOUT_RGB, false);
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
        const inventory = this.registry.get(INVENTORY_TOKENS_REGISTRY_KEY) || [];
        const currentTokenType = inventory.find(i => i.inventoryItemKey == this.ancestorSpirit.config.tokenKey);
        if (currentTokenType === undefined) {
            inventory.push({inventoryItemKey: this.ancestorSpirit.config.tokenKey, quantity: 1})
        } else {
            currentTokenType.quantity++;
        }
        this.registry.set(INVENTORY_TOKENS_REGISTRY_KEY, inventory);
    }

    createToken() {
        const tokenConfig = TOKEN_CONFIGS.find(tC => tC.key === this.ancestorSpirit.config.tokenKey);
        const token = new Token(this, this.ancestorSpirit.image.x, this.ancestorSpirit.image.y, STATIC_TEXTURE_KEY, tokenConfig);
    }
}