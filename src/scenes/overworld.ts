import Hero from '../objects/hero';
import { WORLD_WIDTH, WORLD_HEIGHT, GAME_SCALE } from '../constants';
import generateDungeon from '../dungeon_generator/dungeon_generator_cave';

const MAP_KEY = 'overworld-map';
const LAYER_KEYS = {
    BG_LAYER: 'bg-layer',
    STUFF_LAYER: 'stuff-layer',
};
const TILESET_KEY = 'terrain';

export class OverworldScene extends Phaser.Scene {

    private hero: Hero;
    private cursors: any;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private hasHeroReachedExit = false;
    private startingCountAreas = 2;
    private get greatestXCoord(): number {
        return this.map.width - 1;
    }
    private get greatestYCoord(): number {
        return this.map.height - 1;
    }
    private tileset: Phaser.Tilemaps.Tileset;
    private dungeon: Phaser.Physics.Arcade.Image;

    /* lifecycle methods */
    create(): void {
        this.createMap();
        this.createHero();
        this.addCollisions();
        this.initInput();
        this.initCamera();
    }

    update(): void {
        if (!!this.hero) {
            this.hero.update(this.cursors);
        }
    }
    /* end lifecycle */

    createMap() {
        this.map = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: 30,
            height: 30,
            key: MAP_KEY,
        });
        // generateDungeon(
        //     this.map,
        //     TILESET_KEY,
        //     this.mapLayers,
        //     this.startingCountAreas,
        //     [
        //         {index: 2, weight: 1},
        //         {index: 3, weight: 1},
        //     ],


        // )
        this.tileset = this.map.addTilesetImage('terrain', 'terrain', 32, 32);
        for (const keyIndex in LAYER_KEYS) {
            this.mapLayers.set(LAYER_KEYS[keyIndex], this.map.createBlankDynamicLayer(LAYER_KEYS[keyIndex], this.tileset));
        }
        
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).fill(5);
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).setScale(GAME_SCALE);

        this.addDungeons();
    }
    
    createHero() {
        this.hero = new Hero(WORLD_WIDTH / 2, 100, this, 260);
    }

    addDungeons() {
        this.dungeon = new Phaser.Physics.Arcade.Image(this, WORLD_WIDTH / 2, WORLD_HEIGHT - 100, 'terrain', 1);
        this.dungeon.setScale(GAME_SCALE);
        this.physics.world.enable(this.dungeon);

        this.add.existing(this.dungeon);
    }

    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between player and dungeon icons
        this.physics.add.overlap(this.hero.entity, this.dungeon, this.enterDungeon.bind(this))
    }

    enterDungeon() {
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once('camerafadeoutcomplete', () => {
            this.scene.start('Dungeon');
        });
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    initCamera() {
        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = this.cameras.main;

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        camera.startFollow(this.hero.entity);
    }
}
