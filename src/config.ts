import { MapConfig } from "./objects/map-config";

export const MAP_CONFIGS: {[T in 'overworld'|'dungeon']: MapConfig[]} = {
    overworld: [
        {
            tileWidth: 32,
            tileHeight: 32,
            minMapWidth: 30,
            minMapHeight: 40,
            maxMapWidth: 30,
            maxMapHeight: 40,
            tilesetKey: 'terrain',
            wallTileWeights: [
                {index: 2, weight: 5},
                {index: 3, weight: 5},
                {index: 6, weight: 1},
            ],
            floorTileWeights: [
                {index: 5, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'floor',
                minSize: 5,
                maxSize: 10,
                focusTileIndex: 0,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    focusTileIndex: 1,
                }
            ],
            maxExitAreaCount: 2,
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
        }
    ],
    dungeon: [
        {
            tileWidth: 32,
            tileHeight: 32,
            minMapWidth: 30,
            minMapHeight: 40,
            maxMapWidth: 30,
            maxMapHeight: 40,
            tilesetKey: 'terrain',
            wallTileWeights: [
                {index: 53, weight: 9},
                {index: 52, weight: 1},
            ],
            floorTileWeights: [
                {index: 30, weight: 1},
                {index: 54, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'wall',
                minSize: 8,
                maxSize: 8,
                focusTileIndex: 50,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    focusTileIndex: 26,
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
        }
    ],
}