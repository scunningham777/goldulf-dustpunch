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

const WALL_TILE_INDICES = [
    53,         // plain brick
    52,         // green mossy brick
]
const FLOOR_TILE_INDICES = [
    30,         // smooth dark floor
    54,         // light gray cobble
    55,         // grey brick with green
]

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
    private get greatestXCoord(): number {
        return this.map.width - 1;
    }
    private get greatestYCood(): number {
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

        this.tileset = this.map.addTilesetImage('terrain', 'terrain', 32, 32);
        for (const keyIndex in LAYER_KEYS) {
            this.mapLayers.set(LAYER_KEYS[keyIndex], this.map.createBlankDynamicLayer(LAYER_KEYS[keyIndex], this.tileset));
        }
        
        this.fillMap();
        this.generateAreas(this.startingNumAreas);
        this.connectAreas();
        this.drawAreas();
        
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).setScale(GAME_SCALE);
    }
    
    createHero() {
        this.hasHeroReachedExit = false;
        const entranceLocation = this.justInsideWall(new Phaser.Math.Vector2(this.areas[0].focusX, this.areas[0].focusY));
        const heroStartXInPixels = (entranceLocation.x + .5) * (this.map.tileWidth * GAME_SCALE);
        const heroStartYInPixels = (entranceLocation.y + .5) * (this.map.tileHeight * GAME_SCALE);
        // determine start direction based on location of entrance (this.areas[0]);
        let heroStartDirection = Cardinal_Direction.DOWN;
        if (this.areas[0].focusX === 0) {
            heroStartDirection = Cardinal_Direction.RIGHT;
        } else if (this.areas[0].focusX === this.map.width-1) {
            heroStartDirection = Cardinal_Direction.LEFT;
        } else if (this.areas[0].focusY === this.map.height-1) {
            heroStartDirection = Cardinal_Direction.UP;
        }
        this.hero = new Hero(heroStartXInPixels , heroStartYInPixels, this, 360, heroStartDirection);
    }

    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between hero and exit icons
        const bgLayer = this.mapLayers.get(LAYER_KEYS.BG_LAYER);
        bgLayer.setCollision([26, ...WALL_TILE_INDICES]);
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
        while(this.areas.filter(a => !a.isAccessible).length) {
            // pick an accessible area as the starting point
            const startArea: MapArea = Phaser.Math.RND.pick(this.areas.filter(a => a.isAccessible));
            let startLocation = new Phaser.Math.Vector2(startArea.focusX, startArea.focusY);
            
            // pick any !accessible area as the end point
            const endArea: MapArea = Phaser.Math.RND.pick(this.areas.filter(a => !a.isAccessible));
            let endLocation = new Phaser.Math.Vector2(endArea.focusX, endArea.focusY);

            // step away from the wall if need be
            startLocation = this.justInsideWall(startLocation);
            endLocation = this.justInsideWall(endLocation);

            // create random path between them
            this.createFloorPath(startLocation, endLocation);

            // set destination as accessible
            endArea.isAccessible = true;
        }
    }
    
    generateDoorAreas() {
        const entranceArea = this.generateRandomArea('wall', 8, 8, 50);
        entranceArea.isAccessible = true;
        this.areas.unshift(entranceArea);

        const exitArea = this.generateRandomArea('floor', 5, 10, 26);
        this.areas.push(exitArea);
    }

    generateOtherAreas(numAreas: number) {
        for (let i = 0; i < numAreas; i++) {
            const newArea = this.generateRandomArea('floor', 5, 10, 55);
            if (newArea != null) {
                this.areas.push(newArea);
            }
        }
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

    generateRandomArea(placement: 'wall'|'floor', minSize: number, maxSize: number, focusTileIndex: number): MapArea {
        const newArea: MapArea = {
            radius: Phaser.Math.RND.integerInRange(minSize, maxSize),
            focusX: 0,
            focusY: 0,
            focusTileIndex: focusTileIndex,
            isAccessible: false,
        }

        for (let i = 0; i < 30; i++) {
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

            if (!this.isAreaCollision(newArea)) {
                return newArea;
            }
        }

        // map too crowded to place area after 30 tries
        return null;
    }

    isAreaCollision(potentialArea: MapArea): boolean {
        for (let existingArea of this.areas) {
            const absX = Math.abs(existingArea.focusX - potentialArea.focusX);
            const absY = Math.abs(existingArea.focusY - potentialArea.focusY);
            if (absX + absY <= (potentialArea.radius / 2) +(existingArea.radius / 2)) {
                return true;
            }
        }
        return false;
    }

    /** Will return the original coord if not on a wall */
    justInsideWall(location: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        const newLocation = location.clone();

        if (location.x === 0) {
            newLocation.x += 1;
        } else if (location.x === this.greatestXCoord) {
            newLocation.x -= 1;
        }
        if (location.y === 0) {
            newLocation.y += 1;
        } else if (location.y === this.greatestYCood) {
            newLocation.y -= 1;
        }

        return newLocation;
    }

    createFloorPath(startLocation: Phaser.Math.Vector2, endLocation: Phaser.Math.Vector2) {
        let currentLocation = startLocation.clone();
        const bgLayer = this.mapLayers.get(LAYER_KEYS.BG_LAYER);
        do {
            const seedMod = 7;
            const chanceTangent = 20;
            let randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
            bgLayer.putTileAt(Phaser.Math.RND.weightedPick(FLOOR_TILE_INDICES), currentLocation.x, currentLocation.y);

            // chance of creating "tangent" path
            if (chanceTangent > 0 && Phaser.Math.RND.integerInRange(0, chanceTangent-1) === 0) {
                let newStart = currentLocation.clone();
                const newEnd = new Phaser.Math.Vector2(((this.map.width - 3) * Phaser.Math.RND.integerInRange(0, 1)), ((this.map.height - 3) * Phaser.Math.RND.integerInRange(0, 1)));
                for (let i = 0; i < this.map.height / 3; i++) {
                    newStart = this.stepPathRandom(newStart, newEnd, randomSeed);
                    if (newStart == null) {
                        break;
                    } else {
                        bgLayer.putTileAt(Phaser.Math.RND.weightedPick(FLOOR_TILE_INDICES), newStart.x, newStart.y);
                    }
                }
                randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
            }

            currentLocation = this.stepPathRandom(currentLocation, endLocation, randomSeed);
        } while (!currentLocation.equals(endLocation))

        // set tile at end location
        this.mapLayers.get(LAYER_KEYS.BG_LAYER).putTileAt(Phaser.Math.RND.weightedPick(FLOOR_TILE_INDICES), endLocation.x, endLocation.y);
    }

    stepPathRandom(startLocation: Phaser.Math.Vector2, endLocation: Phaser.Math.Vector2, randomSeed): Phaser.Math.Vector2 {
        if (startLocation.equals(endLocation)) {
            return null;
        }

        let deltaX = endLocation.x - startLocation.x;
        let deltaY = endLocation.y - startLocation.y;

        while (1) {
            // move along the longer axis
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaX = deltaX / Math.abs(deltaX);
                deltaY = 0;
            } else if (Math.abs(deltaX) < Math.abs(deltaY)) {
                deltaX = 0;
                deltaY = deltaY / Math.abs(deltaY);
            } else {
                // move along random axis
                if ((deltaY = (deltaY / Math.abs(deltaY)) * Phaser.Math.RND.integerInRange(0, 1))) {
                    deltaX = 0;
                } else {
                    deltaX = deltaX / Math.abs(deltaX);
                }
            }

            switch (Phaser.Math.RND.integerInRange(0, randomSeed-1)) {
                case 0:             // go opposite direction
                    deltaX *= -1
                    deltaY *= -1;
                    break;
                case 1:
                case 2:             // mirrors across x=y axis
                    [deltaX, deltaY] = [deltaY, deltaX];
                    break;
                case 3:
                case 4:             // mirrors across x=-y axis
                    [deltaX, deltaY] = [deltaY * -1, deltaX * -1];
                    break;
                default:            // leaves as is
                    break;
            }

            // redo if out-of-bounds
            if ((startLocation.x + deltaX <= 0) || (startLocation.y + deltaY <= 0) 
                || (startLocation.x + deltaX >= this.greatestXCoord) || (startLocation.y + deltaY >= this.greatestYCood)) {
                continue;
            } else {
                return new Phaser.Math.Vector2(startLocation.x + deltaX, startLocation.y + deltaY);
            }
        }
    }
}
