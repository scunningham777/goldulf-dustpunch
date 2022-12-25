import { SiteConfig } from "./interfaces/siteConfig";
import { SITE_TYPES, TERRAIN_TEXTURE_KEY } from './constants';
import { StuffConfig } from "./interfaces/stuffConfig";
import { AncestorConfig } from "./interfaces/ancestorConfig";
import { TokenConfig } from "./interfaces/TokenConfig";

export const MAP_CONFIGS: {[T in SITE_TYPES]: SiteConfig[]} = {
    'overworld': [
        {
            ancestorTypeWeights: [],
            siteType: SITE_TYPES.overworld,
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
                {index: 7, weight: 10},
                {index: 8, weight: 4},
                {index: 9, weight: 1},
            ],
            floorTileWeights: [
                {index: 59, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'floor',
                minSize: 5,
                maxSize: 10,
                focusTileIndex: -1,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['temple', 'cave']
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
            availableDustFrames: [],
            stuffTypeWeights: [],
        },
        {
            ancestorTypeWeights: [],
            siteType: SITE_TYPES.overworld,
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
                {index: 7, weight: 10},
                {index: 8, weight: 4},
                {index: 9, weight: 1},
            ],
            floorTileWeights: [
                {index: 59, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'floor',
                minSize: 5,
                maxSize: 10,
                focusTileIndex: 4,
            },
            exitAreaConfigs: [
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['temple', 'cave']
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
            availableDustFrames: [],
            stuffTypeWeights: [],
        }
    ],
    'site': [
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 0,
                },
                {
                    key: 'temple_ancestor',
                    weight: 1,
                }
            ],
            siteType: SITE_TYPES.site,
            mapConfigName: 'temple',
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
            exitAreaConfigs: [],
            maxExitAreaCount: 0,
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
            defaultTileTint: 0xbD69b1,
            dustWeight: 20,
            availableDustFrames: [0, 1, 2, 3],
            stuffTypeWeights: [
                {
                    key: 'chest',
                    weight: 1
                },
                {
                    key: 'goblet',
                    weight: 1
                },
                {
                    key: 'urn',
                    weight: 2
                },
                {
                    key: '',
                    weight: 36
                }
            ],
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 3,
                },
                {
                    key: 'cave_ancestor',
                    weight: 1,
                }
            ],
            siteType: SITE_TYPES.site,
            mapConfigName: 'cave',
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
            externalIconTileIndex: 6,
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
            exitAreaConfigs: [],
            maxExitAreaCount: 0,
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
            defaultTileTint: 0xa1102D,
            dustWeight: 15,
            availableDustFrames: [0, 1, 2, 3],
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
                    key: 'trophy',
                    weight: 1
                },
                {
                    key: '',
                    weight: 63
                }
            ],
        },
    ],
}

export const STUFF_CONFIGS: StuffConfig[] = [
    {
        stuffName: 'chest',
        frameIndex: 16,
        points: 15
    },
    {
        stuffName: 'goblet',
        frameIndex: 17,
        points: 10
    },
    {
        stuffName: 'trophy',
        frameIndex: 18,
        points: 10
    },
    {
        stuffName: 'urn',
        frameIndex: 19,
        points: 10
    }
]

export const ANCESTOR_CONFIGS: AncestorConfig[] = [
    {
        key: 'basic_ancestor',
        tokenKey: '',
        frameIndex: 0,
        overrideTint: 0xffffff,
    },
    {
        key: 'cave_ancestor',
        tokenKey: 'diamond',
        frameIndex: 1,
    },
    {
        key: 'temple_ancestor',
        tokenKey: 'ring',
        frameIndex: 2,
    },
    {
        key: 'settlement_ancestor',
        tokenKey: 'crown',
        frameIndex: 3,
    },
    {
        key: 'bog_ancestor',
        tokenKey: 'pearl',
        frameIndex: 4,
    },
]

export const TOKEN_CONFIGS: TokenConfig[] = [
    {
        key: 'diamond',
        frameIndex: 12,
        points: 50,
    },
    {
        key: 'ring',
        frameIndex: 13,
        points: 50,
    },
    {
        key: 'crown',
        frameIndex: 14,
        points: 50,
    },
    {
        key: 'pearl',
        frameIndex: 15,
        points: 50,
    },
]
