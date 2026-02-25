import { SITE_TYPES } from "../constants";
import { IndexedWeightRecord } from "./indexedWeightRecord";

export interface AreaConfig {
    placement: 'wall'|'floor';
    minSize: number;
    maxSize: number;
    focusTileIndex?: number;
    linkedMapConfigType?: SITE_TYPES;
    availableLinkedMapConfigName?: string[];
    availableLinkedMapConfigCategory?: string[];
    obstructionTileWeights?: IndexedWeightRecord[];
    /**
     * When provided the generator will only consider this config if the
     * player has at least the specified quantity of each named token in
     * their inventory.  Keys correspond to `inventoryItemKey` values and
     * values are minimum quantities.
     */
    requiredTokens?: { [tokenKey: string]: number };
}