import Hero from '../objects/hero';
import { GAME_SCALE, DUNGEON_LAYER_KEYS } from '../constants';
import { CARDINAL_DIRECTION, justInsideWall } from '../utils';
import generateDungeon from '../dungeonGenerator/dungeonGenerator_cave';
import { MapConfig } from '../objects/mapConfig';
import { MAP_CONFIGS } from '../config';
import MapArea from '../objects/mapArea';
import { StuffModel } from '../dungeonGenerator/stuffModel';
import Stuff from '../objects/stuff';
import { DustModel } from '../dungeonGenerator/dustModel';
import Dust from '../objects/dust';

const MAP_KEY = 'dungeon-map';

export class DungeonScene extends Phaser.Scene {
    private mapConfig: MapConfig;
    private hero: Hero;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private areas: MapArea[] = [];
    private stuffGroup: Phaser.Physics.Arcade.Group;
    private dustGroup: Phaser.Physics.Arcade.Group;
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
        this.mapConfig = MAP_CONFIGS.dungeon.find(mc => mc.mapConfigName == this.scene.settings.data['mapConfigName'])
            ?? Phaser.Math.RND.pick(MAP_CONFIGS.overworld.filter(mc => mc.mapConfigCategories.some(mcc => mcc == this.scene.settings.data['mapConfigCategory'])))
            ?? Phaser.Math.RND.pick(MAP_CONFIGS.dungeon.filter(mc => mc.isRandomlySelectable));
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
            this.stuffGroup = this.createStuff(mapData.stuff);
            this.dustGroup = this.createDust(mapData.dust);
    }
    
    createHero() {
        this.hasHeroReachedExit = false;
        const entranceLocation = this.getEntranceLocation() || new Phaser.Math.Vector2(1,1);
        const heroStartLocation = justInsideWall(entranceLocation, this.greatestXCoord, this.greatestYCoord);
        const heroStartXInPixels = (heroStartLocation.x + .5) * (this.map.tileWidth * GAME_SCALE);
        const heroStartYInPixels = (heroStartLocation.y + .5) * (this.map.tileHeight * GAME_SCALE);
        // determine start direction based on location of entrance (this.areas[0]);
        let heroStartDirection = CARDINAL_DIRECTION.DOWN;
        if (entranceLocation.x === 0) {
            heroStartDirection = CARDINAL_DIRECTION.RIGHT;
        } else if (entranceLocation.x === this.greatestXCoord) {
            heroStartDirection = CARDINAL_DIRECTION.LEFT;
        } else if (entranceLocation.y === this.greatestYCoord) {
            heroStartDirection = CARDINAL_DIRECTION.UP;
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
        this.physics.add.overlap(this.hero.entity, this.dustGroup, this.dustCollision, null, this)
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

    createStuff(stuffData: StuffModel[]): Phaser.Physics.Arcade.Group {
        const stuffGroup = this.physics.add.group();
        for (let stuff of stuffData) {
            const newStuff = new Stuff(this, stuff.x, stuff.y, stuff.key, stuff.frame, stuff.points, stuff.id);
            stuffGroup.add(newStuff);
        }
        return stuffGroup;
    }

    createDust(dustData: DustModel[]): Phaser.Physics.Arcade.Group {
        const dustGroup = this.physics.add.group();
        for (let dust of dustData) {
            const newDust = new Dust(this, dust.x, dust.y, dust.key, dust.frame, dust.associatedStuffId, dust.id);
            dustGroup.add(newDust);
        }
        return dustGroup;
    }

    exitDungeon() {
        this.hasHeroReachedExit = true;
        this.hero.freeze();
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once('camerafadeoutcomplete', () => {
            this.scene.start('Overworld', {mapConfigName: null});
        });
    }

    stuffCollision: ArcadePhysicsCallback = (_heroObj, stuffObj) => {
        if (this.hero.isPunching) {
            (stuffObj as Stuff).scorePoints();
        }
    }

    dustCollision: ArcadePhysicsCallback = (_heroObj, dustObj) => {
        if (this.hero.isPunching) {
            (dustObj as Dust).clearDust();
        }
    }

    getEntranceLocation(): Phaser.Math.Vector2 {
        const entranceLocation = new Phaser.Math.Vector2(this.areas[0].focusX, this.areas[0].focusY);
        return entranceLocation;
    }
}
