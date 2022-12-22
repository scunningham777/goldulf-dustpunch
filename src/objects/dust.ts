import { GAME_SCALE, DUST_PUNCH_EVENT_KEY } from "../constants";

export class Dust extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, frame: number, public id: string) {
        super(scene, x, y, key, frame);

        // enable physics
        this.scene.physics.world.enable(this);
        // scale the dust
        this.setScale(GAME_SCALE);
        // add the dust to our existing scene
        this.scene.add.existing(this);
    }

    clearDust() {
        this.scene.registry.events.emit(DUST_PUNCH_EVENT_KEY, this.x, this.y);
        this.destroy();
    }
}