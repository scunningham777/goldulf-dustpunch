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

export function calculateGamepad(gamepad: Phaser.Input.Gamepad.Gamepad): {up: boolean, down: boolean, left: boolean, right: boolean} {
    const directions = {
        up: false,
        down: false,
        left: false,
        right: false,
    }
    
    if (!!gamepad) {
        const axisH = gamepad.axes[0].getValue();
        const axisV = gamepad.axes[1].getValue();
        if (gamepad.up || axisV < 0) {
            directions.up = true;
        }
        if (gamepad.down || axisV > 0) {
            directions.down = true;
        }
        if (gamepad.left || axisH < 0) {
            directions.left = true;
        }
        if (gamepad.right || axisH > 0) {
            directions.right = true;
        }
    }

    return directions;
}