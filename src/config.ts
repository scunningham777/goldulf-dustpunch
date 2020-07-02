import { MapConfig } from "./objects/map-config";

export const MAP_CONFIGS: {[T in 'overworld'|'dungeon']: MapConfig[]} = {
    overworld: [
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