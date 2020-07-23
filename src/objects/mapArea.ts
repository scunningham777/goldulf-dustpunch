export default interface MapArea {
    size: number;
    focusX: number;
    focusY: number;
    focusTileIndex: number;
    linkedMapConfigName?: string;
    linkedMapConfigCategory?: string;
    isAccessible: boolean;
};
