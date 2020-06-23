import Hero from '../objects/hero';
import { WORLD_WIDTH, WORLD_HEIGHT, GAME_SCALE } from '../constants';
import { Cardinal_Direction } from '../utils';

const MAP_KEY = 'dungeon-map';
const LAYER_KEYS = {
    BG_LAYER: 'bg-layer',
    STUFF_LAYER: 'stuff-layer',
    DUST_LAYER: 'dust-layer',
};

export class DungeonScene extends Phaser.Scene {

    private hero: Hero;
    private cursors: any;
    private dungeon: Phaser.Physics.Arcade.Image;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private tileset: Phaser.Tilemaps.Tileset;

    create(): void {
        this.createMap();
        this.createHero();
        this.addCollisions();
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(): void {
        if (!!this.hero) {
            this.hero.update(this.cursors);
        }
    }
    
    createMap() {
        this.map = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: 30,
            height: 30,
            key: MAP_KEY,
        });
        this.tileset = this.map.addTilesetImage('terrain', 'terrain', 32, 32);
        for (const keyIndex in LAYER_KEYS) {
            this.mapLayers.set(LAYER_KEYS[keyIndex], this.map.createBlankDynamicLayer(LAYER_KEYS[keyIndex], this.tileset));
        }
        
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).fill(30);
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).setScale(GAME_SCALE);
        
        this.addDungeons();
    }

    createHero() {
        this.hero = new Hero(100, WORLD_HEIGHT / 2, this, 360, Cardinal_Direction.RIGHT);
    }

    addDungeons() {
        
        this.dungeon = new Phaser.Physics.Arcade.Image(this, WORLD_WIDTH - 100, WORLD_HEIGHT / 2, 'terrain', 26);
        this.dungeon.setScale(GAME_SCALE);
        this.physics.world.enable(this.dungeon);

        this.add.existing(this.dungeon);
    }

    addCollisions() {
        // collisions between player and dungeon icons
        this.physics.add.overlap(this.hero.entity, this.dungeon, this.enterDungeon.bind(this))
    }

    enterDungeon() {
        this.scene.start('Overworld');
    }
}
