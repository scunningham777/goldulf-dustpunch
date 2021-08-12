import { GAME_SCALE, DUNGEON_LAYER_KEYS, STATIC_TEXTURE_KEY } from "../constants";
import MapArea from "../objects/mapArea";
import { justInsideWall, CARDINAL_DIRECTION } from "../utils";
import { SiteConfig } from "../objects/siteConfig";
import { AreaConfig } from "../objects/areaConfig";
import { StuffModel } from "./stuffModel";
import { DustModel } from "./dustModel";
import { STUFF_CONFIGS } from "../config";

export default function generateDungeon(
        mapConfig: SiteConfig,
        tileMap: Phaser.Tilemaps.Tilemap,
    ): {
        tileMap: Phaser.Tilemaps.Tilemap,
        layerMap: Map<string, Phaser.Tilemaps.TilemapLayer>,
        areas: MapArea[],
        stuff: StuffModel[],
        dust: DustModel[],
    }
{
    const newLayerMap = new Map<string, Phaser.Tilemaps.TilemapLayer>();
    const newTileset = tileMap.addTilesetImage(mapConfig.tilesetKey, mapConfig.tilesetKey, mapConfig.tileWidth, mapConfig.tileHeight, mapConfig.tilesetMargin ?? 0, mapConfig.tileSpacing ?? 0);
    for (let keyIndex in DUNGEON_LAYER_KEYS) {
        newLayerMap.set(DUNGEON_LAYER_KEYS[keyIndex], tileMap.createBlankLayer(DUNGEON_LAYER_KEYS[keyIndex], newTileset));
        newLayerMap.get(DUNGEON_LAYER_KEYS[keyIndex]).setScale(GAME_SCALE);
    }

    const bgLayer = newLayerMap.get(DUNGEON_LAYER_KEYS.BG_LAYER);
    fillMap(bgLayer, mapConfig.wallTileWeights);

    const floorTileIndices = mapConfig.floorTileWeights.map(ftw => ftw.index);

    const newAreas: MapArea[] = [];
    generateAreas(bgLayer, newAreas, mapConfig);
    connectAreas(bgLayer, newAreas, floorTileIndices);
    drawAreas(bgLayer, newAreas);

    const stuff = generateStuff(newLayerMap, mapConfig);
    const dust = generateDust(stuff, newLayerMap, mapConfig);

    return {tileMap: tileMap, layerMap: newLayerMap, areas: newAreas, stuff: stuff, dust: dust};
}

function fillMap(layer: Phaser.Tilemaps.TilemapLayer, wallTileWeights: {index: number, weight: number}[]) {
    layer.weightedRandomize(wallTileWeights, 0, 0, layer.tilemap.width, layer.tilemap.height);
}

function generateAreas(layer: Phaser.Tilemaps.TilemapLayer, areas: MapArea[], mapConfig: SiteConfig): MapArea[] {
    const maxXCoord = layer.tilemap.width-1;
    const maxYCoord = layer.tilemap.height-1;
    const startingCountAreas = Phaser.Math.RND.integerInRange(mapConfig.minCountAreas, mapConfig.maxCountAreas);

    areas.unshift(...generateDoorAreas(mapConfig, maxXCoord, maxYCoord));
    areas.push(...generateOtherAreas(startingCountAreas, mapConfig, maxXCoord, maxYCoord));

    return areas;
}

function generateDoorAreas(mapConfig: SiteConfig, maxXCoord: number, maxYCoord: number): MapArea[] {
    const areas: MapArea[] = [];
    const entranceArea = generateRandomArea(mapConfig.entranceAreaConfig, mapConfig, maxXCoord, maxYCoord);
    entranceArea.isAccessible = true;
    areas.unshift(entranceArea);

    const countExits = Phaser.Math.RND.integerInRange(1, mapConfig.maxExitAreaCount);
    for (let i = 0; i< countExits; i++) {
        let exitArea: MapArea;
        do {
            const exitAreaConfig = Phaser.Math.RND.pick(mapConfig.exitAreaConfigs ?? []);
            exitArea = generateRandomArea(exitAreaConfig, mapConfig, maxXCoord, maxYCoord);
        } while (isAreaCollision(areas, exitArea))
        areas.push(exitArea);
    }

    return areas;
}

