import { TOUCH_MOVEMENT_REGISTRY_KEY } from "../constants";
import { EntityMovementController } from "../interfaces/heroMovementController";
import { TouchEnabledWithEntity } from "../interfaces/touchEnabledWithEntity";
import { CARDINAL_DIRECTION } from "../utils";

export const JOYSTICK_HERO_MOVEMENT_CONTROLLER: EntityMovementController = {
    init: (target: TouchEnabledWithEntity) => {
        target.entity.scene.input.on('pointerdown', pointer => {
            target.touchStartX = pointer.x;
            target.touchStartY = pointer.y;
        });
        target.entity.scene.input.on('pointerup', () => {
            target.touchStartX = null;
            target.touchStartY = null;
            target.entity.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, null);
        });
    },
    update: (target: TouchEnabledWithEntity) => {
        // event for touch "virtual joystick"
        if (target.touchStartX != null) {
            target.entity.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, {startX: target.touchStartX, startY: target.touchStartY});
        }
    },
    testDirection: (target: TouchEnabledWithEntity, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION) => {
        switch(direction) {
            case CARDINAL_DIRECTION.LEFT:
                return target.touchStartX != null && pointer.x < target.touchStartX - target.touchMoveThreshold;
                break;
            case CARDINAL_DIRECTION.RIGHT:
                return target.touchStartX != null && pointer.x > target.touchStartX + target.touchMoveThreshold;
                break;
            case CARDINAL_DIRECTION.UP:
                return target.touchStartY != null && pointer.y < target.touchStartY - target.touchMoveThreshold;
                break;
            case CARDINAL_DIRECTION.DOWN:
                return target.touchStartY != null && pointer.y > target.touchStartY + target.touchMoveThreshold;
                break;
            default: 
                return false;
        }
    }
}