import { GAME_SCALE, STATIC_TEXTURE_KEY } from "../constants";
import { MapArea } from "../interfaces/mapArea";
import { justInsideWall, CARDINAL_DIRECTION, weightedRandomizeAnything } from "../utils";
import { SiteConfig } from "../interfaces/siteConfig";
import { DustModel } from "./dustModel";
import { SiteGenerationData } from "../interfaces/siteGenerationData";
import { SiteGenerator } from "./siteGenerator";

interface Building {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const settlementGenerator: SiteGenerator =
{
    generateSite(
        siteConfig: SiteConfig,
        siteWidth: number,
        siteHeight: number,
    ): SiteGenerationData {

        const tileIndexData = generateTileIndexData(siteConfig.wallTileWeights.map(wTW => ({ key: wTW.index, weight: wTW.weight })));
        const floorTileIndices = siteConfig.floorTileWeights.map(ftw => ftw.index);

        const newAreas: MapArea[] = generateAreas();
        const clearings = carveClearings(tileIndexData, newAreas, floorTileIndices);
        placeBuildings(tileIndexData, clearings,(siteConfig.obstructionTileWeights ?? []).map(oTW => ({ key: oTW.index, weight: oTW.weight })));
        connectClearings(tileIndexData, clearings, floorTileIndices);
        drawAreas(tileIndexData, newAreas);

        const dust = generateDust(tileIndexData);
        const heroSpawnCoords = new Phaser.Math.Vector2(newAreas[0].focusX, newAreas[0].focusY);

        return {
            tileIndexData,
            areas: newAreas,
            dust,
            siteType: siteConfig.siteType,
            siteConfigName: siteConfig.mapConfigName,
            siteWidth,
            siteHeight,
            heroSpawnCoords,
        };

        function generateTileIndexData(wallTileWeights: { key: number, weight: number }[]): number[][] {
            const tileIndexData: number[][] = [];
            for (let y = 0; y < siteHeight; y++) {
                tileIndexData[y] = [];
                for (let x = 0; x < siteWidth; x++) {
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
            areas.push(...generateClearingAreas(startingCountAreas, maxXCoord, maxYCoord));

            return areas;
        }

        function carveClearings(tileIndexData: number[][], areas: MapArea[], floorTileIndices: number[]): MapArea[] {
            const clearings: MapArea[] = [];

            for (let area of areas) {
                // Create irregular clearing shapes
                const clearingSize = area.size + Phaser.Math.RND.integerInRange(2, 6);

                for (let dy = -clearingSize; dy <= clearingSize; dy++) {
                    for (let dx = -clearingSize; dx <= clearingSize; dx++) {
                        const x = area.focusX + dx;
                        const y = area.focusY + dy;

                        // Use distance check for more organic shapes
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const maxDistance = clearingSize + Phaser.Math.RND.between(-2, 2);

                        if (distance <= maxDistance && x > 0 && x < siteWidth - 1 && y > 0 && y < siteHeight - 1) {
                            tileIndexData[y][x] = Phaser.Math.RND.pick(floorTileIndices);
                        }
                    }
                }

                clearings.push(area);
            }

            return clearings;
        }

        function placeBuildings(tileIndexData: number[][], clearings: MapArea[], obstructionTileWeights: { key: number, weight: number }[]) {
            for (let clearing of clearings) {
                // Skip entrance clearing
                if (clearing === clearings[0]) continue;

                // Each clearing gets 1-3 buildings
                const numBuildings = Phaser.Math.RND.integerInRange(1, 3);
                const buildings: Building[] = [];

                for (let i = 0; i < numBuildings; i++) {
                    for (let attempt = 0; attempt < 20; attempt++) {
                        const buildingWidth = Phaser.Math.RND.integerInRange(5, 8);
                        const buildingHeight = Phaser.Math.RND.integerInRange(5, 8);

                        // Try to place building within clearing
                        const offsetX = Phaser.Math.RND.integerInRange(-clearing.size + 2, clearing.size - 2);
                        const offsetY = Phaser.Math.RND.integerInRange(-clearing.size + 2, clearing.size - 2);

                        const building: Building = {
                            x: clearing.focusX + offsetX,
                            y: clearing.focusY + offsetY,
                            width: buildingWidth,
                            height: buildingHeight
                        };

                        // Check if building fits and doesn't overlap
                        if (isBuildingValid(building, buildings)) {
                            buildings.push(building);
                            carveBuilding(tileIndexData, building, obstructionTileWeights, siteConfig.floorTileWeights.map(ftw => ftw.index));
                            break;
                        }
                    }
                }
            }
        }

        function isBuildingValid(building: Building, existingBuildings: Building[]): boolean {
            // Check bounds
            if (building.x < 2 || building.x + building.width >= siteWidth - 2) return false;
            if (building.y < 2 || building.y + building.height >= siteHeight - 2) return false;

            // Check overlap with existing buildings (with 2 tile buffer)
            for (let existing of existingBuildings) {
                if (!(building.x + building.width + 2 < existing.x ||
                    building.x > existing.x + existing.width + 2 ||
                    building.y + building.height + 2 < existing.y ||
                    building.y > existing.y + existing.height + 2)) {
                    return false;
                }
            }

            return true;
        }

        function carveBuilding(
            tileIndexData: number[][],
            building: Building,
            obstructionTileWeights: { key: number, weight: number }[],
            floorTileIndices: number[]
        ) {
            // Calculate how many wall tiles to remove (25-50%)
            const totalWallTiles = (building.width + building.height) * 2;
            const tilesToRemove = Math.floor(totalWallTiles * Phaser.Math.RND.realInRange(0.25, 0.5));

            // Clear interior to floor
            for (let y = building.y + 1; y < building.y + building.height - 1; y++) {
                for (let x = building.x + 1; x < building.x + building.width - 1; x++) {
                    tileIndexData[y][x] = Phaser.Math.RND.pick(floorTileIndices);
                }
            }

            // Build walls
            const wallPositions: { x: number, y: number }[] = [];

            // Top and bottom walls
            for (let x = building.x; x < building.x + building.width; x++) {
                wallPositions.push({ x, y: building.y });
                wallPositions.push({ x, y: building.y + building.height - 1 });
            }

            // Left and right walls (skip corners already added)
            for (let y = building.y + 1; y < building.y + building.height - 1; y++) {
                wallPositions.push({ x: building.x, y });
                wallPositions.push({ x: building.x + building.width - 1, y });
            }

            // Randomly remove walls to create ruins
            Phaser.Utils.Array.Shuffle(wallPositions);

            for (let i = 0; i < wallPositions.length; i++) {
                const pos = wallPositions[i];
                if (i < tilesToRemove) {
                    // Remove this wall tile (make it floor)
                    tileIndexData[pos.y][pos.x] = Phaser.Math.RND.pick(floorTileIndices);
                } else {
                    // Place wall
                    tileIndexData[pos.y][pos.x] = weightedRandomizeAnything(obstructionTileWeights);
                }
            }
        }

        function connectClearings(tileIndexData: number[][], clearings: MapArea[], floorTileIndices: number[]) {
            const maxXCoord = siteWidth - 1;
            const maxYCoord = siteHeight - 1;

            // Mark entrance as accessible
            clearings[0].isAccessible = true;

            // Connect clearings with paths
            while (clearings.filter(c => !c.isAccessible).length) {
                let closestPair: { start: MapArea, end: MapArea, distance: number } | null = null;

                for (let accessibleClearing of clearings.filter(c => c.isAccessible)) {
                    for (let inaccessibleClearing of clearings.filter(c => !c.isAccessible)) {
                        const distance = Phaser.Math.Distance.Between(
                            accessibleClearing.focusX, accessibleClearing.focusY,
                            inaccessibleClearing.focusX, inaccessibleClearing.focusY
                        );

                        if (!closestPair || distance < closestPair.distance) {
                            closestPair = { start: accessibleClearing, end: inaccessibleClearing, distance };
                        }
                    }
                }

                if (closestPair) {
                    let startLocation = new Phaser.Math.Vector2(closestPair.start.focusX, closestPair.start.focusY);
                    let endLocation = new Phaser.Math.Vector2(closestPair.end.focusX, closestPair.end.focusY);

                    startLocation = justInsideWall(startLocation, maxXCoord, maxYCoord);
                    endLocation = justInsideWall(endLocation, maxXCoord, maxYCoord);

                    carvePath(tileIndexData, startLocation, endLocation, floorTileIndices);

                    closestPair.end.isAccessible = true;
                }
            }
        }

        function carvePath(
            tileIndexData: number[][],
            start: Phaser.Math.Vector2,
            end: Phaser.Math.Vector2,
            floorTileIndices: number[]
        ) {
            const pathWidth = 2; // Wider paths for settlements
            let current = start.clone();

            // Winding path (not straight)
            while (current.x !== end.x || current.y !== end.y) {
                // Randomly choose horizontal or vertical movement
                const moveHorizontal = current.x !== end.x &&
                    (current.y === end.y || Phaser.Math.RND.between(0, 1) === 0);

                if (moveHorizontal) {
                    current.x += current.x < end.x ? 1 : -1;
                } else {
                    current.y += current.y < end.y ? 1 : -1;
                }

                // Carve path width
                for (let dy = -pathWidth; dy <= pathWidth; dy++) {
                    for (let dx = -pathWidth; dx <= pathWidth; dx++) {
                        const x = current.x + dx;
                        const y = current.y + dy;

                        if (x > 0 && x < siteWidth - 1 && y > 0 && y < siteHeight - 1) {
                            tileIndexData[y][x] = Phaser.Math.RND.pick(floorTileIndices);
                        }
                    }
                }
            }
        }

        function drawAreas(tileIndexData: number[][], areas: MapArea[]) {
            for (let area of areas) {
                tileIndexData[area.focusY][area.focusX] = area.focusTileIndex;
            }
        }

        function generateDust(tileIndexData: number[][]): DustModel[] {
            // Find all accessible tiles via flood-fill from the entrance
            const accessibleTiles: boolean[][] = [];
            for (let y = 0; y < tileIndexData.length; y++) {
                accessibleTiles[y] = new Array(tileIndexData[y].length).fill(false);
            }

            const floorTileIndices = siteConfig.floorTileWeights.map(ftw => ftw.index);
            const entranceClearing = newAreas[0];
            markAccessibleTiles(tileIndexData, accessibleTiles, entranceClearing.focusX, entranceClearing.focusY, floorTileIndices);

            const newDustArray: DustModel[] = [];
            for (let y = 0; y < tileIndexData.length; y++) {
                for (let x = 0; x < tileIndexData[y].length; x++) {
                    const isDustableTile = siteConfig.floorTileWeights.some(fTW => fTW.index == tileIndexData[y][x]);
                    if (isDustableTile && accessibleTiles[y][x]) {
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

        function markAccessibleTiles(
            tileIndexData: number[][],
            accessibleTiles: boolean[][],
            startX: number,
            startY: number,
            floorTileIndices: number[]
        ) {
            // Adjust start position to be inside the map if on boundary (entrance can be on walls)
            let adjustedX = startX;
            let adjustedY = startY;
            
            if (adjustedX <= 0) adjustedX = 1;
            if (adjustedX >= tileIndexData[0].length - 1) adjustedX = tileIndexData[0].length - 2;
            if (adjustedY <= 0) adjustedY = 1;
            if (adjustedY >= tileIndexData.length - 1) adjustedY = tileIndexData.length - 2;

            const queue: Array<{ x: number, y: number }> = [{ x: adjustedX, y: adjustedY }];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const { x, y } = queue.shift()!;
                const key = `${x},${y}`;

                if (visited.has(key)) continue;
                visited.add(key);

                if (x < 0 || x >= tileIndexData[0].length || y < 0 || y >= tileIndexData.length) continue;

                const isFloor = floorTileIndices.includes(tileIndexData[y][x]);
                if (!isFloor) continue;

                accessibleTiles[y][x] = true;

                // Add neighbors to queue (4-directional connectivity)
                queue.push({ x: x + 1, y });
                queue.push({ x: x - 1, y });
                queue.push({ x, y: y + 1 });
                queue.push({ x, y: y - 1 });
            }
        }

        function generateDoorAreas(maxXCoord: number, maxYCoord: number): MapArea[] {
            const areas: MapArea[] = [];
            const entranceArea = generateRandomArea(siteConfig.entranceAreaConfig, maxXCoord, maxYCoord);
            entranceArea.isAccessible = true;
            areas.unshift(entranceArea);
            return areas;
        }

        function generateClearingAreas(numClearings: number, maxXCoord: number, maxYCoord: number): MapArea[] {
            const areas: MapArea[] = [];
            const clearingConfig = Phaser.Math.RND.pick(siteConfig.otherAreaConfigs ?? []);

            for (let i = 0; i < numClearings; i++) {
                for (let attempt = 0; attempt < 30; attempt++) {
                    const newClearing = generateRandomArea(clearingConfig, maxXCoord, maxYCoord);
                    if (!isAreaCollision(areas, newClearing)) {
                        areas.push(newClearing);
                        break;
                    }
                }
            }

            return areas;
        }

        function generateRandomArea(areaConfig: typeof siteConfig.entranceAreaConfig, maxXCoord: number, maxYCoord: number): MapArea {
            const newArea: MapArea = {
                size: Phaser.Math.RND.integerInRange(areaConfig.minSize, areaConfig.maxSize),
                focusX: 0,
                focusY: 0,
                focusTileIndex: areaConfig.focusTileIndex,
                linkedMapConfigType: areaConfig.linkedMapConfigType,
                linkedMapConfigName: Phaser.Math.RND.pick(areaConfig.availableLinkedMapConfigName ?? []),
                linkedMapConfigCategory: Phaser.Math.RND.pick(areaConfig.availableLinkedMapConfigCategory ?? []),
                isAccessible: false,
            };

            if (areaConfig.placement === 'wall') {
                const direction = Phaser.Math.RND.pick(Object.keys(CARDINAL_DIRECTION));
                switch (direction) {
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
    }
}