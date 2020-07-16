import { GAME_SCALE, POINTS_REGISTRY_KEY } from "../constants";

export default class Stuff extends Phaser.Physics.Arcade.Image {
    private hasBeenScored = false;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, frame: number, private points: number, public id: string) {
        super(scene, x, y, key, frame);

        // enable physics
        this.scene.physics.world.enable(this);
        // scale the stuff
        this.setScale(GAME_SCALE);
        // add the monster to our existing scene
        this.scene.add.existing(this);
    }

    scorePoints() {
        if (this.hasBeenScored === false) {
            this.scene.registry.set(POINTS_REGISTRY_KEY, this.scene.registry.get(POINTS_REGISTRY_KEY) + this.points);
        }
        this.hasBeenScored = true;
    }
}