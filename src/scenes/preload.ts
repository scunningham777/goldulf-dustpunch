import { STATIC_TEXTURE_KEY, TERRAIN_TEXTURE_KEY, UI_TEXTURE_KEY } from "../constants";

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
        })
    }

}
