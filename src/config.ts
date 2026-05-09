import { SiteConfig } from "./interfaces/siteConfig";
import { BOG_TINT, CAVE_TINT, HERO_TINT, OVERWORLD_TINT, SETTLEMENT_TINT, SITE_GENERATION_TYPES, SITE_TYPES, SUPREME_SITE_TINT, TEMPLE_TINT, TERRAIN_TEXTURE_KEY } from './constants';
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
                    availableLinkedMapConfigName: ['temple']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['cave']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['settlement']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['bog']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_temple'],
                    requiredTokens: { ring: 3 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_cave'],
                    requiredTokens: { diamond: 3 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_settlement'],
                    requiredTokens: { scales: 3 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_bog'],
                    requiredTokens: { fasces: 3 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['ultimate'],
                    requiredTokens: { ring: 1, diamond: 1, scales: 1, fasces: 1 }
                },
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
            tileTints: [OVERWORLD_TINT],
            dustWeight: 0,
            availableDustFrames: [],
            stuffTypeWeights: [],
            allowExtraExitAreas: true,
            songTitle: 'ramble'
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
                    availableLinkedMapConfigName: ['temple']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['cave']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['settlement']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.site,
                    availableLinkedMapConfigName: ['bog']
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_temple'],
                    requiredTokens: { ring: 3 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_cave'],
                    requiredTokens: { diamond: 3 }
                },  
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_settlement'],
                    requiredTokens: { scales: 3 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['supreme_bog'],
                    requiredTokens: { fasces: 3 }
                },
                {
                    placement: 'floor',
                    minSize: 5,
                    maxSize: 10,
                    linkedMapConfigType: SITE_TYPES.gatedSite,
                    availableLinkedMapConfigName: ['ultimate'],
                    requiredTokens: { ring: 1, diamond: 1, scales: 1, fasces: 1 }
                },
            ],
            maxExitAreaCount: 2,
            allowExtraExitAreas: true,
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
            tileTints: [OVERWORLD_TINT],
            dustWeight: 0,
            availableDustFrames: [],
            stuffTypeWeights: [],
            songTitle: 'ramble'
        }
    ],
    'site': [
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 2,
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
            minCountAreas: 5,
            maxCountAreas: 8,
            tileTints: [TEMPLE_TINT],
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
            songTitle: 'duty'
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 2,
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
            minMapWidth: 60,
            minMapHeight: 30,
            maxMapWidth: 110,
            maxMapHeight: 80,
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
            maxCountAreas: 3,
            tileTints: [CAVE_TINT],
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
            songTitle: 'duty'
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 2,
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
            minMapWidth: 60,
            minMapHeight: 30,
            maxMapWidth: 100,
            maxMapHeight: 80,
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
            tileTints: [SETTLEMENT_TINT],
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
            songTitle: 'duty'
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'basic_ancestor',
                    weight: 2,
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
            tileTints: [BOG_TINT],
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
            songTitle: 'dredger'
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
            maxMapWidth: 60,
            maxMapHeight: 100,
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
            minCountAreas: 6,
            maxCountAreas: 9,
            tileTints: [TEMPLE_TINT, TEMPLE_TINT, SUPREME_SITE_TINT],
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
            songTitle: 'duty'
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'supreme_cave_ancestor',
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
            minCountAreas: 3,
            maxCountAreas: 5,
            tileTints: [CAVE_TINT, CAVE_TINT, SUPREME_SITE_TINT],
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
            songTitle: 'duty'
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'supreme_settlement_ancestor',
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
            minCountAreas: 4,
            maxCountAreas: 7,
            tileTints: [SETTLEMENT_TINT, SETTLEMENT_TINT, SUPREME_SITE_TINT],
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
            songTitle: 'duty'
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'supreme_bog_ancestor',
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
            maxMapWidth: 120,
            maxMapHeight: 90,
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
            minCountAreas: 6,
            maxCountAreas: 9,
            tileTints: [BOG_TINT, BOG_TINT, SUPREME_SITE_TINT],
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
            songTitle: 'dredger'
        },
        {
            ancestorTypeWeights: [
                {
                    key: 'ultimate_ancestor',
                    weight: 1,
                }
            ],
            siteType: SITE_TYPES.gatedSite,
            mapConfigName: 'ultimate',
            siteGenerationType: SITE_GENERATION_TYPES.settlement,
            tileWidth: 16,
            tileHeight: 16,
            tilesetKey: TERRAIN_TEXTURE_KEY,
            tilesetMargin: 1,
            tileSpacing: 2,
            minMapWidth: 80,
            minMapHeight: 60,
            maxMapWidth: 120,
            maxMapHeight: 90,
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
                    minSize: 6,
                    maxSize: 12,
                    focusTileIndex: null,
                    obstructionTileWeights: [{ index: 10, weight: 1 }],
                }
            ],
            minCountAreas: 7,
            maxCountAreas: 10,
            tileTints: [
                TEMPLE_TINT, 
                TEMPLE_TINT,
                CAVE_TINT, 
                CAVE_TINT,
                BOG_TINT,
                BOG_TINT,
                SETTLEMENT_TINT, 
                SETTLEMENT_TINT,
            ],
            dustWeight: 60,
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
                    weight: 40
                }
            ],
            songTitle: 'duty'
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
        relicKey: 'dagger',
        frameIndex: 1,
        overrideTint: TEMPLE_TINT
    },
    {
        key: 'supreme_cave_ancestor',
        tokenKey: '',
        relicKey: 'crown',
        frameIndex: 1,
        overrideTint: CAVE_TINT
    },
    {
        key: 'supreme_settlement_ancestor',
        tokenKey: '',
        relicKey: 'sandal',
        frameIndex: 1,
        overrideTint: SETTLEMENT_TINT
    },
    {
        key: 'supreme_bog_ancestor',
        tokenKey: '',
        relicKey: 'orb',
        frameIndex: 1,
        overrideTint: BOG_TINT
    },
    {
        key: 'ultimate_ancestor',
        tokenKey: '',
        relicKey: 'cestus',
        frameIndex: 1
    }
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
        tint: SETTLEMENT_TINT,
        description: 'A winged sandal. Double-tap any direction to dash!'
    },
    {
        key: 'dagger',
        frameIndex: 29,
        points: 100,
        tint: TEMPLE_TINT,
        description: 'A ceremonial dagger. Space to sacrifice all the dust around you!'
    },
    {
        key: 'crown',
        frameIndex: 30,
        points: 100,
        tint: CAVE_TINT,
        description: 'The Diadem of Detritus. Bestows the authority to use dust against dust!'
    },
    {
        key: 'orb',
        frameIndex: 31,
        points: 100,
        tint: BOG_TINT,
        description: 'Ponder the Orb of Deobfuscation! Helps you track down more of the places your ancestors died in.'
    },
    {
        key: 'cestus',
        frameIndex: 37,
        points: 100,
        tint: HERO_TINT,
        description: 'Cestus of the Yesterpunch. Now you can punch something other than dust: walls!'
    },
];
