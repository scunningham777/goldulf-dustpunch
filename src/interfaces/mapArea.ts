import { SITE_TYPES } from "../constants";

export interface MapArea {
    size: number;
    focusX: number;
    focusY: number;
    focusTileIndex: number;
    linkedMapConfigType: SITE_TYPES;
    linkedMapConfigName?: string;
    linkedMapConfigCategory?: string;
    /** optional token deduction that should happen when the player uses this exit */
    requiredTokens?: { [tokenKey: string]: number };
    isAccessible: boolean;
};
