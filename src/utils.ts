export enum Cardinal_Direction {
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
