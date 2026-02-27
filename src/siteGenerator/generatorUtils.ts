import { GAME_SCALE, STATIC_TEXTURE_KEY } from "../constants";
import { AreaConfig } from "../interfaces/areaConfig";
import { MapArea } from "../interfaces/mapArea";
import { SiteConfig } from "../interfaces/siteConfig";
import { InventoryItem } from "../interfaces/stuffInInventory";
import { CARDINAL_DIRECTION, weightedRandomizeAnything } from "../utils";
import { DustModel } from "./dustModel";

/**
 * Simple predicate builder for token requirements.  Use this in any
 * generator that needs to filter area configs based on the current
 * inventory.  The returned function is safe to call repeatedly.
 */
export function tokenRequirementFilter(
    inventoryTokens: InventoryItem[] = []
): (config: AreaConfig) => boolean {
    return (config: AreaConfig) => {
        if (!config.requiredTokens) {
            return true;
        }
        return Object.entries(config.requiredTokens).every(([k, qty]) => {
            const inv = inventoryTokens.find(i => i.inventoryItemKey === k);
            return !!inv && inv.quantity >= qty;
        });
    };
}

/**
 * Create a 2‑D array of wall tile indices based on the provided weights.
 */
export function generateTileIndexData(
    siteWidth: number,
    siteHeight: number,
    wallTileWeights: { key: number; weight: number }[]
): number[][] {
    const tileIndexData: number[][] = [];
    for (let y = 0; y < siteHeight; y++) {
        tileIndexData[y] = [];
        for (let x = 0; x < siteWidth; x++) {
            tileIndexData[y][x] = weightedRandomizeAnything(wallTileWeights);
        }
    }
    return tileIndexData;
}

/**
 * Tests whether a candidate area overlaps any existing area.  This is the
 * same algorithm used across all generators.
 */
export function isAreaCollision(
    existingAreas: MapArea[],
    potentialArea: MapArea
): boolean {
    for (let existingArea of existingAreas) {
        const absX = Math.abs(existingArea.focusX - potentialArea.focusX);
        const absY = Math.abs(existingArea.focusY - potentialArea.focusY);
        if (absX + absY <= (potentialArea.size / 2) + (existingArea.size / 2)) {
            return true;
        }
    }
    return false;
}

/**
 * Builds a new MapArea from the provided configuration, randomly choosing
 * position and any linked map values.  This encapsulates the shared
 * placement logic used by every generator.
 */
export function generateRandomArea(
    areaConfig: AreaConfig,
    maxXCoord: number,
    maxYCoord: number
): MapArea {
    const newArea: MapArea = {
        size: Phaser.Math.RND.integerInRange(areaConfig.minSize, areaConfig.maxSize),
        focusX: 0,
        focusY: 0,
        focusTileIndex: areaConfig.focusTileIndex,
        linkedMapConfigType: areaConfig.linkedMapConfigType,
        linkedMapConfigName: Phaser.Math.RND.pick(areaConfig.availableLinkedMapConfigName ?? []),
        linkedMapConfigCategory: Phaser.Math.RND.pick(areaConfig.availableLinkedMapConfigCategory ?? []),
        requiredTokens: areaConfig.requiredTokens,
        isAccessible: false,
    };

    if (areaConfig.placement === 'wall') {
        const direction = Phaser.Math.RND.pick(Object.keys(CARDINAL_DIRECTION));
        switch (direction) {
            case CARDINAL_DIRECTION.UP:
                newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
                break;
            case CARDINAL_DIRECTION.RIGHT:
                newArea.focusX = maxXCoord;
                newArea.focusY = Phaser.Math.RND.integerInRange(1, maxYCoord - 1);
                break;
            case CARDINAL_DIRECTION.DOWN:
                newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
                newArea.focusY = maxYCoord;
                break;
            case CARDINAL_DIRECTION.LEFT:
                newArea.focusY = Phaser.Math.RND.integerInRange(1, maxYCoord - 1);
                break;
        }
    } else {
        newArea.focusX = Phaser.Math.RND.integerInRange(1, maxXCoord - 1);
        newArea.focusY = Phaser.Math.RND.integerInRange(1, maxYCoord - 1);
    }

    return newArea;
}

/**
 * Shared dust-placement logic used by the temple & cave generators.
 * (settlement keeps its own variant, so it's **not** moved here.)
 */
export function generateDust(
    tileIndexData: number[][],
    siteConfig: SiteConfig,
    excludedCoords: Phaser.Math.Vector2[] = []
): DustModel[] {
    const newDustArray: DustModel[] = [];

    for (let y = 0; y < tileIndexData.length; y++) {
        for (let x = 0; x < tileIndexData[y].length; x++) {
            const isDustableTile =
                siteConfig.floorTileWeights.some(fTW => fTW.index == tileIndexData[y][x]) &&
                !excludedCoords.some(coord => coord.x === x && coord.y === y);

            if (!isDustableTile) continue;

            const doAddDust =
                Phaser.Math.RND.integerInRange(1, 100) <= siteConfig.dustWeight;
            if (!doAddDust) continue;

            const dustFrame = Phaser.Math.RND.pick(siteConfig.availableDustFrames);
            const newDustX = (x + 0.5) * siteConfig.tileWidth * GAME_SCALE;
            const newDustY = (y + 0.5) * siteConfig.tileHeight * GAME_SCALE;

            const newDust = new DustModel(
                newDustX,
                newDustY,
                STATIC_TEXTURE_KEY,
                dustFrame,
                y * tileIndexData[y].length + x
            );

            newDustArray.push(newDust);
        }
    }

    return newDustArray;
}
