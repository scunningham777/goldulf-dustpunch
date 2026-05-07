import { SITE_GENERATION_TYPES, SITE_TYPES } from "../constants";
import { AreaConfig } from "./areaConfig";
import { IndexedWeightRecord } from "./indexedWeightRecord";
import { KeyedWeightRecord } from "./keyedWeightRecord";

export interface SiteConfig {
    allowExtraExitAreas?: boolean;
    ancestorTypeWeights: KeyedWeightRecord[];
    availableDustFrames: number[];
    dustWeight: number;
    entranceAreaConfig: AreaConfig;
    exitAreaConfigs: AreaConfig[];
    externalIconTileIndex: number;
    floorTileWeights: IndexedWeightRecord[];
    mapConfigName: string;
    maxCountAreas: number;
    maxExitAreaCount: number;
    maxMapHeight: number;
    maxMapWidth: number;
    minCountAreas: number;
    minMapHeight: number;
    minMapWidth: number;
    otherAreaConfigs: AreaConfig[];
    pathObstructionTileWeights?: IndexedWeightRecord[];
    siteGenerationType: SITE_GENERATION_TYPES;
    siteType: SITE_TYPES;
    songTitle: string;
    stuffTypeWeights: KeyedWeightRecord[];
    tileHeight: number;
    tilesetKey: string;
    tilesetMargin?: number;
    tileTints: number[];
    tileTintOverrides?: {index: number, tintValue: number}[];
    tileSpacing?: number;
    tileWidth: number;
    wallTileWeights: IndexedWeightRecord[];
}
