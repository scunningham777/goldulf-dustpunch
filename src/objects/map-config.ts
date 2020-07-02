export interface MapConfig {
    tileWidth: number;
    tileHeight: number;
    minMapWidth: number;
    minMapHeight: number;
    maxMapWidth: number;
    maxMapHeight: number;
    tilesetKey: string;
    minCountAreas: number;
    maxCountAreas: number;
    wallTileWeights: {index: number, weight: number}[];
    floorTileWeights: {index: number, weight: number}[];
}
