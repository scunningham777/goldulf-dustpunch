export class PreloadScene extends Phaser.Scene {

    preload(): void {

        this.load.crossOrigin = 'anonymous';
        this.load.maxParallelDownloads = Infinity;
        
        this.load.image('terrain_16', 'assets/sprites/terrain_16_extruded.png');

        this.load.spritesheet('stuff', 'assets/sprites/stuff_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
        this.load.spritesheet('hero', 'assets/sprites/hero_extruded.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
    }

    create(): void {
        this.scene.start('GameTitle');
    }

}
