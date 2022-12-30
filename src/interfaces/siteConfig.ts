import { SITE_TYPES } from "../constants";
import { AreaConfig } from "./areaConfig";
import { IndexedWeightRecord } from "./indexedWeightRecord";
import { KeyedWeightRecord } from "./keyedWeightRecord";

export interface SiteConfig {
    ancestorTypeWeights: KeyedWeightRecord[];
    siteType: SITE_TYPES;
    mapConfigName: string;
    mapConfigCategories: string[];
    isRandomlySelectable: boolean;
    tileWidth: number;
    tileHeight: number;
    tilesetKey: string;
    tilesetMargin?: number;
    tileSpacing?: number;
    minMapWidth: number;
    minMapHeight: number;
    maxMapWidth: number;
    maxMapHeight: number;
    externalIconTileIndex: number;
    wallTileWeights: IndexedWeightRecord[];
    floorTileWeights: IndexedWeightRecord[];
    dustWeight: number;
    availableDustFrames: number[];
    stuffTypeWeights: KeyedWeightRecord[];
    entranceAreaConfig: AreaConfig;
    exitAreaConfigs: AreaConfig[];
    maxExitAreaCount: number;
    otherAreaConfigs: AreaConfig[];
    minCountAreas: number;
    maxCountAreas: number;
    defaultTileTint: number;
    tileTintOverrides?: {index: number, tintValue: number}[];
}