function generateOtherAreas(numAreas: number, mapConfig: SiteConfig, maxXCoord: number, maxYCoord: number): MapArea[] {
    const areas: MapArea[] = [];
    for (let i = 0; i < numAreas; i++) {
        for (let ii = 0; ii < 30; ii++) {
            const newAreaConfig: AreaConfig = Phaser.Math.RND.pick(mapConfig.otherAreaConfigs ?? []);
            const newArea = generateRandomArea(newAreaConfig, mapConfig, maxXCoord, maxYCoord);
            if (!isAreaCollision(areas, newArea)) {
                areas.push(newArea);
                break;
            }
        }
        // fails silently if not enough room for the new area...
        // console.warn('ERROR: map too crowded to place area');        // need to actually check if it failed or not...
    }

    return areas;
}

function generateRandomArea(areaConfig: AreaConfig, mapConfig: SiteConfig, maxXCoord: number, maxYCoord: number): MapArea {
    const focusTileIndex = areaConfig.focusTileIndex;
    const newArea: MapArea = {
        size: Phaser.Math.RND.integerInRange(areaConfig.minSize, areaConfig.maxSize),
        focusX: 0,
        focusY: 0,
        focusTileIndex: focusTileIndex,
        linkedMapConfigType: areaConfig.linkedMapConfigType,
        linkedMapConfigName: Phaser.Math.RND.pick(areaConfig.availableLinkedMapConfigName ?? []),
        linkedMapConfigCategory: Phaser.Math.RND.pick(areaConfig.availableLinkedMapConfigCategory ?? []),
        isAccessible: false,
    }

    if (areaConfig.placement === 'wall') {
        const direction = Phaser.Math.RND.pick(Object.keys(CARDINAL_DIRECTION));
        switch(direction) {
            case CARDINAL_DIRECTION.UP: 
                newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
                break;
            case CARDINAL_DIRECTION.RIGHT:
                newArea.focusX = maxXCoord;
                newArea.focusY = Phaser.Math.RND.integerInRange(1, maxYCoord - 1);
                break;
            case CARDINAL_DIRECTION.DOWN:
                newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
                newArea.focusY = maxYCoord;
                break;
            case CARDINAL_DIRECTION.LEFT:
                newArea.focusY = Phaser.Math.RND.integerInRange(1, maxYCoord - 1);
                break;
        }
    } else {
        newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
        newArea.focusY = Phaser.Math.RND.integerInRange(1, maxYCoord - 1);
    }

    return newArea;
}

function isAreaCollision(existingAreas: MapArea[], potentialArea: MapArea): boolean {
    for (let existingArea of existingAreas) {
        const absX = Math.abs(existingArea.focusX - potentialArea.focusX);
        const absY = Math.abs(existingArea.focusY - potentialArea.focusY);
        if (absX + absY <= (potentialArea.size / 2) + (existingArea.size / 2)) {
            return true;
        }
    }
    return false;
}

function connectAreas(mapLayer: Phaser.Tilemaps.TilemapLayer, areas: MapArea[], floorTileIndices: number[]) {
    const maxXCoord = mapLayer.tilemap.width-1;
    const maxYCoord = mapLayer.tilemap.height-1;
    while(areas.filter(a => !a.isAccessible).length) {
        // pick an accessible area as the starting point
        const startArea: MapArea = Phaser.Math.RND.pick(areas.filter(a => a.isAccessible));
        let startLocation = new Phaser.Math.Vector2(startArea.focusX, startArea.focusY);
        
        // pick any !accessible area as the end point
        const endArea: MapArea = Phaser.Math.RND.pick(areas.filter(a => !a.isAccessible));
        let endLocation = new Phaser.Math.Vector2(endArea.focusX, endArea.focusY);

        // step away from the wall if need be
        startLocation = justInsideWall(startLocation, maxXCoord, maxYCoord);
        endLocation = justInsideWall(endLocation, maxXCoord, maxYCoord);

        // create random path between them
        createFloorPath(mapLayer, startLocation, endLocation, floorTileIndices);

        // set destination as accessible
        endArea.isAccessible = true;
    }
}

