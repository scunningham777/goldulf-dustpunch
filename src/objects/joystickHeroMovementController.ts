import { TOUCH_MOVEMENT_REGISTRY_KEY } from "../constants";
import { HeroMovementController } from "../interfaces/heroMovementController";
import { CARDINAL_DIRECTION } from "../utils";
import { Hero } from "./hero";

export const JOYSTICK_HERO_MOVEMENT_CONTROLLER: HeroMovementController = {
    init: (hero: Hero) => {
        hero.entity.scene.input.on('pointerdown', pointer => {
            hero.touchStartX = pointer.x;
            hero.touchStartY = pointer.y;
        });
        hero.entity.scene.input.on('pointerup', () => {
            hero.touchStartX = null;
            hero.touchStartY = null;
            hero.entity.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, null);
        });
    },
    update: (hero: Hero) => {
        // event for touch "virtual joystick"
        if ((hero.entity.body.velocity.x != 0 || hero.entity.body.velocity.y != 0) && hero.touchStartX != null) {
            hero.entity.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, {startX: hero.touchStartX, startY: hero.touchStartY});
        }
    },
    testDirection: (hero: Hero, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION) => {
        switch(direction) {
            case CARDINAL_DIRECTION.LEFT:
                return hero.touchStartX != null && pointer.x < hero.touchStartX - hero.moveThreshold;
                break;
            case CARDINAL_DIRECTION.RIGHT:
                return hero.touchStartX != null && pointer.x > hero.touchStartX + hero.moveThreshold;
                break;
            case CARDINAL_DIRECTION.UP:
                return hero.touchStartY != null && pointer.y < hero.touchStartY - hero.moveThreshold;
                break;
            case CARDINAL_DIRECTION.DOWN:
                return hero.touchStartY != null && pointer.y > hero.touchStartY + hero.moveThreshold;
                break;
            default: 
                return false;
        }
    }
}