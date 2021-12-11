import { SiteConfig } from "./interfaces/siteConfig";
import { SITE_TYPES, TERRAIN_TEXTURE_KEY } from './constants';
import StuffConfig from "./interfaces/stuffConfig";

export const MAP_CONFIGS: {[T in SITE_TYPES]: SiteConfig[]} = {
    'overworld': [
        {
            mapConfigName: 'new_game',
            mapConfigCategories: [],
            isRandomlySelectable: false,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
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
                    linkedMapConfigType: SITE_TYPES.site,
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
            dustWeight: 0,
            stuffTypeWeights: [],
        },
        {
            mapConfigName: 'forest_temples',
            mapConfigCategories: [],
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
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
                    linkedMapConfigType: SITE_TYPES.site,
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
            dustWeight: 0,
            stuffTypeWeights: [],
        }
    ],
    'site': [
        {
            mapConfigName: 'cave_small',
            mapConfigCategories: ['cave'],
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
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
                    placement: 'wall',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.overworld,
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
            dustWeight: 8,
            stuffTypeWeights: [
                {
                    key: 'chest',
                    weight: 2
                },
                {
                    key: 'urn',
                    weight: 4
                },
                {
                    key: '',
                    weight: 6
                }
            ],
        },
        {
            mapConfigName: 'fire_cave_small',
            mapConfigCategories: ['cave'],
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
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
                    placement: 'wall',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.overworld,
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
            dustWeight: 5,
            stuffTypeWeights: [
                {
                    key: 'chest',
                    weight: 4
                },
                {
                    key: 'urn',
                    weight: 2
                },
                {
                    key: '',
                    weight: 6
                }
            ],
        },
    ],
}

export const STUFF_CONFIGS: StuffConfig[] = [
    {
        stuffName: 'chest',
        frameIndex: 4,
        points: 15
    },
    {
        stuffName: 'urn',
        frameIndex: 5,
        points: 10
    }
]
