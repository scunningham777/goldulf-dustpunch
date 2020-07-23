export default interface MapArea {
    size: number;
    focusX: number;
    focusY: number;
    focusTileIndex: number;
    linkedMapConfigType: 'overworld'|'dungeon';
    linkedMapConfigName?: string;
    linkedMapConfigCategory?: string;
    isAccessible: boolean;
};
