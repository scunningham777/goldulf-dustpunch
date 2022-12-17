import TextTyping from 'phaser3-rex-plugins/plugins/texttyping.js';

import { ANCESTORS_TEXTURE_KEY, GAME_SCALE, HERO_FRAMES, REX_SHAKE_POSITION_PLUGIN_KEY, REX_TEXT_TYPING_PLUGIN_KEY, SITE_TYPES, STATIC_TEXTURE_KEY, TYPEWRITER_WORD_INTERVAL } from "../constants";
import Hero from "../objects/hero";
import { ModalMenu } from '../objects/modalMenu';
import { TypewriterText } from "../objects/typewriterText";
import { TEXT_ANCESTOR_FREED_SPEECH } from '../text';
import { CARDINAL_DIRECTION } from "../utils";
import { SiteScene } from "./site";

export interface SiteCompleteSceneProps {
    heroDisplayX: number;
    heroDisplayY: number;
    heroDirection: CARDINAL_DIRECTION;
    miniBossFrame: number;
}

const ALPHA_DELAY = 500;
const FLASH_DELAY = 200;
const SPEECH_DELAY = 600;
const MINIBOSS_SCALE = 3;
const MINIBOSS_SHAKE_DURATION = 300;
const MINIBOSS_BURST_DURATION = 1200;
const SCENE_PADDING_FACTOR = .07;

export class SiteCompleteScene extends Phaser.Scene {
    private hero: Hero;
    private ancestorSpirit: Phaser.GameObjects.Image;
    private miniBossFrame: number;
    private miniBoss: Phaser.GameObjects.Image & {shake?: {shake: Function}};
    private background: Phaser.GameObjects.Rectangle;
    private speechText: TextTyping;
    private bossBurstEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private bossFightMenu: ModalMenu;
    