function createFloorPath(mapLayer: Phaser.Tilemaps.TilemapLayer, startLocation: Phaser.Math.Vector2, endLocation: Phaser.Math.Vector2, floorTileIndices: number[]) {
    let currentLocation = startLocation.clone();
    do {
        const seedMod = 7;
        const chanceTangent = 20;
        let randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
        mapLayer.putTileAt(Phaser.Math.RND.weightedPick(floorTileIndices), currentLocation.x, currentLocation.y);

        // chance of creating "tangent" path
        if (chanceTangent > 0 && Phaser.Math.RND.integerInRange(0, chanceTangent-1) === 0) {
            let newStart = currentLocation.clone();
            const newEnd = new Phaser.Math.Vector2(((mapLayer.tilemap.width - 3) * Phaser.Math.RND.integerInRange(0, 1)), ((mapLayer.tilemap.height - 3) * Phaser.Math.RND.integerInRange(0, 1)));
            for (let i = 0; i < mapLayer.tilemap.height / 3; i++) {
                newStart = stepPathRandom(newStart, newEnd, randomSeed, mapLayer.tilemap.width-1, mapLayer.tilemap.height-1);
                if (newStart == null) {
                    break;
                } else {
                    mapLayer.putTileAt(Phaser.Math.RND.weightedPick(floorTileIndices), newStart.x, newStart.y);
                }
            }
            randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
        }

        currentLocation = stepPathRandom(currentLocation, endLocation, randomSeed, mapLayer.tilemap.width-1, mapLayer.tilemap.height-1);
        // TODO: handle situation where stepPathRandom() returns null!
    } while (!currentLocation.equals(endLocation))

    // set tile at end location
    mapLayer.putTileAt(Phaser.Math.RND.weightedPick(floorTileIndices), endLocation.x, endLocation.y);
}

function stepPathRandom(startLocation: Phaser.Math.Vector2, endLocation: Phaser.Math.Vector2, randomSeed: number, maxXCoord: number, maxYCoord: number): Phaser.Math.Vector2 {
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
            || (startLocation.x + deltaX >= maxXCoord) || (startLocation.y + deltaY >= maxYCoord)) {
            continue;
        } else {
            return new Phaser.Math.Vector2(startLocation.x + deltaX, startLocation.y + deltaY);
        }
    }
}

function drawAreas(mapLayer: Phaser.Tilemaps.TilemapLayer, areas: MapArea[]) {
    for (let area of areas) {
        mapLayer.putTileAt(area.focusTileIndex, area.focusX, area.focusY);
    }
}

function generateStuff(mapLayers: Map<string, Phaser.Tilemaps.TilemapLayer>, mapConfig: SiteConfig) : StuffModel[] {
    const bgLayer = mapLayers.get(DUNGEON_LAYER_KEYS.BG_LAYER);
    const stuffLayer = mapLayers.get(DUNGEON_LAYER_KEYS.STUFF_LAYER);
    const startingCountStuff = Phaser.Math.RND.integerInRange(mapConfig.minCountStuff, mapConfig.maxCountStuff);
    const newStuffArray: StuffModel[] = [];
    for (let i = 0; i < startingCountStuff; i++) {
        let newStuffTileX: number;
        let newStuffTileY: number;
        let j: number;
        for (j = 0; j < 30; j++) {
            newStuffTileX = Phaser.Math.RND.integerInRange(0, bgLayer.tilemap.width - 1);
            newStuffTileY = Phaser.Math.RND.integerInRange(0, bgLayer.tilemap.height - 1);
            // confirm that new tile is floor tile, and doesn't overlap with existing stuff
            const tile = bgLayer.getTileAt(newStuffTileX, newStuffTileY);
            const isFloorTile = mapConfig.floorTileWeights.some(ftw => ftw.index === tile.index);
            const isStuffThereAlready = newStuffArray.some(s => s.tileX === newStuffTileX && s.tileY === newStuffTileY);
            if (isFloorTile && !isStuffThereAlready) {
                break;
            }
        } 
        if (j < 30){
            const newStuffX = (newStuffTileX + .5) * stuffLayer.tilemap.tileWidth * GAME_SCALE;
            const newStuffY = (newStuffTileY + .5) * stuffLayer.tilemap.tileHeight * GAME_SCALE;
            const newStuffConfigType = Phaser.Math.RND.pick(STUFF_CONFIGS);
            const newStuff = new StuffModel(
                    newStuffX,
                    newStuffY,
                    newStuffTileX,
                    newStuffTileY,
                    STATIC_TEXTURE_KEY,
                    newStuffConfigType.stuffName,  
                    i,
                );
            newStuffArray.push(newStuff);
        } else {
            console.warn('Not enough room to place Stuff');
        }
    }

    return newStuffArray;
}

function generateDust(stuffArray: StuffModel[], mapLayers: Map<string, Phaser.Tilemaps.TilemapLayer>, mapConfig: SiteConfig): DustModel[] {
    const newDustArray = stuffArray.map((stuff: StuffModel, index: number) => {
        const newDust = new DustModel(
            stuff.x,
            stuff.y,
            STATIC_TEXTURE_KEY,
            0,
            stuff.id,
            index,
        )
        return newDust;
    });
    return newDustArray;
}
