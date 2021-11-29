import { HeroMovementController } from "../interfaces/heroMovementController";
import { CARDINAL_DIRECTION } from "../utils";
import Hero from "./hero";

export const FOLLOW_HERO_MOVEMENT_CONTROLLER: HeroMovementController = {
    init: (_hero: Hero) => {},
    update: (_hero: Hero) => {},
    testDirection: (hero: Hero, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION) => {
        switch(direction) {
            case CARDINAL_DIRECTION.LEFT:
                return pointer.isDown && pointer.worldX < hero.entity.x - hero.entity.width / 2
                break;
            case CARDINAL_DIRECTION.RIGHT:
                return pointer.isDown && pointer.worldX > hero.entity.x + hero.entity.width / 2
                break;
            case CARDINAL_DIRECTION.UP:
                return pointer.isDown && pointer.worldY < hero.entity.y - hero.entity.height / 2
                break;
            case CARDINAL_DIRECTION.DOWN:
                return pointer.isDown && pointer.worldY > hero.entity.y + hero.entity.height / 2
                break;
            default: 
                return false;
        }
    }
}