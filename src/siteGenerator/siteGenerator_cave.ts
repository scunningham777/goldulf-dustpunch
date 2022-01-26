import { GAME_SCALE, STATIC_TEXTURE_KEY } from "../constants";
import MapArea from "../interfaces/mapArea";
import { justInsideWall, CARDINAL_DIRECTION, weightedRandomizeAnything } from "../utils";
import { SiteConfig } from "../interfaces/siteConfig";
import { AreaConfig } from "../interfaces/areaConfig";
import { DustModel } from "./dustModel";

export function generateDungeon(
        siteConfig: SiteConfig,
        siteWidth: number,
        siteHeight: number,
    ): {
        tileIndexData: number[][],
        areas: MapArea[],
        dust: DustModel[],
    }
{
    
    const tileIndexData = generateTileIndexData(siteConfig.wallTileWeights.map(wTW => ({key: wTW.index, weight: wTW.weight})));
    const floorTileIndices = siteConfig.floorTileWeights.map(ftw => ftw.index);
    
    const newAreas: MapArea[] = generateAreas();
    connectAreas(tileIndexData, newAreas, floorTileIndices);
    drawAreas(tileIndexData, newAreas);
    
    const dust = generateDust(tileIndexData);
    
    return {tileIndexData: tileIndexData, areas: newAreas, dust: dust};

    function generateTileIndexData(wallTileWeights: {key: number, weight: number}[]): number[][] {
        const tileIndexData: number[][] = [];
        for(let y = 0; y < siteHeight; y++) {
            tileIndexData[y] = [];
            for(let x = 0; x < siteWidth; x++) {
                tileIndexData[y][x] = weightedRandomizeAnything(wallTileWeights);
            }
        }
        return tileIndexData;
    }

    function generateAreas(areas: MapArea[] = []): MapArea[] {
        const maxXCoord = siteWidth - 1;
        const maxYCoord = siteHeight - 1;
        const startingCountAreas = Phaser.Math.RND.integerInRange(siteConfig.minCountAreas, siteConfig.maxCountAreas);
    
        areas.unshift(...generateDoorAreas(maxXCoord, maxYCoord));
        areas.push(...generateOtherAreas(startingCountAreas, maxXCoord, maxYCoord));
    
        return areas;
    }
    
    
    function connectAreas(tileIndexData: number[][], areas: MapArea[], floorTileIndices: number[]) {
        const maxXCoord = siteWidth - 1;
        const maxYCoord = siteHeight - 1;
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
            createFloorPath(tileIndexData, startLocation, endLocation, floorTileIndices, siteWidth, siteHeight);
    
            // set destination as accessible
            endArea.isAccessible = true;
        }
    }
    
    function drawAreas(tileIndexData: number[][], areas: MapArea[]) {
        for (let area of areas) {
            tileIndexData[area.focusY][area.focusX] = area.focusTileIndex;
        }
    }
    
    function generateDust(tileIndexData: number[][]): DustModel[] {
        const newDustArray: DustModel[] = [];
        for (let y = 0; y < tileIndexData.length; y++) {
            for (let x = 0; x < tileIndexData[y].length; x++) {
                const isDustableTile = siteConfig.floorTileWeights.some(fTW => fTW.index == tileIndexData[y][x]);
                if (isDustableTile) {
    
                    const doAddDust = Phaser.Math.RND.integerInRange(1, 100) <= siteConfig.dustWeight;
                    if (doAddDust) {
                        const dustFrame = Phaser.Math.RND.pick(siteConfig.availableDustFrames);
                        const newDustX = (x + .5) * siteConfig.tileWidth * GAME_SCALE;
                        const newDustY = (y + .5) * siteConfig.tileHeight * GAME_SCALE;
            
                        const newDust = new DustModel(
                            newDustX,
                            newDustY,
                            STATIC_TEXTURE_KEY,
                            dustFrame,
                            y * tileIndexData[y].length + x,
                        );
                        newDustArray.push(newDust);
                    }
                }
            }
        }
    
        return newDustArray;
    }

    function generateDoorAreas(maxXCoord: number, maxYCoord: number): MapArea[] {
        const areas: MapArea[] = [];
        const entranceArea = generateRandomArea(siteConfig.entranceAreaConfig, maxXCoord, maxYCoord);
        entranceArea.isAccessible = true;
        areas.unshift(entranceArea);
    
        if (siteConfig.maxExitAreaCount > 0) {
            const countExits = Phaser.Math.RND.integerInRange(1, siteConfig.maxExitAreaCount);
            for (let i = 0; i< countExits; i++) {
                let exitArea: MapArea;
                do {
                    const exitAreaConfig = Phaser.Math.RND.pick(siteConfig.exitAreaConfigs ?? []);
                    exitArea = generateRandomArea(exitAreaConfig, maxXCoord, maxYCoord);
                } while (isAreaCollision(areas, exitArea))
                areas.push(exitArea);
            }
        }
    
        return areas;
    }
    
    function generateOtherAreas(numAreas: number, maxXCoord: number, maxYCoord: number): MapArea[] {
        const areas: MapArea[] = [];
        for (let i = 0; i < numAreas; i++) {
            for (let j = 0; j < 30; j++) {
                const newAreaConfig: AreaConfig = Phaser.Math.RND.pick(siteConfig.otherAreaConfigs ?? []);
                const newArea = generateRandomArea(newAreaConfig, maxXCoord, maxYCoord);
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
    
    function generateRandomArea(areaConfig: AreaConfig, maxXCoord: number, maxYCoord: number): MapArea {
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
    
    function createFloorPath(tileIndexData: number[][], startLocation: Phaser.Math.Vector2, endLocation: Phaser.Math.Vector2, floorTileIndices: number[], siteWidth: number, siteHeight: number) {
        let currentLocation = startLocation.clone();
        do {
            const seedMod = 7;
            const chanceTangent = 20;
            let randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
            tileIndexData[currentLocation.y][currentLocation.x] = Phaser.Math.RND.weightedPick(floorTileIndices);
    
            // chance of creating "tangent" path
            if (chanceTangent > 0 && Phaser.Math.RND.integerInRange(0, chanceTangent-1) === 0) {
                let newStart = currentLocation.clone();
                const newEnd = new Phaser.Math.Vector2(((siteWidth - 3) * Phaser.Math.RND.integerInRange(0, 1)), ((siteHeight - 3) * Phaser.Math.RND.integerInRange(0, 1)));
                for (let i = 0; i < siteHeight / 3; i++) {
                    newStart = stepPathRandom(newStart, newEnd, randomSeed, siteWidth - 1, siteHeight - 1);
                    if (newStart == null) {
                        break;
                    } else {
                        tileIndexData[newStart.y][newStart.x] = Phaser.Math.RND.weightedPick(floorTileIndices);
                    }
                }
                randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
            }
    
            currentLocation = stepPathRandom(currentLocation, endLocation, randomSeed, siteWidth - 1, siteHeight - 1);
            // TODO: handle situation where stepPathRandom() returns null!
        } while (!currentLocation.equals(endLocation))
    
        // set tile at end location
        tileIndexData[endLocation.y][endLocation.x] = Phaser.Math.RND.weightedPick(floorTileIndices);
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
}
