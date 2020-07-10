import { AreaConfig } from "./area-config";

export interface MapConfig {
    mapConfigName: string;
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
    wallTileWeights: {index: number, weight: number}[];
    floorTileWeights: {index: number, weight: number}[];
    entranceAreaConfig: AreaConfig;
    exitAreaConfigs: AreaConfig[];
    maxExitAreaCount: number;
    otherAreaConfigs: AreaConfig[];
    minCountAreas: number;
    maxCountAreas: number;
}
