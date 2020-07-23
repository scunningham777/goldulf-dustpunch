import { GAME_SCALE, EXIT_COLLISION_EVENT_KEY } from "../constants";

export default class Exit extends Phaser.Physics.Arcade.Image {
    constructor(
        scene: Phaser.Scene,
        x: number, y: number,
        key: string, frame: number,
        public id: string,
        private linkedMapConfigName?: string,
        private linkedMapConfigCategory?: string,
    ) {
        super(scene, x, y, key, frame);

        // enable physics
        this.scene.physics.world.enable(this);
        // TODO #8: shrink the hit box to require more overlap
        this.setSize(4, 4);
        // scale the exit
        this.setScale(GAME_SCALE);
        // add the exit to our existing scene
        this.scene.add.existing(this);
    }

    exitCollision() {
        this.scene.registry.events.emit(EXIT_COLLISION_EVENT_KEY, {linkedMapConfigName: this.linkedMapConfigName, linkedMapConfigCategory: this.linkedMapConfigCategory});
    }
}