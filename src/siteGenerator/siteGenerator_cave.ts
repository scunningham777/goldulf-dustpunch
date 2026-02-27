import { GAME_SCALE, STATIC_TEXTURE_KEY } from "../constants";
import { MapArea } from "../interfaces/mapArea";
import { justInsideWall, weightedRandomizeAnything } from "../utils";
import { SiteConfig } from "../interfaces/siteConfig";
import { AreaConfig } from "../interfaces/areaConfig";
import { SiteGenerationData } from "../interfaces/siteGenerationData";
import { SiteGenerator } from "./siteGenerator";
import { generateTileIndexData, tokenRequirementFilter, isAreaCollision, generateRandomArea, generateDust } from "./generatorUtils";
import { InventoryItem } from "../interfaces/stuffInInventory";

export const caveGenerator: SiteGenerator =
{
    generateSite(
        siteConfig: SiteConfig,
        siteWidth: number,
        siteHeight: number,
        inventoryTokens: InventoryItem[] = []
    ): SiteGenerationData {
        const tileIndexData = generateTileIndexData(siteWidth, siteHeight, siteConfig.wallTileWeights.map(wTW => ({ key: wTW.index, weight: wTW.weight })));
        const canUse = tokenRequirementFilter(inventoryTokens);
        const floorTileWeights = siteConfig.floorTileWeights.map(ftw => ({ key: ftw.index, weight: ftw.weight }));

        const newAreas: MapArea[] = generateAreas();
        connectAreas(tileIndexData, newAreas, floorTileWeights);
        drawAreas(tileIndexData, newAreas);

        const heroSpawnCoords = new Phaser.Math.Vector2(newAreas[0].focusX, newAreas[0].focusY)
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
            areas.push(...generateOtherAreas(startingCountAreas, maxXCoord, maxYCoord));

            return areas;
        }

        function connectAreas(tileIndexData: number[][], areas: MapArea[], floorTileWeights: { key: number, weight: number }[]) {
            const maxXCoord = siteWidth - 1;
            const maxYCoord = siteHeight - 1;
            while (areas.filter(a => !a.isAccessible).length) {
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
                createFloorPath(tileIndexData, startLocation, endLocation, floorTileWeights, siteWidth, siteHeight);

                // set destination as accessible
                endArea.isAccessible = true;
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

            if (siteConfig.maxExitAreaCount > 0) {
                const countExits = Phaser.Math.RND.integerInRange(1, siteConfig.maxExitAreaCount);
                for (let i = 0; i < countExits; i++) {
                    let exitArea: MapArea;
                    do {
                        const choices = (siteConfig.exitAreaConfigs ?? []).filter(canUse);
                        const exitAreaConfig = Phaser.Math.RND.pick(choices);
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
                    const choices = (siteConfig.otherAreaConfigs ?? []).filter(canUse);
                    const newAreaConfig: AreaConfig = Phaser.Math.RND.pick(choices);
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



        function createFloorPath(tileIndexData: number[][], startLocation: Phaser.Math.Vector2, endLocation: Phaser.Math.Vector2, floorTileWeights: { key: number, weight: number }[], siteWidth: number, siteHeight: number) {
            let currentLocation = startLocation.clone();
            do {
                const seedMod = 7;
                const chanceTangent = 20;
                let randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
                tileIndexData[currentLocation.y][currentLocation.x] = weightedRandomizeAnything(floorTileWeights);

                // chance of creating "tangent" path
                if (chanceTangent > 0 && Phaser.Math.RND.integerInRange(0, chanceTangent - 1) === 0) {
                    let newStart = currentLocation.clone();
                    const newEnd = new Phaser.Math.Vector2(((siteWidth - 3) * Phaser.Math.RND.integerInRange(0, 1)), ((siteHeight - 3) * Phaser.Math.RND.integerInRange(0, 1)));
                    for (let i = 0; i < siteHeight / 3; i++) {
                        newStart = stepPathRandom(newStart, newEnd, randomSeed, siteWidth - 1, siteHeight - 1);
                        if (newStart == null) {
                            break;
                        } else {
                            tileIndexData[newStart.y][newStart.x] = weightedRandomizeAnything(floorTileWeights);
                        }
                    }
                    randomSeed = seedMod + Phaser.Math.RND.integerInRange(0, 3);
                }

                currentLocation = stepPathRandom(currentLocation, endLocation, randomSeed, siteWidth - 1, siteHeight - 1);
                // TODO: handle situation where stepPathRandom() returns null!
            } while (!currentLocation.equals(endLocation))

            // set tile at end location
            tileIndexData[endLocation.y][endLocation.x] = weightedRandomizeAnything(floorTileWeights);
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

                switch (Phaser.Math.RND.integerInRange(0, randomSeed - 1)) {
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
}
