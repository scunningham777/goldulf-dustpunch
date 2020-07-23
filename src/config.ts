import { MapConfig } from "./objects/mapConfig";

export const MAP_CONFIGS: {[T in 'overworld'|'dungeon']: MapConfig[]} = {
    overworld: [
        {
            mapConfigName: 'new_game',
            mapConfigCategories: [],
            isRandomlySelectable: false,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: 'terrain_16',
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 30,
            minMapHeight: 40,
            maxMapWidth: 30,
            maxMapHeight: 40,
            externalIconTileIndex: 2,
            wallTileWeights: [
                {index: 0, weight: 5},
                {index: 1, weight: 1},
            ],
            floorTileWeights: [
                {index: 59, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'floor',
                minSize: 5,
                maxSize: 10,
                focusTileIndex: 3,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: 'dungeon',
                    availableLinkedMapConfigName: ['cave_small', 'fire_cave_small']
                }
            ],
            maxExitAreaCount: 3,
            otherAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    focusTileIndex: null,
                }
            ],
            minCountAreas: 2,
            maxCountAreas: 4,
            defaultTileTint: 0xD99E18,
            minCountStuff: 0,
            maxCountStuff: 0,
            stuffSpritesheetKey: 'stuff',
        },
        {
            mapConfigName: 'forest_temples',
            mapConfigCategories: [],
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: 'terrain_16',
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 30,
            minMapHeight: 40,
            maxMapWidth: 30,
            maxMapHeight: 40,
            externalIconTileIndex: 2,
            wallTileWeights: [
                {index: 0, weight: 5},
                {index: 1, weight: 1},
            ],
            floorTileWeights: [
                {index: 59, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'floor',
                minSize: 5,
                maxSize: 10,
                focusTileIndex: 3,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: 'dungeon',
                    availableLinkedMapConfigName: ['cave_small', 'fire_cave_small']
                }
            ],
            maxExitAreaCount: 4,
            otherAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    focusTileIndex: null,
                }
            ],
            minCountAreas: 2,
            maxCountAreas: 4,
            defaultTileTint: 0xD99E18,
            minCountStuff: 0,
            maxCountStuff: 0,
            stuffSpritesheetKey: 'stuff',
        }
    ],
    dungeon: [
        {
            mapConfigName: 'cave_small',
            mapConfigCategories: ['cave'],
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: 'terrain_16',
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 30,
            minMapHeight: 40,
            maxMapWidth: 30,
            maxMapHeight: 40,
            externalIconTileIndex: 4,
            wallTileWeights: [
                {index: 0, weight: 5},
                {index: 1, weight: 1},
            ],
            floorTileWeights: [
                {index: 59, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'wall',
                minSize: 8,
                maxSize: 8,
                focusTileIndex: 3,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: 'overworld',
                    availableLinkedMapConfigName: ['forest_temples']
                }
            ],
            maxExitAreaCount: 1,
            otherAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    focusTileIndex: null,
                }
            ],
            minCountAreas: 2,
            maxCountAreas: 4,
            defaultTileTint: 0x8D6981,
            minCountStuff: 6,
            maxCountStuff: 10,
            stuffSpritesheetKey: 'stuff',
        },
        {
            mapConfigName: 'fire_cave_small',
            mapConfigCategories: ['cave'],
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: 'terrain_16',
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 90,
            minMapHeight: 30,
            maxMapWidth: 140,
            maxMapHeight: 40,
            externalIconTileIndex: 5,
            wallTileWeights: [
                {index: 0, weight: 5},
                {index: 1, weight: 1},
            ],
            floorTileWeights: [
                {index: 59, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'wall',
                minSize: 8,
                maxSize: 8,
                focusTileIndex: 3,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: 'overworld',
                    availableLinkedMapConfigName: ['forest_temples']
                }
            ],
            maxExitAreaCount: 1,
            otherAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    focusTileIndex: null,
                }
            ],
            minCountAreas: 2,
            maxCountAreas: 4,
            defaultTileTint: 0x81102D,
            minCountStuff: 16,
            maxCountStuff: 20,
            stuffSpritesheetKey: 'stuff',
        },
    ],
}