import Hero from "../objects/hero";
import { CARDINAL_DIRECTION } from "../utils";

export interface HeroMovementController {
    init(hero: Hero): void;
    update(hero: Hero): void;
    testDirection(hero: Hero, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION): boolean
}