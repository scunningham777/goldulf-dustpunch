import { GAME_SCALE, DUNGEON_LAYER_KEYS, DUNGEON_ENTRANCE_INDEX } from "../constants";
import MapArea from "../objects/map-area";
import { justInsideWall, Cardinal_Direction } from "../utils";

export default function generateDungeon(
        tileMap: Phaser.Tilemaps.Tilemap,
        tilesetKey: string,
        layerMap: Map<string, Phaser.Tilemaps.DynamicTilemapLayer>,
        startingNumAreas: number,
        wallTileWeights: {index: number, weight: number}[],
        floorTileIndices: number[],
    ): Phaser.Tilemaps.Tilemap 
{

    const newTileset = tileMap.addTilesetImage(tilesetKey, tilesetKey, 32, 32);
    for (let keyIndex in DUNGEON_LAYER_KEYS) {
        layerMap.set(DUNGEON_LAYER_KEYS[keyIndex], tileMap.createBlankDynamicLayer(DUNGEON_LAYER_KEYS[keyIndex], newTileset));
        layerMap.get(DUNGEON_LAYER_KEYS[keyIndex]).setScale(GAME_SCALE);
    }

    const bgLayer = layerMap.get(DUNGEON_LAYER_KEYS.BG_LAYER);
    fillMap(bgLayer, wallTileWeights);
    const areas = generateAreas(startingNumAreas, floorTileIndices, tileMap.width-1, tileMap.height-1);
    connectAreas(bgLayer, areas, tileMap.width-1, tileMap.height-1, floorTileIndices);
    drawAreas(bgLayer, areas);

    return tileMap;
}

function fillMap(layer: Phaser.Tilemaps.DynamicTilemapLayer, wallTileWeights: {index: number, weight: number}[]) {
    layer.weightedRandomize(0, 0, layer.width, layer.height, wallTileWeights);
}

function generateAreas(numAreas: number, floorTileIndices: number[], maxXCoord: number, maxYCoord: number): MapArea[] {
    const areas = [
        ...generateDoorAreas(maxXCoord, maxYCoord),
        ...generateOtherAreas(numAreas, floorTileIndices, maxXCoord, maxYCoord),
    ];

    return areas;
}

function generateDoorAreas(maxXCoord: number, maxYCoord: number): MapArea[] {
    const areas: MapArea[] = [];
    const entranceArea = generateRandomArea('wall', 8, 8, DUNGEON_ENTRANCE_INDEX, maxXCoord, maxYCoord);
    entranceArea.isAccessible = true;
    areas.unshift(entranceArea);

    const exitArea = generateRandomArea('floor', 5, 10, 26, maxXCoord, maxYCoord);
    areas.push(exitArea);

    return areas;
}

function generateOtherAreas(numAreas: number, floorTileIndices: number[], maxXCoord: number, maxYCoord: number): MapArea[] {
    const areas: MapArea[] = [];
    for (let i = 0; i < numAreas; i++) {
        for (let ii = 0; ii < 30; ii++) {
            const newArea = generateRandomArea('floor', 5, 10, Phaser.Math.RND.weightedPick(floorTileIndices), maxXCoord, maxYCoord);
            if (!isAreaCollision(areas, newArea)) {
                areas.push(newArea);
            }
        }
        // fails silently if not enough room for the new area...
        console.warn('ERROR: map too crowded to place area');
    }

    return areas;
}

function generateRandomArea(placement: 'wall'|'floor', minSize: number, maxSize: number, focusTileIndex: number, maxXCoord: number, maxYCoord: number): MapArea {
    const newArea: MapArea = {
        radius: Phaser.Math.RND.integerInRange(minSize, maxSize),
        focusX: 0,
        focusY: 0,
        focusTileIndex: focusTileIndex,
        isAccessible: false,
    }

    if (placement === 'wall') {
        const direction = Phaser.Math.RND.pick(Object.keys(Cardinal_Direction));
        switch(direction) {
            case Cardinal_Direction.UP: 
                newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
                break;
            case Cardinal_Direction.RIGHT:
                newArea.focusX = maxXCoord;
                newArea.focusY = Phaser.Math.RND.integerInRange(1, maxYCoord - 1);
                break;
            case Cardinal_Direction.DOWN:
                newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
                newArea.focusY = maxYCoord;
                break;
            case Cardinal_Direction.LEFT:
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
        if (absX + absY <= (potentialArea.radius / 2) + (existingArea.radius / 2)) {
            return true;
        }
    }
    return false;
}

function connectAreas(mapLayer: Phaser.Tilemaps.DynamicTilemapLayer, areas: MapArea[], maxXCoord: number, maxYCoord: number, floorTileIndices: number[]) {
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

function createFloorPath(mapLayer: Phaser.Tilemaps.DynamicTilemapLayer, startLocation: Phaser.Math.Vector2, endLocation: Phaser.Math.Vector2, floorTileIndices: number[]) {
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

function drawAreas(mapLayer: Phaser.Tilemaps.DynamicTilemapLayer, areas: MapArea[]) {
    for (let area of areas) {
        mapLayer.putTileAt(area.focusTileIndex, area.focusX, area.focusY);
    }
}
