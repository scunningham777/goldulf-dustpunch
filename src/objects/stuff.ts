import { GAME_SCALE } from "../constants";

export default class Stuff {
    private stuffSprite: Phaser.Physics.Arcade.Image;

    constructor(
        private x: number,
        private y: number,
        private scene: Phaser.Scene,
        private key: string,
        private frame: number,
        public points:number
    ) {
        this.addToScene();
    }

    addToScene() {
        this.stuffSprite = this.scene.physics.add
            .image(this.x, this.y, this.key, this.frame)
            .setScale(GAME_SCALE)
            ;
    }
}