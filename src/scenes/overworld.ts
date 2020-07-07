import Hero from '../objects/hero';
import { GAME_SCALE, DUNGEON_LAYER_KEYS, OVERWORLD_ENTRANCE_INDEX } from '../constants';
import generateDungeon from '../dungeon_generator/dungeon_generator_cave';
import { MapConfig } from '../objects/map-config';
import { MAP_CONFIGS } from '../config';
import { Cardinal_Direction } from '../utils';
import MapArea from '../objects/map-area';

const MAP_KEY = 'overworld-map';

export class OverworldScene extends Phaser.Scene {
    private mapConfig: MapConfig;
    private hero: Hero;
    private cursors: any;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private areas: MapArea[] = [];
    private hasHeroReachedExit = false;

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
        this.mapConfig = MAP_CONFIGS.overworld.find(mc => mc.mapConfigName == this.scene.settings.data['mapConfigName'])
            ?? Phaser.Math.RND.pick(MAP_CONFIGS.overworld);
    }

    createMap() {
        this.map = this.make.tilemap({
            tileWidth: this.mapConfig.tileWidth,
            tileHeight: this.mapConfig.tileHeight,
            width: Phaser.Math.RND.integerInRange(this.mapConfig.minMapWidth, this.mapConfig.maxMapWidth),
            height: Phaser.Math.RND.integerInRange(this.mapConfig.minMapHeight, this.mapConfig.maxMapHeight),
            key: MAP_KEY,
        });
        const mapData = generateDungeon(
            this.mapConfig,
            this.map,
        );
        this.map = mapData.tileMap;
        this.mapLayers = mapData.layerMap;
        this.areas = mapData.areas;
    }

    createHero() {
        this.hasHeroReachedExit = false;
        const heroStartLocation = this.getEntranceLocation() || new Phaser.Math.Vector2(1,1);
        const heroStartXInPixels = (heroStartLocation.x + .5) * (this.map.tileWidth * GAME_SCALE);
        const heroStartYInPixels = (heroStartLocation.y + .5) * (this.map.tileHeight * GAME_SCALE);
        let heroStartDirection = Cardinal_Direction.DOWN;
        this.hero = new Hero(heroStartXInPixels , heroStartYInPixels, this, 360, heroStartDirection);
    }

    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between hero and exit tiles and walls
        const bgLayer = this.mapLayers.get(DUNGEON_LAYER_KEYS.BG_LAYER);
        bgLayer.setCollision([
            ...this.mapConfig.exitAreaConfigs.map(eac => eac.focusTileIndex),
            ...this.mapConfig.wallTileWeights.map(wtw => wtw.index),
        ]);
        bgLayer.setTileIndexCallback(this.mapConfig.exitAreaConfigs.map(eac => eac.focusTileIndex), (_collidingSprite: Phaser.Physics.Arcade.Sprite) => {
            bgLayer.setTileIndexCallback(this.mapConfig.exitAreaConfigs.map(eac => eac.focusTileIndex), null, null);
            this.enterDungeon();
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

    enterDungeon() {
        this.hasHeroReachedExit = true;
        this.hero.freeze();
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once('camerafadeoutcomplete', () => {
            this.scene.start('Dungeon', {mapConfigName: null});
        });
    }

    getEntranceLocation(): Phaser.Math.Vector2 {
        const entranceLocation = new Phaser.Math.Vector2(this.areas[0].focusX, this.areas[0].focusY);
        return entranceLocation;
        // const bgLayer = this.mapLayers.get(DUNGEON_LAYER_KEYS.BG_LAYER);
        // const entranceTile = bgLayer.findTile((tile: Phaser.Tilemaps.Tile) => {
        //     return tile.index == OVERWORLD_ENTRANCE_INDEX;
        // })
        // if (!!entranceTile) {
        //     return new Phaser.Math.Vector2(entranceTile.x, entranceTile.y);
        // }
        // return null;
    }
}
