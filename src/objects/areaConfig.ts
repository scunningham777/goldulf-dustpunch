export interface AreaConfig {
    placement: 'wall'|'floor';
    minSize: number;
    maxSize: number;
    focusTileIndex?: number;
    linkedMapConfigType?: 'dungeon'|'overworld';
    availableLinkedMapConfigName?: string[];
    availableLinkedMapConfigCategory?: string[];
}