    create(): void {
        const {heroDisplayX, heroDisplayY, heroDirection, miniBossFrame} = this.scene.settings.data as SiteCompleteSceneProps;
        this.hero = new Hero(heroDisplayX, heroDisplayY, this, 0, heroDirection)
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection]);
        this.miniBossFrame = miniBossFrame;

        this.background = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000).setAlpha(.3);
        this.time.delayedCall(ALPHA_DELAY, () => this.background.setAlpha(.5));
        this.time.delayedCall(2 * ALPHA_DELAY, () => this.background.setAlpha(.7));
        this.time.delayedCall(3 * ALPHA_DELAY, () => this.cameras.main.flash(10,150,150,150));
        this.time.delayedCall(3 * ALPHA_DELAY + FLASH_DELAY, () => this.cameras.main.flash(10,150,150,150));
        this.time.delayedCall(3 * ALPHA_DELAY + 2 * FLASH_DELAY, () => {
            this.cameras.main.flash(10,150,150,150);
            this.showMiniBoss();
        });

        this.bossBurstEmitter = this.add.particles('__WHITE').createEmitter({
            name: 'boss_particles',
            x: 0,
            y: 0,
            quantity: -1,
            scale: MINIBOSS_SCALE * .8,
            speed: {end: 0, start: 50 * MINIBOSS_SCALE * 2, random: true},
            angle: {min: 0, max: 360},
            lifespan: MINIBOSS_BURST_DURATION,
        });
        this.bossBurstEmitter.setEmitZone({
            type: 'random',
            source: new Phaser.Geom.Rectangle(-8 * GAME_SCALE * MINIBOSS_SCALE, -16 * GAME_SCALE * MINIBOSS_SCALE, 16 * GAME_SCALE * MINIBOSS_SCALE, 16 * GAME_SCALE * MINIBOSS_SCALE),
        })
    }

    update() {
        if (!!this.bossFightMenu) {
            this.bossFightMenu.update();
        }
    }

    showMiniBoss() {
        let bossPlacementX = this.hero.entity.x - (this.hero.entity.displayWidth * (MINIBOSS_SCALE + 1) / 2);
        if (this.hero.entity.x > this.cameras.main.displayWidth / 2) {
            this.hero.currentDirection = CARDINAL_DIRECTION.LEFT;
        } else {
            this.hero.currentDirection = CARDINAL_DIRECTION.RIGHT;
            bossPlacementX = this.hero.entity.x + (this.hero.entity.displayWidth * (MINIBOSS_SCALE + 1) / 2);
        }
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection] + 2);
        this.miniBoss = this.add.image(bossPlacementX, this.hero.entity.y + this.hero.entity.displayHeight / 2, STATIC_TEXTURE_KEY, this.miniBossFrame);
        this.miniBoss.setScale(GAME_SCALE * MINIBOSS_SCALE);
        this.miniBoss.setOrigin(0.5, 1);
        this.miniBoss.shake = (this.plugins.get(REX_SHAKE_POSITION_PLUGIN_KEY) as any).add(this.miniBoss, {
            duration: MINIBOSS_SHAKE_DURATION,
            mode: 'effect',
        })

        this.bossFightMenu = new ModalMenu(this, {
            x: this.cameras.main.displayWidth / 2,
            y: this.determineOpenYLocation(),
            width: this.cameras.main.displayWidth * .85,
            height: this.miniBoss.y - this.miniBoss.displayHeight - (2 * this.cameras.main.displayHeight * SCENE_PADDING_FACTOR),
            numColumns: 3,
            items: [
                {
                    text: 'Punch',
                    onSelect: this.bossDefeated.bind(this),
                },
                {
                    text: 'Sneeze',
                    onSelect: ()=>{console.log('sneeze')},
                },
                {
                    text: 'Tread On',
                    onSelect: ()=>{},
                },
                {
                    text: 'Taunt',
                    onSelect: ()=>{},
                },
                {
                    text: 'Plead',
                    onSelect: ()=>{},
                },
                {
                    text: 'Doff',
                    onSelect: ()=>{},
                },
                {
                    text: 'Flatter',
                    onSelect: ()=>{},
                },
                {
                    text: 'Jinx',
                    onSelect: ()=>{},
                },
                {
                    text: 'Give Up',
                    onSelect: ()=>{},
                },
            ],
            showCursor: true,
        });

        // this.setAnyInputCallback(this.bossDefeated);
    }

    async heroPunch() {
        return new Promise<void>((resolve, reject) => {
            this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection]);
            this.tweens.add({
                targets: this.hero.entity,
                x: this.miniBoss.x,
                duration: 400,
                ease: 'Quad.easeIn',
                yoyo: true,
                onYoyo: () => {
                    this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection] + 2);
                    resolve();
                }
            })
        });
    }

    async bossHit(shakeDurationMultiplier: number = 1) {
        return new Promise<void>((resolve, reject) => {
            this.miniBoss.shake.shake({
                duration: MINIBOSS_SHAKE_DURATION * shakeDurationMultiplier,
            });
            this.time.delayedCall(MINIBOSS_SHAKE_DURATION * shakeDurationMultiplier, resolve);
        })
    }

    async bossDefeated() {
        this.input.keyboard.off('keydown', this.bossDefeated, this);
        this.input.off('pointerdown', this.bossDefeated, this);
        this.input.gamepad.off('down', this.bossDefeated, this);
        await this.heroPunch();
        await this.bossHit(4);
        this.bossBurstEmitter.explode(100, this.miniBoss.x, this.miniBoss.y);
        this.time.delayedCall(MINIBOSS_BURST_DURATION, () => {
            this.miniBoss.setVisible(false);
            this.bossFightMenu.toggleVisibility(false);
            this.showAncestorSpirit();
        })
    }

    showAncestorSpirit() {
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection] + 2);
        this.ancestorSpirit = this.add.image(this.miniBoss.x, this.hero.entity.y, ANCESTORS_TEXTURE_KEY, 0);
        this.ancestorSpirit.setScale(GAME_SCALE);
        this.time.delayedCall(SPEECH_DELAY, () => {
            const speechTextY = this.determineOpenYLocation();
            const speechTextObj = this.add.text(this.cameras.main.displayWidth / 2, speechTextY, '', {font: `32px '7_12'`, color: '#fff', align: 'center', wordWrap: {width: this.cameras.main.displayWidth * .85}});
            speechTextObj.setOrigin(.5, 0);

            this.speechText = (this.plugins.get(REX_TEXT_TYPING_PLUGIN_KEY) as any).add(speechTextObj, {
                wrap: true,
                speed: TYPEWRITER_WORD_INTERVAL,
            });
            this.speechText.start(TEXT_ANCESTOR_FREED_SPEECH);
            const shortCircuitSpeech = () => {
                this.speechText.stop(true);
            }
            this.setAnyInputCallback(shortCircuitSpeech);
            this.speechText.on('complete', () => {
                this.clearAnyInputCallback(shortCircuitSpeech);
                // this.setAnyInputCallback(this.nextMap);
            })
            // this, speechTextY, TYPEWRITER_WORD_INTERVAL, () => {
            //     this.sound.play('glory');
            //     this.input.keyboard.on('keydown', this.nextMap, this);
            //     this.input.on('pointerdown', this.nextMap, this);
            //     this.input.gamepad.on('down', this.nextMap, this);
            // });
        });
    }

    nextMap() {
        this.sound.play('spirit', {rate: 1.2});

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

    private setAnyInputCallback(callback: Function) {
        this.input.keyboard.on('keydown', callback, this);
        this.input.on('pointerdown', callback, this);
        this.input.gamepad.on('down', callback, this);
    }
    private clearAnyInputCallback(callback: Function) {
        this.input.keyboard.off('keydown', callback, this);
        this.input.off('pointerdown', callback, this);
        this.input.gamepad.off('down', callback, this);
    }

    private determineOpenYLocation(): number {
        const halfHeight = this.cameras.main.displayHeight / 2
        const heightOffset = (this.hero.entity.y > halfHeight - (this.hero.entity.height * GAME_SCALE)) ? 0 : halfHeight;
        return this.cameras.main.displayHeight * SCENE_PADDING_FACTOR + heightOffset;
    }
}