import { SiteConfig } from "./interfaces/siteConfig";
import { BOG_TINT, CAVE_TINT, HERO_TINT, OVERWORLD_TINT, SETTLEMENT_TINT, SITE_GENERATION_TYPES, SITE_TYPES, TEMPLE_TINT, TERRAIN_TEXTURE_KEY } from './constants';
import { StuffConfig } from "./interfaces/stuffConfig";
import { AncestorConfig } from "./interfaces/ancestorConfig";
import { TokenConfig } from "./interfaces/tokenConfig";
import { RelicConfig } from "./interfaces/relicConfig";

export const MAP_CONFIGS: { [T in SITE_TYPES]: SiteConfig[] } = {
    'overworld': [
        {
            ancestorTypeWeights: [],
            siteType: SITE_TYPES.overworld,
            mapConfigName: 'new_game',
            siteGenerationType: SITE_GENERATION_TYPES.cave,
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
                { index: 7, weight: 10 },
                { index: 8, weight: 4 },
                { index: 9, weight: 1 },
            ],
            floorTileWeights: [
                { index: 59, weight: 20 },
                { index: 11, weight: 4 },
                { index: 12, weight: 1 },
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
                    availableLinkedMapConfigName: ['temple', 'cave', 'settlement', 'bog']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['temple_special'],
                    requiredTokens: { ring: 4 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_cave'],
                    requiredTokens: { diamond: 4 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_settlement'],
                    requiredTokens: { crown: 4 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_bog'],
                    requiredTokens: { pearl: 4 }
                },
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
            defaultTileTint: OVERWORLD_TINT,
            dustWeight: 0,
            availableDustFrames: [],
            stuffTypeWeights: [],
        },
        {
            ancestorTypeWeights: [],
            siteType: SITE_TYPES.overworld,
            mapConfigName: 'forest_temples',
            siteGenerationType: SITE_GENERATION_TYPES.cave,
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
                { index: 7, weight: 10 },
                { index: 8, weight: 4 },
                { index: 9, weight: 1 },
            ],
            floorTileWeights: [
                { index: 59, weight: 20 },
                { index: 11, weight: 4 },
                { index: 12, weight: 1 },
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
                    availableLinkedMapConfigName: ['temple', 'cave', 'settlement', 'bog']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_temple'],
                    requiredTokens: { ring: 4 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_cave'],
                    requiredTokens: { diamond: 4 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_settlement'],
                    requiredTokens: { crown: 4 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_bog'],
                    requiredTokens: { pearl: 4 }
                },
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
            defaultTileTint: OVERWORLD_TINT,
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
            siteGenerationType: SITE_GENERATION_TYPES.temple,
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
                { index: 10, weight: 1 },
            ],
            floorTileWeights: [
                { index: 59, weight: 1 },
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
            minCountAreas: 3,
            maxCountAreas: 5,
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
                { index: 0, weight: 5 },
                { index: 1, weight: 1 },
            ],
            floorTileWeights: [
                { index: 59, weight: 1 },
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
            minCountAreas: 1,
            maxCountAreas: 1,
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
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 90,
            minMapHeight: 30,
            maxMapWidth: 140,
            maxMapHeight: 100,
            externalIconTileIndex: 16,
            wallTileWeights: [
                { index: 7, weight: 10 },
                { index: 8, weight: 1 },
                { index: 9, weight: 4 },
            ],
            floorTileWeights: [
                { index: 59, weight: 20 },
                { index: 11, weight: 4 },
                { index: 12, weight: 1 },
            ],
            pathObstructionTileWeights: [
                { index: 10, weight: 1 },
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
                    obstructionTileWeights: [{ index: 10, weight: 1 }],
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
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 3,
                },
                {
                    key: 'bog_ancestor',
                    weight: 1,
                }
            ],
            siteType: SITE_TYPES.site,
            mapConfigName: 'bog',
            siteGenerationType: SITE_GENERATION_TYPES.bog,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 60,
            minMapHeight: 30,
            maxMapWidth: 100,
            maxMapHeight: 70,
            externalIconTileIndex: 25,
            wallTileWeights: [
                { index: 7, weight: 10 },
                { index: 8, weight: 1 },
                { index: 9, weight: 4 },
            ],
            floorTileWeights: [
                { index: 59, weight: 20 },
                { index: 11, weight: 4 },
                { index: 12, weight: 1 },
            ],
            pathObstructionTileWeights: [
                { index: 10, weight: 1 },
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
                    minSize: 4,
                    maxSize: 6,
                    focusTileIndex: null,
                    obstructionTileWeights: [{ index: 10, weight: 1 }],
                }
            ],
            minCountAreas: 2,
            maxCountAreas: 4,
            defaultTileTint: BOG_TINT,
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
    'gatedSite': [
        {
            ancestorTypeWeights: [
                {
                    key: 'supreme_temple_ancestor',
                    weight: 1,
                },
            ],
            siteType: SITE_TYPES.gatedSite,
            mapConfigName: 'supreme_temple',
            siteGenerationType: SITE_GENERATION_TYPES.temple,
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
                { index: 10, weight: 1 },
            ],
            floorTileWeights: [
                { index: 59, weight: 1 },
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
            siteType: SITE_TYPES.gatedSite,
            mapConfigName: 'supreme_cave',
            siteGenerationType: SITE_GENERATION_TYPES.cave,
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
                { index: 0, weight: 5 },
                { index: 1, weight: 1 },
            ],
            floorTileWeights: [
                { index: 59, weight: 1 },
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
            siteType: SITE_TYPES.gatedSite,
            mapConfigName: 'supreme_settlement',
            siteGenerationType: SITE_GENERATION_TYPES.settlement,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 90,
            minMapHeight: 30,
            maxMapWidth: 140,
            maxMapHeight: 100,
            externalIconTileIndex: 16,
            wallTileWeights: [
                { index: 7, weight: 10 },
                { index: 8, weight: 1 },
                { index: 9, weight: 4 },
            ],
            floorTileWeights: [
                { index: 59, weight: 20 },
                { index: 11, weight: 4 },
                { index: 12, weight: 1 },
            ],
            pathObstructionTileWeights: [
                { index: 10, weight: 1 },
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
                    obstructionTileWeights: [{ index: 10, weight: 1 }],
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
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 3,
                },
                {
                    key: 'bog_ancestor',
                    weight: 1,
                }
            ],
            siteType: SITE_TYPES.gatedSite,
            mapConfigName: 'supreme_bog',
            siteGenerationType: SITE_GENERATION_TYPES.bog,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 60,
            minMapHeight: 30,
            maxMapWidth: 100,
            maxMapHeight: 70,
            externalIconTileIndex: 25,
            wallTileWeights: [
                { index: 7, weight: 10 },
                { index: 8, weight: 1 },
                { index: 9, weight: 4 },
            ],
            floorTileWeights: [
                { index: 59, weight: 20 },
                { index: 11, weight: 4 },
                { index: 12, weight: 1 },
            ],
            pathObstructionTileWeights: [
                { index: 10, weight: 1 },
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
                    minSize: 4,
                    maxSize: 6,
                    focusTileIndex: null,
                    obstructionTileWeights: [{ index: 10, weight: 1 }],
                }
            ],
            minCountAreas: 2,
            maxCountAreas: 4,
            defaultTileTint: BOG_TINT,
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
        relicKey: '',
        frameIndex: 0,
        overrideTint: 0xffffff,
    },
    {
        key: 'cave_ancestor',
        tokenKey: 'diamond',
        relicKey: '',
        frameIndex: 0,
    },
    {
        key: 'temple_ancestor',
        tokenKey: 'ring',
        relicKey: '',
        frameIndex: 0,
    },
    {
        key: 'settlement_ancestor',
        tokenKey: 'scales',
        relicKey: '',
        frameIndex: 0,
    },
    {
        key: 'bog_ancestor',
        tokenKey: 'fasces',
        relicKey: '',
        frameIndex: 0,
    },
    {
        key: 'supreme_temple_ancestor',
        tokenKey: '',
        relicKey: 'sandal',
        frameIndex: 1
    },
    {
        key: 'supreme_cave_ancestor',
        tokenKey: '',
        relicKey: 'dagger',
        frameIndex: 1
    },
    {
        key: 'supreme_settlement_ancestor',
        tokenKey: '',
        relicKey: 'crown',
        frameIndex: 1
    },
    {
        key: 'supreme_bog_ancestor',
        tokenKey: '',
        relicKey: 'pearl',
        frameIndex: 1
    },
]

export const TOKEN_CONFIGS: TokenConfig[] = [
    {
        key: 'diamond',
        frameIndex: 20,
        points: 50,
        tint: CAVE_TINT,
    },
    {
        key: 'ring',
        frameIndex: 21,
        points: 50,
        tint: TEMPLE_TINT,
    },
    {
        key: 'scales',
        frameIndex: 22,
        points: 50,
        tint: SETTLEMENT_TINT,
    },
    {
        key: 'fasces',
        frameIndex: 23,
        points: 50,
        tint: BOG_TINT,
    },
]

export const RELIC_CONFIGS: RelicConfig[] = [
    {
        key: 'sandal',
        frameIndex: 28,
        points: 100,
        tint: TEMPLE_TINT,
        description: 'A winged sandal. Activate it to dash!'
    },
    {
        key: 'dagger',
        frameIndex: 29,
        points: 100,
        tint: CAVE_TINT,
        description: 'A winged sandal. Activate it to dash!'
    },
    {
        key: 'crown',
        frameIndex: 30,
        points: 100,
        tint: SETTLEMENT_TINT,
        description: 'A winged sandal. Activate it to dash!'
    },
    {
        key: 'pearl',
        frameIndex: 31,
        points: 100,
        tint: BOG_TINT,
        description: 'A winged sandal. Activate it to dash!'
    },
    {
        key: 'cestus',
        frameIndex: 32,
        points: 100,
        tint: HERO_TINT,
        description: 'A winged sandal. Activate it to dash!'
    },
];
