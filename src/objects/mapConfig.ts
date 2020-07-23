import { AreaConfig } from "./areaConfig";

export interface MapConfig {
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
    wallTileWeights: {index: number, weight: number}[];
    floorTileWeights: {index: number, weight: number}[];
    entranceAreaConfig: AreaConfig;
    exitAreaConfigs: AreaConfig[];
    maxExitAreaCount: number;
    otherAreaConfigs: AreaConfig[];
    minCountAreas: number;
    maxCountAreas: number;
    defaultTileTint: number;
    tileTintOverrides?: {index: number, tintValue: number}[];
    minCountStuff: number;
    maxCountStuff: number;
    stuffSpritesheetKey: string;
}
