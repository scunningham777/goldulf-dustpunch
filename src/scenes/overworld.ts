import Hero from '../objects/hero';
import { GAME_SCALE, DUNGEON_LAYER_KEYS, UI_SCENE_KEY, EXIT_COLLISION_EVENT_KEY } from '../constants';
import generateDungeon from '../dungeonGenerator/dungeonGenerator_cave';
import { MapConfig } from '../objects/mapConfig';
import { MAP_CONFIGS } from '../config';
import { CARDINAL_DIRECTION } from '../utils';
import MapArea from '../objects/mapArea';
import Exit from '../objects/exit';

const MAP_KEY = 'overworld-map';

export class OverworldScene extends Phaser.Scene {
    private mapConfig: MapConfig;
    private hero: Hero;
    private cursors: any;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private areas: MapArea[] = [];
    private exitGroup: Phaser.Physics.Arcade.Group;
    private hasHeroReachedExit = false;

    /* lifecycle methods */
    init() {
        // is this the best place for this?
        this.scene.launch(UI_SCENE_KEY);
    }
    
    create(): void {
        this.selectMapConfig();
        this.createMap();
        this.createHero();
        this.addListeners();
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
            ?? Phaser.Math.RND.pick(MAP_CONFIGS.overworld.filter(mc => mc.mapConfigCategories.some(mcc => mcc == this.scene.settings.data['mapConfigCategory'])) ?? [])
            ?? Phaser.Math.RND.pick(MAP_CONFIGS.overworld.filter(mc => mc.isRandomlySelectable) ?? []);
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
        this.exitGroup = this.createExits(mapData.areas.filter(a => a.linkedMapConfigName != null || a.linkedMapConfigCategory != null));
        this.tintMap();
    }

    createHero() {
        this.hasHeroReachedExit = false;
        const heroStartLocation = this.getEntranceLocation() || new Phaser.Math.Vector2(1,1);
        const heroStartXInPixels = (heroStartLocation.x + .5) * (this.map.tileWidth * GAME_SCALE);
        const heroStartYInPixels = (heroStartLocation.y + .5) * (this.map.tileHeight * GAME_SCALE);
        let heroStartDirection = CARDINAL_DIRECTION.DOWN;
        this.hero = new Hero(heroStartXInPixels , heroStartYInPixels, this, 360, heroStartDirection);
    }

    addListeners() {
        this.registry.events.on(EXIT_COLLISION_EVENT_KEY, this.enterDungeon, this);
    }
    clearListeners() {
        this.registry.events.off(EXIT_COLLISION_EVENT_KEY, this.enterDungeon, this);
    }
    
    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between hero and walls
        const bgLayer = this.mapLayers.get(DUNGEON_LAYER_KEYS.BG_LAYER);
        bgLayer.setCollision([
            ...this.mapConfig.wallTileWeights.map(wtw => wtw.index),
        ]);

        this.physics.add.overlap(this.hero.entity, this.exitGroup, this.exitCollision, null, this);
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

    createExits(exitData: MapArea[]): Phaser.Physics.Arcade.Group {
        const exitGroup = this.physics.add.group();
        for (let exit of exitData) {
            const imageIndex = exit.focusTileIndex != null
                ? exit.focusTileIndex
                : MAP_CONFIGS.dungeon.find(mc => mc.mapConfigName == exit.linkedMapConfigName)?.externalIconTileIndex;
            const exitX = (exit.focusX + .5) * this.map.tileWidth * GAME_SCALE;
            const exitY = (exit.focusY + .5) * this.map.tileWidth * GAME_SCALE;
            const newExit = new Exit(
                this,
                exitX, exitY,
                this.mapConfig.tilesetKey, imageIndex,
                '' + new Date().getTime(),
                exit.linkedMapConfigName, exit.linkedMapConfigCategory
            );
            exitGroup.add(newExit);
        }
        return exitGroup;
    }

    tintMap() {
        const mapLayer = this.mapLayers.get(DUNGEON_LAYER_KEYS.BG_LAYER);
        mapLayer.forEachTile(t => t.tint = this.mapConfig.defaultTileTint);
        this.exitGroup.children.iterate(exit => {
            (exit as Exit).setTint((this.mapConfig.defaultTileTint));
        }, this);
    }

    enterDungeon(exitConfig?: {linkedMapConfigName: string, linkedMapConfigCategory: string}) {
        this.hasHeroReachedExit = true;
        this.hero.freeze();
        this.clearListeners();
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once('camerafadeoutcomplete', () => {
            const sceneConfig = {
                mapConfigName: exitConfig?.linkedMapConfigName,
                mapConfigCategory: exitConfig?.linkedMapConfigCategory
            };
            this.scene.start('Dungeon', sceneConfig);
        });
    }

    exitCollision: ArcadePhysicsCallback = (_heroObj, exitObj) => {
        if (!this.hero.isPunching) {
            (exitObj as Exit).exitCollision();
        }
    }

    getEntranceLocation(): Phaser.Math.Vector2 {
        const entranceLocation = new Phaser.Math.Vector2(this.areas[0].focusX, this.areas[0].focusY);
        return entranceLocation;
    }
}
