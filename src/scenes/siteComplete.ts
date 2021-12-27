import { HERO_FRAMES, SITE_COMPLETE_SCENE_KEY, SITE_TYPES, TYPEWRITER_WORD_INTERVAL } from "../constants";
import { AreaConfig } from "../interfaces/areaConfig";
import { SiteConfig } from "../interfaces/siteConfig";
import Hero from "../objects/hero";
import { TypewriterText } from "../objects/typewriterText";
import { CARDINAL_DIRECTION } from "../utils";
import { SiteScene } from "./site";

export interface SiteCompleteSceneProps {
    heroDisplayX: number;
    heroDisplayY: number;
    heroDirection: CARDINAL_DIRECTION;
}

const ALPHA_DELAY = 500;
const FLASH_DELAY = 200;
const SPEECH_DELAY = 600;


export class SiteCompleteScene extends Phaser.Scene {
    private hero: Hero;
    private ancestorSpirit: Hero;
    private background: Phaser.GameObjects.Rectangle;
    private speechText: TypewriterText;
    
    create(): void {
        const {heroDisplayX, heroDisplayY, heroDirection} = this.scene.settings.data as SiteCompleteSceneProps;
        this.hero = new Hero(heroDisplayX, heroDisplayY, this, 0, heroDirection)
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection]);

        this.background = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000).setAlpha(.3);
        this.time.delayedCall(ALPHA_DELAY, () => this.background.setAlpha(.5));
        this.time.delayedCall(2 * ALPHA_DELAY, () => this.background.setAlpha(.7));
        this.time.delayedCall(3 * ALPHA_DELAY, () => this.cameras.main.flash(10));
        this.time.delayedCall(3 * ALPHA_DELAY + FLASH_DELAY, () => this.cameras.main.flash(10));
        this.time.delayedCall(3 * ALPHA_DELAY + 2 * FLASH_DELAY, () => {
            this.cameras.main.flash(10);
            
            let ancestorPlacementX = this.hero.entity.x - this.hero.entity.displayWidth;
            if (this.hero.entity.x > this.cameras.main.displayWidth / 2) {
                this.hero.currentDirection = CARDINAL_DIRECTION.LEFT;
            } else {
                this.hero.currentDirection = CARDINAL_DIRECTION.RIGHT;
                ancestorPlacementX = this.hero.entity.x + this.hero.entity.displayWidth;
            }
            
            this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection] + 2);
            this.ancestorSpirit = new Hero(ancestorPlacementX, this.hero.entity.y, this, 0, CARDINAL_DIRECTION.DOWN);
            this.ancestorSpirit.entity.setTint(0xffffff);
        });
        this.time.delayedCall(3 * ALPHA_DELAY + 2 * FLASH_DELAY + SPEECH_DELAY, () => {
            const halfHeight = this.cameras.main.displayHeight / 2
            const speechTextYOffset = (this.hero.entity.y > halfHeight) ? 0 : halfHeight;
            const speechTextY = this.cameras.main.displayHeight * .15 + speechTextYOffset;
            const speechText = 'Trapped here for centuries by the final curse of Goldulf, my spirit has at last been set free by your fastidious fistwork.';
            this.speechText = new TypewriterText(speechText, this, speechTextY, TYPEWRITER_WORD_INTERVAL, () => {
                this.input.keyboard.on('keydown', this.nextMap, this);
                this.input.on('pointerdown', this.nextMap, this);
            });
        });
    }

    nextMap() {
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0, false, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
            if (progress >= .5) {
                
            }
        });
        cam.once('camerafadeoutcomplete', () => {
            const sceneConfig = {
                mapConfigName: 'forest_temples',
            };
            (this.scene.get(SITE_TYPES.site) as SiteScene).clearListeners();
            this.scene.stop(SITE_TYPES.site);
            this.scene.start(SITE_TYPES.overworld, sceneConfig);
        });
    }
}