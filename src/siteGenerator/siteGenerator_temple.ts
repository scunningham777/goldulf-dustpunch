import { GAME_SCALE, STATIC_TEXTURE_KEY } from "../constants";
import { MapArea } from "../interfaces/mapArea";
import { SiteConfig } from "../interfaces/siteConfig";
import { SiteGenerationData } from "../interfaces/siteGenerationData";
import { InventoryItem } from "../interfaces/stuffInInventory";
import { justInsideWall, weightedRandomizeAnything } from "../utils";
import { generateDust, generateRandomArea, generateTileIndexData, isAreaCollision, tokenRequirementFilter } from "./generatorUtils";
import { SiteGenerator } from "./siteGenerator";

export const templeGenerator: SiteGenerator = {
    generateSite(
        siteConfig: SiteConfig,
        siteWidth: number,
        siteHeight: number,
        inventoryTokens: InventoryItem[] = []
    ): SiteGenerationData {

        const tileIndexData = generateTileIndexData(siteWidth, siteHeight, siteConfig.wallTileWeights.map(wTW => ({ key: wTW.index, weight: wTW.weight })));
        const floorTileWeights = siteConfig.floorTileWeights.map(ftw => ({ key: ftw.index, weight: ftw.weight }));
        const canUse = tokenRequirementFilter(inventoryTokens);
        const newAreas: MapArea[] = generateAreas();
        carveRooms(tileIndexData, newAreas, floorTileWeights);
        connectRooms(tileIndexData, newAreas, floorTileWeights);
        drawAreas(tileIndexData, newAreas);

        const heroSpawnCoords = new Phaser.Math.Vector2(newAreas[0].focusX, newAreas[0].focusY);
        const dust = generateDust(tileIndexData, siteConfig, [justInsideWall(heroSpawnCoords, siteWidth - 1, siteHeight - 1)]);

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
            const roomChoices = (siteConfig.otherAreaConfigs ?? []).filter(canUse);
            const roomConfig = Phaser.Math.RND.pick(roomChoices);

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
    }
}