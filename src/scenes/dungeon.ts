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
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayers = new Map<string, Phaser.Tilemaps.DynamicTilemapLayer>();
    private tileset: Phaser.Tilemaps.Tileset;
    private hasHeroReachedExit = false;
    private startingNumAreas = 3;
    private startingNumStuff = 10;

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
        this.generateAreas(this.startingNumAreas);
        this.drawAreas();
        this.connectAreas();
        
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).setScale(GAME_SCALE);
    }
    
    createHero() {
        this.hasHeroReachedExit = false;
        const entranceXInPixels = (this.areas[0].focusX + .5) * (this.map.tileWidth * GAME_SCALE);
        const entranceYInPixels = (this.areas[0].focusY + .5) * (this.map.tileHeight * GAME_SCALE);
        this.hero = new Hero(entranceXInPixels , entranceYInPixels, this, 360, this.heroStartDirection);
    }

    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between hero and exit icons
        const bgLayer = this.mapLayers.get(LAYER_KEYS.BG_LAYER);
        bgLayer.setCollision(26);
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

    fillMap() {
        // this.mapLayers.get(LAYER_KEYS.BG_LAYER).fill(30);
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).weightedRandomize(0, 0, this.map.width, this.map.height, [
            {index: 53, weight: 9},
            {index: 52, weight: 1},
        ]);
    }
    
    generateAreas(numAreas: number) {
        this.areas = [];
        this.generateDoorAreas();
        this.generateOtherAreas(numAreas);
    }

    drawAreas() {
        const bgLayer = this.mapLayers.get(LAYER_KEYS.BG_LAYER);
        for (let area of this.areas) {
            bgLayer.putTileAt(area.focusTileIndex, area.focusX, area.focusY);
        }
    }
    
    connectAreas() {
        
    }
    
    generateDoorAreas() {
        const entranceArea = this.generateRandomArea('wall', 20, 20, 50);
        this.areas.unshift(entranceArea);

        const exitArea = this.generateRandomArea('floor', 15, 20, 26);
        this.areas.push(exitArea);
    }

    generateOtherAreas(numAreas: number) {
        for (let i = 0; i < numAreas; i++) {

        }
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

    generateRandomArea(placement: 'wall'|'floor', minSize: number, maxSize: number, focusTileIndex: number): MapArea {
        const newArea: MapArea = {
            radius: Phaser.Math.RND.integerInRange(minSize, maxSize),
            focusX: 0,
            focusY: 0,
            focusTileIndex: focusTileIndex,
            isAccessible: false,
        }

        do {
            if (placement === 'wall') {
                const direction = Phaser.Math.RND.pick(Object.keys(Cardinal_Direction));
                switch(direction) {
                    case Cardinal_Direction.UP: 
                        newArea.focusX = Phaser.Math.RND.integerInRange(1, this.map.width-2);
                        break;
                    case Cardinal_Direction.RIGHT:
                        newArea.focusX = this.map.width-1;
                        newArea.focusY = Phaser.Math.RND.integerInRange(1, this.map.height-2);
                        break;
                    case Cardinal_Direction.DOWN:
                        newArea.focusX = Phaser.Math.RND.integerInRange(1, this.map.width-2);
                        newArea.focusY = this.map.height-1;
                        break;
                    case Cardinal_Direction.LEFT:
                        newArea.focusY = Phaser.Math.RND.integerInRange(1, this.map.height-2);
                        break;
                }
            } else {
                newArea.focusX = Phaser.Math.RND.integerInRange(1, this.map.width-2);
                newArea.focusY = Phaser.Math.RND.integerInRange(1, this.map.height-2);
            }
        } while (this.isAreaCollision(newArea));

        return newArea;
    }

    isAreaCollision(potentialArea: MapArea): boolean {
        for (let existingArea of this.areas) {
            const absX = Math.abs(existingArea.focusX - potentialArea.focusX);
            const absY = Math.abs(existingArea.focusY - potentialArea.focusY);
            const distance = Math.sqrt(absX**2 + absY**2);
            if (distance < potentialArea.radius) {
                return true;
            }
        }
        return false;
    }
}
