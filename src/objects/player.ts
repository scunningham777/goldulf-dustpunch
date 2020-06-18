import { Cardinal_Direction as CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE } from '../constants';

const ANIM_FRAME_RATE = 6;
const DIRECTION_FRAMES: Map<CARDINAL_DIRECTION, number> = new Map();
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.UP, 1);
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.RIGHT, 4);
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.DOWN, 7);
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.LEFT, 10);

export default class Player {

    private player: Phaser.Physics.Arcade.Sprite;

    constructor(
        private x: number,
        private y: number,
        private scene: Phaser.Scene,
        private velocity: number,
        private currentDirection = CARDINAL_DIRECTION.DOWN,
    ) {
        this.addToScene();
        this.addAnimations();
    }

    get entity() {
        return this.player;
    }

    update(cursors): void {
        this.player.setVelocity(0);
        let newDirection: CARDINAL_DIRECTION = null;

        if (cursors.left.isDown) {
            this.player.setVelocityX(-this.velocity);
            newDirection = CARDINAL_DIRECTION.LEFT;
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(this.velocity);
            newDirection = CARDINAL_DIRECTION.RIGHT;
        }
        
        if (cursors.up.isDown) {
            this.player.setVelocityY(-this.velocity);
            newDirection = CARDINAL_DIRECTION.UP;
        } else if (cursors.down.isDown) {
            this.player.setVelocityY(this.velocity);
            newDirection = CARDINAL_DIRECTION.DOWN;
        }

        if (newDirection != null) {
            this.currentDirection = newDirection;
            this.player.anims.play(newDirection, true);
        } else {
            this.player.anims.stop();
            this.player.setFrame(DIRECTION_FRAMES.get(this.currentDirection));
        }
    }

    addToScene(): void {
        this.player = this.scene.physics.add.sprite(this.x, this.y, 'dude');
        this.player.setScale(GAME_SCALE);
        this.player.setFrame(7);
    }

    addAnimations(): void {
        this.scene.anims.create({
            key: CARDINAL_DIRECTION.UP,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 0, end: 2 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
        this.scene.anims.create({
            key: CARDINAL_DIRECTION.RIGHT,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 3, end: 5 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
        this.scene.anims.create({
            key: CARDINAL_DIRECTION.DOWN,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 6, end: 8 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
        this.scene.anims.create({
            key: CARDINAL_DIRECTION.LEFT,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 9, end: 11 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
    }


}