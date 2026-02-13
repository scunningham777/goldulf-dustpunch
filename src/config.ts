import { SiteConfig } from "./interfaces/siteConfig";
import { CAVE_TINT, SETTLEMENT_TINT, SITE_GENERATION_TYPES, SITE_TYPES, TEMPLE_TINT, TERRAIN_TEXTURE_KEY } from './constants';
import { StuffConfig } from "./interfaces/stuffConfig";
import { AncestorConfig } from "./interfaces/ancestorConfig";
import { TokenConfig } from "./interfaces/tokenConfig";

export const MAP_CONFIGS: {[T in SITE_TYPES]: SiteConfig[]} = {
    'overworld': [
        {
            ancestorTypeWeights: [],
            siteType: SITE_TYPES.overworld,
            mapConfigName: 'new_game',
            siteGenerationType: SITE_GENERATION_TYPES.cave,
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
                    availableLinkedMapConfigName: [/*'temple', 'cave',*/ 'settlement']
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
            siteGenerationType: SITE_GENERATION_TYPES.cave,
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
                    availableLinkedMapConfigName: [/*'temple', 'cave',*/ 'settlement']
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
                    weight: 4,
                },
                {
                    key: 'temple_ancestor',
                    weight: 1,
                }
            ],
            siteType: SITE_TYPES.site,
            mapConfigName: 'temple',
            siteGenerationType: SITE_GENERATION_TYPES.temple,
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 40,
            minMapHeight: 70,
            maxMapWidth: 40,
            maxMapHeight: 70,
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
            defaultTileTint: TEMPLE_TINT,
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
            siteGenerationType: SITE_GENERATION_TYPES.cave,
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 90,
            minMapHeight: 30,
            maxMapWidth: 140,
            maxMapHeight: 100,
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
            defaultTileTint: CAVE_TINT,
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
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 3,
                },
                {
                    key: 'settlement_ancestor',
                    weight: 1,
                }
            ],
            siteType: SITE_TYPES.site,
            mapConfigName: 'settlement',
            siteGenerationType: SITE_GENERATION_TYPES.settlement,
            isRandomlySelectable: true,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 90,
            minMapHeight: 30,
            maxMapWidth: 140,
            maxMapHeight: 100,
            externalIconTileIndex: 0,
            wallTileWeights: [
                {index: 7, weight: 10},
                {index: 8, weight: 1},
                {index: 9, weight: 4},
            ],
            floorTileWeights: [
                {index: 59, weight: 1},
            ],
            obstructionTileWeights: [
                {index: 1, weight: 1},
            ],
            entranceAreaConfig: {
                placement: 'wall',
                minSize: 8,
                maxSize: 8,
                focusTileIndex: 4,
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
            defaultTileTint: SETTLEMENT_TINT,
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
        tint: CAVE_TINT,
    },
    {
        key: 'ring',
        frameIndex: 13,
        points: 50,
        tint: TEMPLE_TINT,
    },
    {
        key: 'crown',
        frameIndex: 14,
        points: 50,
        tint: SETTLEMENT_TINT,
    },
    {
        key: 'pearl',
        frameIndex: 15,
        points: 50,
        tint: 0xffffff,
    },
]
