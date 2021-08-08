import { SITE_TYPES } from "../constants";

export interface AreaConfig {
    placement: 'wall'|'floor';
    minSize: number;
    maxSize: number;
    focusTileIndex?: number;
    linkedMapConfigType?: SITE_TYPES;
    availableLinkedMapConfigName?: string[];
    availableLinkedMapConfigCategory?: string[];
}