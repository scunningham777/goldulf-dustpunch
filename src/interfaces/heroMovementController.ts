import Hero from "../objects/hero";
import { CARDINAL_DIRECTION } from "../utils";
import { TouchEnabledWithEntity } from "./touchEnabledWithEntity";

export interface EntityMovementController {
    init(target: TouchEnabledWithEntity): void;
    update(target: TouchEnabledWithEntity): void;
    testDirection(target: TouchEnabledWithEntity, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION): boolean
}