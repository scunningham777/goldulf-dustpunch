import { SITE_TYPES } from "../constants";

export interface MapArea {
    size: number;
    focusX: number;
    focusY: number;
    focusTileIndex: number;
    linkedMapConfigType: SITE_TYPES;
    linkedMapConfigName?: string;
    linkedMapConfigCategory?: string;
    isAccessible: boolean;
};
