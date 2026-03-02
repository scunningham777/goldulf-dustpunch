import { FOLLOW_HERO_MOVEMENT_CONTROLLER } from "../objects/followHeroMovmentController";
import { Hero } from "../objects/hero";
import { JOYSTICK_HERO_MOVEMENT_CONTROLLER } from "../objects/joystickHeroMovementController";
import { CARDINAL_DIRECTION } from "../utils";

export interface HeroMovementController {
    init(hero: Hero): void;
    update(hero: Hero): void;
    testDirection(hero: Hero, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION): boolean
}

export enum HERO_MOVEMENT_CONTROLLERS {
    FOLLOW_HERO = 'followHero',
    JOYSTICK = 'joystick',
}

export const HERO_MOVEMENT_CONTROLLER_MAP: Map<HERO_MOVEMENT_CONTROLLERS, HeroMovementController> = new Map([
    [HERO_MOVEMENT_CONTROLLERS.FOLLOW_HERO, FOLLOW_HERO_MOVEMENT_CONTROLLER],
    [HERO_MOVEMENT_CONTROLLERS.JOYSTICK, JOYSTICK_HERO_MOVEMENT_CONTROLLER]
])