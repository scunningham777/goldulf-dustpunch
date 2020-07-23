export interface AreaConfig {
    placement: 'wall'|'floor';
    minSize: number;
    maxSize: number;
    focusTileIndex?: number;
    availableLinkedMapConfigName?: string[];
    availableLinkedMapConfigCategory?: string[];
}