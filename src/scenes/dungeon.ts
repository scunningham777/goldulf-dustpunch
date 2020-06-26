import Hero from '../objects/hero';
import { WORLD_WIDTH, WORLD_HEIGHT, GAME_SCALE } from '../constants';
import { Cardinal_Direction } from '../utils';
import MapArea from '../objects/map-area';

const MAP_KEY = 'dungeon-map';
const LAYER_KEYS = {
    BG_LAYER: 'bg-layer',
    STUFF_LAYER: 'stuff-layer',
    DUST_LAYER: 'dust-layer',
};

export class DungeonScene extends Phaser.Scene {

    private hero: Hero;
    private cursors: any;
    private heroStartDirection: Cardinal_Direction;
    private areas: MapArea[];
    private entranceX: number;
    private entranceY: number;
    private exit: Phaser.Physics.Arcade.Image;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private tileset: Phaser.Tilemaps.Tileset;
    private hasHeroReachedExit = false;

    /* lifecycle methods */
    create(): void {
        this.createMap();
        this.createHero();
        this.addCollisions();
        this.initInput();
        this.initCamera();
    }

    update(): void {
        if (!!this.hero && !this.hasHeroReachedExit) {
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

        this.tileset = this.map.addTilesetImage('terrain', 'terrain', 32, 32);
        for (const keyIndex in LAYER_KEYS) {
            this.mapLayers.set(LAYER_KEYS[keyIndex], this.map.createBlankDynamicLayer(LAYER_KEYS[keyIndex], this.tileset));
        }
        
        this.fillMap();
        this.generateAreas();
        this.drawAreas();
        this.connectAreas();
        
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).setScale(GAME_SCALE);
    }
    
    createHero() {
        this.hasHeroReachedExit = false;
        const entranceXInPixels = (this.areas[0].x + .5) * (this.map.tileWidth * GAME_SCALE);
        const entranceYInPixels = (this.areas[0].y + .5) * (this.map.tileHeight * GAME_SCALE);
        this.hero = new Hero(entranceXInPixels , entranceYInPixels, this, 360, this.heroStartDirection);
    }

    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between hero and exit icons
        // this.mapLayers.get(LAYER_KEYS.STUFF_LAYER).setTileIndexCallback()
        this.physics.add.overlap(this.hero.entity, this.exit, this.exitDungeon.bind(this))
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

    fillMap() {
        // this.mapLayers.get(LAYER_KEYS.BG_LAYER).fill(30);
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).weightedRandomize(0, 0, this.map.width, this.map.height, [
            {index: 53, weight: 9},
            {index: 52, weight: 1},
        ]);
    }
    
    generateAreas() {
        this.areas = [];
        this.generateDoorAreas();
        this.generateOtherAreas();
    }

    drawAreas() {
        const bgLayer = this.mapLayers.get(LAYER_KEYS.BG_LAYER);
        bgLayer.putTileAt(50, this.areas[0].x, this.areas[0].y);
    }
    
    connectAreas() {
        
    }
    
    generateDoorAreas() {
        const entranceDirection = Phaser.Math.RND.pick(Object.keys(Cardinal_Direction));
        let entranceX = 0;
        let entranceY = 0;
        switch(entranceDirection) {
            case Cardinal_Direction.UP: 
                entranceX = Phaser.Math.RND.integerInRange(1, this.map.width-2);

                this.heroStartDirection = Cardinal_Direction.DOWN;
                break;
            case Cardinal_Direction.RIGHT:
                entranceX = this.map.width-1;
                entranceY = Phaser.Math.RND.integerInRange(1, this.map.height-2);

                this.heroStartDirection = Cardinal_Direction.LEFT;
                break;
            case Cardinal_Direction.DOWN:
                entranceX = Phaser.Math.RND.integerInRange(1, this.map.width-2);
                entranceY = this.map.height-1;

                this.heroStartDirection = Cardinal_Direction.UP;
                break;
            case Cardinal_Direction.LEFT:
                entranceY = Phaser.Math.RND.integerInRange(1, this.map.height-2);

                this.heroStartDirection = Cardinal_Direction.RIGHT;
                break;
        }
        const entranceArea: MapArea = {
            radius: 20,
            x: entranceX,
            y: entranceY,
            isAccessible: true,
        };
        this.areas.unshift(entranceArea);

        this.exit = new Phaser.Physics.Arcade.Image(this, WORLD_WIDTH - 100, WORLD_HEIGHT / 2, 'terrain', 26);
        this.exit.setScale(GAME_SCALE);
        this.physics.world.enable(this.exit);

        this.add.existing(this.exit);
    }

    generateOtherAreas() {

    }

    exitDungeon() {
        this.hasHeroReachedExit = true;
        this.hero.entity.setVelocity(0);
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once('camerafadeoutcomplete', () => {
            this.scene.start('Overworld');
        });
    }
}
