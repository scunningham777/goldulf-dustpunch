import { AreaConfig } from "./area-config";

export interface MapConfig {
    mapConfigName: string;
    isRandomlySelectable: boolean;
    tileWidth: number;
    tileHeight: number;
    minMapWidth: number;
    minMapHeight: number;
    maxMapWidth: number;
    maxMapHeight: number;
    tilesetKey: string;
    wallTileWeights: {index: number, weight: number}[];
    floorTileWeights: {index: number, weight: number}[];
    entranceAreaConfig: AreaConfig;
    exitAreaConfigs: AreaConfig[];
    maxExitAreaCount: number;
    otherAreaConfigs: AreaConfig[];
    minCountAreas: number;
    maxCountAreas: number;
}
