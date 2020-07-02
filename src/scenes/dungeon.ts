import Hero from '../objects/hero';
import { GAME_SCALE, DUNGEON_LAYER_KEYS, DUNGEON_ENTRANCE_INDEX } from '../constants';
import { Cardinal_Direction, justInsideWall } from '../utils';
import MapArea from '../objects/map-area';
import generateDungeon from '../dungeon_generator/dungeon_generator_cave';

const MAP_KEY = 'dungeon-map';
const TILESET_KEY = 'terrain';

const WALL_TILE_INDICES = [
    53,         // plain brick
    52,         // green mossy brick
]
const FLOOR_TILE_INDICES = [
    30,         // smooth dark floor
    54,         // light gray cobble
    // 55,         // grey brick with green
]

export class DungeonScene extends Phaser.Scene {

    private hero: Hero;
    private cursors: any;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private hasHeroReachedExit = false;
    private startingCountAreas = 3;
    private get greatestXCoord(): number {
        return this.map.width - 1;
    }
    private get greatestYCoord(): number {
        return this.map.height - 1;
    }

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
        generateDungeon(
            this.map,
            TILESET_KEY,
            this.mapLayers,
            this.startingCountAreas,
            [
                {index: 53, weight: 9},
                {index: 52, weight: 1},
            ],
            FLOOR_TILE_INDICES,
        );
    }
    
    createHero() {
        this.hasHeroReachedExit = false;
        const entranceLocation = this.getEntranceLocation() || new Phaser.Math.Vector2(1,1);
        const heroStartLocation = justInsideWall(entranceLocation, this.greatestXCoord, this.greatestYCoord);
        const heroStartXInPixels = (heroStartLocation.x + .5) * (this.map.tileWidth * GAME_SCALE);
        const heroStartYInPixels = (heroStartLocation.y + .5) * (this.map.tileHeight * GAME_SCALE);
        // determine start direction based on location of entrance (this.areas[0]);
        let heroStartDirection = Cardinal_Direction.DOWN;
        if (entranceLocation.x === 0) {
            heroStartDirection = Cardinal_Direction.RIGHT;
        } else if (entranceLocation.x === this.greatestXCoord) {
            heroStartDirection = Cardinal_Direction.LEFT;
        } else if (entranceLocation.y === this.greatestYCoord) {
            heroStartDirection = Cardinal_Direction.UP;
        }
        this.hero = new Hero(heroStartXInPixels , heroStartYInPixels, this, 360, heroStartDirection);
    }

    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between hero and exit tiles, walls, and "broken" entrance
        const bgLayer = this.mapLayers.get(DUNGEON_LAYER_KEYS.BG_LAYER);
        bgLayer.setCollision([26, ...WALL_TILE_INDICES, 50]);
        bgLayer.setTileIndexCallback(26, (_collidingSprite: Phaser.Physics.Arcade.Sprite) => {
            bgLayer.setTileIndexCallback(26, null, null);
            this.exitDungeon();
            return true;
        }, this);
        this.physics.add.collider(this.hero.entity, bgLayer);
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

    exitDungeon() {
        this.hasHeroReachedExit = true;
        this.hero.freeze();
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once('camerafadeoutcomplete', () => {
            this.scene.start('Overworld');
        });
    }

    getEntranceLocation(): Phaser.Math.Vector2 {
        const bgLayer = this.mapLayers.get(DUNGEON_LAYER_KEYS.BG_LAYER);
        const entranceTile = bgLayer.findTile((tile: Phaser.Tilemaps.Tile, index: number) => {
            return tile.index == DUNGEON_ENTRANCE_INDEX;
        })
        if (!!entranceTile) {
            return new Phaser.Math.Vector2(entranceTile.x, entranceTile.y);
        }
        return null;
    }
}
