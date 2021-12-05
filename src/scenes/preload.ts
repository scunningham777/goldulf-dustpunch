import { HERO_MOVEMENT_CONTROLLER, HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, STATIC_TEXTURE_KEY, TERRAIN_TEXTURE_KEY, UI_TEXTURE_KEY } from "../constants";
import { FOLLOW_HERO_MOVEMENT_CONTROLLER } from "../objects/followHeroMovmentController";
import { JOYSTICK_HERO_MOVEMENT_CONTROLLER } from "../objects/joystickHeroMovementController";

declare namespace WebFont {
    function load(config: any): any;
}

export class PreloadScene extends Phaser.Scene {

    preload(): void {

        this.load.crossOrigin = 'anonymous';
        this.load.maxParallelDownloads = Infinity;
        
        this.load.spritesheet(TERRAIN_TEXTURE_KEY, 'assets/sprites/terrain_16_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
        this.load.spritesheet(STATIC_TEXTURE_KEY, 'assets/sprites/stuff_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
        this.load.spritesheet(UI_TEXTURE_KEY, 'assets/sprites/ui_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
        this.load.spritesheet('hero', 'assets/sprites/hero_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });

        this.load.audio('dust', 'assets/sounds/dust1.wav');
        this.load.audio('punch1', 'assets/sounds/punch1.wav');
        this.load.audio('punch2', 'assets/sounds/punch2.wav');

        this.load.script('webfont', 'https://cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js');
    }

    create(): void {
        WebFont.load({
            custom: {
                families: [ '7_12' ]
            },
            active: () => {
                this.scene.start('GameTitle');
            }
        });

        const heroMvtCtrl = HERO_MOVEMENT_CONTROLLER === 'joystick' ? JOYSTICK_HERO_MOVEMENT_CONTROLLER : FOLLOW_HERO_MOVEMENT_CONTROLLER;
        this.registry.set(HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, heroMvtCtrl);
    }

}
