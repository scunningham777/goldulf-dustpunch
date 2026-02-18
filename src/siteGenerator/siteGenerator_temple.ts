import { GAME_SCALE, STATIC_TEXTURE_KEY } from "../constants";
import { MapArea } from "../interfaces/mapArea";
import { justInsideWall, CARDINAL_DIRECTION, weightedRandomizeAnything } from "../utils";
import { SiteConfig } from "../interfaces/siteConfig";
import { DustModel } from "./dustModel";
import { SiteGenerationData } from "../interfaces/siteGenerationData";
import { SiteGenerator } from "./siteGenerator";

export const templeGenerator: SiteGenerator = {
    generateSite(
        siteConfig: SiteConfig,
        siteWidth: number,
        siteHeight: number,
    ): SiteGenerationData {

        const tileIndexData = generateTileIndexData(siteConfig.wallTileWeights.map(wTW => ({ key: wTW.index, weight: wTW.weight })));
        const floorTileWeights = siteConfig.floorTileWeights.map(ftw => ({ key: ftw.index, weight: ftw.weight }));

        const newAreas: MapArea[] = generateAreas();
        carveRooms(tileIndexData, newAreas, floorTileWeights);
        connectRooms(tileIndexData, newAreas, floorTileWeights);
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
            areas.push(...generateRoomAreas(startingCountAreas, maxXCoord, maxYCoord));

            return areas;
        }

        function carveRooms(tileIndexData: number[][], areas: MapArea[], floorTileWeights: { key: number, weight: number }[]) {
            // Carve out rectangular rooms for each area
            for (let area of areas) {
                const roomHalfSize = Math.floor(area.size / 2);

                for (let dy = -roomHalfSize; dy <= roomHalfSize; dy++) {
                    for (let dx = -roomHalfSize; dx <= roomHalfSize; dx++) {
                        const x = area.focusX + dx;
                        const y = area.focusY + dy;

                        // Bounds check
                        if (x > 0 && x < siteWidth - 1 && y > 0 && y < siteHeight - 1) {
                            tileIndexData[y][x] = weightedRandomizeAnything(floorTileWeights);
                        }
                    }
                }
            }
        }

        function connectRooms(tileIndexData: number[][], areas: MapArea[], floorTileWeights: { key: number, weight: number }[]) {
            const maxXCoord = siteWidth - 1;
            const maxYCoord = siteHeight - 1;

            // Mark entrance as accessible
            areas[0].isAccessible = true;

            // Connect each room to the nearest already-accessible room
            while (areas.filter(a => !a.isAccessible).length) {
                let closestPair: { start: MapArea, end: MapArea, distance: number } | null = null;

                // Find the closest accessible-to-inaccessible room pair
                for (let accessibleRoom of areas.filter(a => a.isAccessible)) {
                    for (let inaccessibleRoom of areas.filter(a => !a.isAccessible)) {
                        const distance = Phaser.Math.Distance.Between(
                            accessibleRoom.focusX, accessibleRoom.focusY,
                            inaccessibleRoom.focusX, inaccessibleRoom.focusY
                        );

                        if (!closestPair || distance < closestPair.distance) {
                            closestPair = { start: accessibleRoom, end: inaccessibleRoom, distance };
                        }
                    }
                }

                if (closestPair) {
                    let startLocation = new Phaser.Math.Vector2(closestPair.start.focusX, closestPair.start.focusY);
                    let endLocation = new Phaser.Math.Vector2(closestPair.end.focusX, closestPair.end.focusY);

                    startLocation = justInsideWall(startLocation, maxXCoord, maxYCoord);
                    endLocation = justInsideWall(endLocation, maxXCoord, maxYCoord);

                    // Create straight corridors (L-shaped path)
                    carveCorridor(tileIndexData, startLocation, endLocation, floorTileWeights);

                    closestPair.end.isAccessible = true;
                }
            }
        }

        function carveCorridor(
            tileIndexData: number[][],
            start: Phaser.Math.Vector2,
            end: Phaser.Math.Vector2,
            floorTileWeights: { key: number, weight: number }[]
        ) {
            const corridorWidth = 1; // Temples have narrow corridors
            let current = start.clone();

            // Move horizontally first
            while (current.x !== end.x) {
                const stepX = current.x < end.x ? 1 : -1;
                current.x += stepX;

                // Carve corridor width
                for (let offset = -corridorWidth; offset <= corridorWidth; offset++) {
                    const y = current.y + offset;
                    if (y > 0 && y < siteHeight - 1 && current.x > 0 && current.x < siteWidth - 1) {
                        tileIndexData[y][current.x] = weightedRandomizeAnything(floorTileWeights);
                    }
                }
            }

            // Then move vertically
            while (current.y !== end.y) {
                const stepY = current.y < end.y ? 1 : -1;
                current.y += stepY;

                // Carve corridor width
                for (let offset = -corridorWidth; offset <= corridorWidth; offset++) {
                    const x = current.x + offset;
                    if (x > 0 && x < siteWidth - 1 && current.y > 0 && current.y < siteHeight - 1) {
                        tileIndexData[current.y][x] = weightedRandomizeAnything(floorTileWeights);
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

            // Temples don't have exits (player clears them)
            return areas;
        }

        function generateRoomAreas(numRooms: number, maxXCoord: number, maxYCoord: number): MapArea[] {
            const areas: MapArea[] = [];
            const roomConfig = Phaser.Math.RND.pick(siteConfig.otherAreaConfigs ?? []);

            for (let i = 0; i < numRooms; i++) {
                for (let attempt = 0; attempt < 30; attempt++) {
                    const newRoom = generateRandomArea(roomConfig, maxXCoord, maxYCoord);
                    if (!isAreaCollision(areas, newRoom)) {
                        areas.push(newRoom);
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