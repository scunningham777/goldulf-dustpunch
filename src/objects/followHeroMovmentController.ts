import { EntityMovementController } from "../interfaces/heroMovementController";
import { TouchEnabledWithEntity } from "../interfaces/touchEnabledWithEntity";
import { CARDINAL_DIRECTION } from "../utils";

export const FOLLOW_HERO_MOVEMENT_CONTROLLER: EntityMovementController = {
    init: (_target: TouchEnabledWithEntity) => {},
    update: (_target: TouchEnabledWithEntity) => {},
    testDirection: (target: TouchEnabledWithEntity, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION) => {
        switch(direction) {
            case CARDINAL_DIRECTION.LEFT:
                return pointer.isDown && pointer.worldX < target.entity.x - target.entity.width / 2
                break;
            case CARDINAL_DIRECTION.RIGHT:
                return pointer.isDown && pointer.worldX > target.entity.x + target.entity.width / 2
                break;
            case CARDINAL_DIRECTION.UP:
                return pointer.isDown && pointer.worldY < target.entity.y - target.entity.height / 2
                break;
            case CARDINAL_DIRECTION.DOWN:
                return pointer.isDown && pointer.worldY > target.entity.y + target.entity.height / 2
                break;
            default: 
                return false;
        }
    }
}