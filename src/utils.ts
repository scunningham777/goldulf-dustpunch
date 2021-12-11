export enum CARDINAL_DIRECTION {
    RIGHT = 'RIGHT',
    LEFT = 'LEFT',
    UP = 'UP',
    DOWN = 'DOWN',
};

/** Will return the original coord if not on a wall */
export function justInsideWall(location: Phaser.Math.Vector2, maxXCoord: number, maxYCoord: number): Phaser.Math.Vector2 {
    const newLocation = location.clone();

    if (location.x === 0) {
        newLocation.x += 1;
    } else if (location.x === maxXCoord) {
        newLocation.x -= 1;
    }
    if (location.y === 0) {
        newLocation.y += 1;
    } else if (location.y === maxYCoord) {
        newLocation.y -= 1;
    }

    return newLocation;
}

/**
 * picks an item from the array based on total weight
 * weight can be fractional, but should be positive
 **/  
export function weightedRandomizeAnything<T>(weightedIndexes: {key: T, weight: number}[]): T {
    const weightTotal = weightedIndexes.reduce((prev, wI) => prev + wI.weight, 0);

    let rand = Math.random() * weightTotal;
    let sum = 0;

    for (let weightedIndex of weightedIndexes)
    {
        sum += weightedIndex.weight;

        if (rand <= sum)
        {
            return weightedIndex.key;
        }
    }
}