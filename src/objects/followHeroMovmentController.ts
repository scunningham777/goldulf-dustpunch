import { HeroMovementController } from "../interfaces/heroMovementController";
import { CARDINAL_DIRECTION } from "../utils";
import { Hero } from "./hero";

export const FOLLOW_HERO_MOVEMENT_CONTROLLER: HeroMovementController = {
    init: (_hero: Hero) => {},
    update: (_hero: Hero) => {},

    // The built‑in `pointer.worldX/worldY` values are only refreshed when the
    // pointer actually moves, which means they stay frozen if the camera scrolls
    // while the user keeps holding the screen.  That manifests as "it works
    // near the origin but breaks as you move toward the bottom/right" because
    // the hero (and camera) drift away while the pointer coordinates sit
    // stagnantly at the press point.  To make the test reliable we convert the
    // current **screen** position into world space each frame using the active
    // camera.  We also use the sprite's *display* size so the hit‑zones respect
    // the `GAME_SCALE` applied in `Hero.addToScene`.
    testDirection: (hero: Hero, pointer: Phaser.Input.Pointer, direction: CARDINAL_DIRECTION) => {
        if (!pointer.isDown) {
            return false;
        }

        const cam = hero.entity.scene.cameras.main;
        const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
        const halfW = hero.entity.displayWidth / 2;
        const halfH = hero.entity.displayHeight / 2;

        switch (direction) {
            case CARDINAL_DIRECTION.LEFT:
                return worldPoint.x < hero.entity.x - halfW;
            case CARDINAL_DIRECTION.RIGHT:
                return worldPoint.x > hero.entity.x + halfW;
            case CARDINAL_DIRECTION.UP:
                return worldPoint.y < hero.entity.y - halfH;
            case CARDINAL_DIRECTION.DOWN:
                return worldPoint.y > hero.entity.y + halfH;
            default:
                return false;
        }
    }
}