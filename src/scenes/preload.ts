import { ANCESTORS_TEXTURE_KEY, HERO_MOVEMENT_CONTROLLER, HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, HERO_TEXTURE_KEY, SITE_DATA_REGISTRY_KEY, STATIC_TEXTURE_KEY, TERRAIN_TEXTURE_KEY, UI_SCENE_KEY, UI_TEXTURE_KEY } from "../constants";
import { SiteGenerationData } from "../interfaces/siteGenerationData";
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
        this.load.spritesheet(HERO_TEXTURE_KEY, 'assets/sprites/hero_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
        this.load.spritesheet(ANCESTORS_TEXTURE_KEY, 'assets/sprites/ancestors_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });

        this.load.audio('dust', 'assets/sounds/dust1.wav');
        this.load.audio('step', 'assets/sounds/step1.wav');
        this.load.audio('punch1', 'assets/sounds/punch1.wav');
        this.load.audio('punch2', 'assets/sounds/punch2.wav');
        this.load.audio('type', 'assets/sounds/type.wav');
        this.load.audio('glory', 'assets/sounds/deep_glory.wav');
        this.load.audio('spirit', 'assets/sounds/spirited_away.wav');

        this.load.script('webfont', 'https://cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js');
    }

    create(): void {
        WebFont.load({
            custom: {
                families: [ '7_12' ]
            },
            active: () => {
                const siteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
                if (!!siteData) {
                    this.scene.launch(UI_SCENE_KEY);
                    this.scene.start(siteData.siteType, {mapConfigName: siteData.siteConfigName, mapConfigCategory: null});
                } else {
                    this.scene.start('GameTitle');
                }
            }
        });
    }

}
