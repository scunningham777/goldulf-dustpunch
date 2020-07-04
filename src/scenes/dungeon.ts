import Hero from '../objects/hero';
import { GAME_SCALE, DUNGEON_LAYER_KEYS, DUNGEON_ENTRANCE_INDEX } from '../constants';
import { Cardinal_Direction, justInsideWall } from '../utils';
import generateDungeon from '../dungeon_generator/dungeon_generator_cave';
import { MapConfig } from '../objects/map-config';
import { MAP_CONFIGS } from '../config';

const MAP_KEY = 'dungeon-map';

export class DungeonScene extends Phaser.Scene {
    private mapConfig: MapConfig;
    private hero: Hero;
    private cursors: any;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private hasHeroReachedExit = false;
    private get greatestXCoord(): number {
        return this.map.width - 1;
    }
    private get greatestYCoord(): number {
        return this.map.height - 1;
    }

    /* lifecycle methods */
    create(): void {
        this.selectMapConfig();
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

    selectMapConfig() {
        this.mapConfig = Phaser.Math.RND.pick(MAP_CONFIGS.dungeon);
    }

    createMap() {
        this.map = this.make.tilemap({
            tileWidth: this.mapConfig.tileWidth,
            tileHeight: this.mapConfig.tileHeight,
            width: Phaser.Math.RND.integerInRange(this.mapConfig.minMapWidth, this.mapConfig.maxMapWidth),
            height: Phaser.Math.RND.integerInRange(this.mapConfig.minMapHeight, this.mapConfig.maxMapHeight),
            key: MAP_KEY,
        });
        generateDungeon(
            this.map,
            this.mapLayers,
            this.mapConfig,
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
        bgLayer.setCollision([
            ...this.mapConfig.exitAreaConfigs.map(eac => eac.focusTileIndex),
            ...this.mapConfig.wallTileWeights.map(wtw => wtw.index),
            this.mapConfig.entranceAreaConfig.focusTileIndex
        ]);
        bgLayer.setTileIndexCallback(this.mapConfig.exitAreaConfigs.map(eac => eac.focusTileIndex), (_collidingSprite: Phaser.Physics.Arcade.Sprite) => {
            bgLayer.setTileIndexCallback(this.mapConfig.exitAreaConfigs.map(eac => eac.focusTileIndex), null, null);
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
        const entranceTile = bgLayer.findTile((tile: Phaser.Tilemaps.Tile) => {
            return tile.index == DUNGEON_ENTRANCE_INDEX;
        })
        if (!!entranceTile) {
            return new Phaser.Math.Vector2(entranceTile.x, entranceTile.y);
        }
        return null;
    }
}
