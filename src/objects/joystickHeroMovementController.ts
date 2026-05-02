import { TOUCH_MOVEMENT_REGISTRY_KEY } from "../constants";
import { HeroMovementController } from "../interfaces/heroMovementController";
import { CARDINAL_DIRECTION } from "../utils";
import { Hero } from "./hero";

export const JOYSTICK_HERO_MOVEMENT_CONTROLLER: HeroMovementController = {
    init: (hero: Hero) => {
        hero.entity.scene.input.on('pointerdown', pointer => {
            hero.setTouchStartX(pointer.x);
            hero.setTouchStartY(pointer.y);
        });
        hero.entity.scene.input.on('pointerup', () => {
            hero.setTouchStartX(null);
            hero.setTouchStartY(null);
            hero.entity.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, null);
        });
    },
    update: (hero: Hero) => {
        // event for touch "virtual joystick"
        if ((hero.entity.body.velocity.x != 0 || hero.entity.body.velocity.y != 0) && hero.getTouchStartX() != null) {
            hero.entity.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, {startX: hero.getTouchStartX(), startY: hero.getTouchStartY()});
        }
    },
    testDirection: (hero: Hero, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION) => {
        switch(direction) {
            case CARDINAL_DIRECTION.LEFT:
                return hero.getTouchStartX() != null && pointer.x < hero.getTouchStartX() - hero.getMoveThreshold();
                break;
            case CARDINAL_DIRECTION.RIGHT:
                return hero.getTouchStartX() != null && pointer.x > hero.getTouchStartX() + hero.getMoveThreshold();
                break;
            case CARDINAL_DIRECTION.UP:
                return hero.getTouchStartY() != null && pointer.y < hero.getTouchStartY() - hero.getMoveThreshold();
                break;
            case CARDINAL_DIRECTION.DOWN:
                return hero.getTouchStartY() != null && pointer.y > hero.getTouchStartY() + hero.getMoveThreshold();
                break;
            default: 
                return false;
        }
    }
}