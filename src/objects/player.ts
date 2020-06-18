import { Cardinal_Direction } from '../utils';
import { GAME_SCALE } from '../constants';

const ANIM_FRAME_RATE = 6;

export default class Player {

    private player: Phaser.Physics.Arcade.Sprite;

    constructor(
        private x: number,
        private y: number,
        private scene: Phaser.Scene,
        private velocity: number,
        private currentDirection = Cardinal_Direction.DOWN,
    ) {
        this.addToScene();
        this.addAnimations();
    }

    get entity() {
        return this.player;
    }

    update(cursors): void {
        this.player.setVelocity(0);
        let isMoving = false;

        if (cursors.left.isDown) {
            this.player.setVelocityX(-this.velocity);
            this.currentDirection = Cardinal_Direction.LEFT;
            this.player.anims.play(Cardinal_Direction.LEFT, true);
            isMoving = true;
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(this.velocity);
            this.currentDirection = Cardinal_Direction.RIGHT;
            this.player.anims.play(Cardinal_Direction.RIGHT, true);
            isMoving = true;
        }
        
        if (cursors.up.isDown) {
            this.player.setVelocityY(-this.velocity);
            this.currentDirection = Cardinal_Direction.UP;
            this.player.anims.play(Cardinal_Direction.UP, true);
            isMoving = true;
        } else if (cursors.down.isDown) {
            this.player.setVelocityY(this.velocity);
            this.currentDirection = Cardinal_Direction.DOWN;
            this.player.anims.play(Cardinal_Direction.DOWN, true);
            isMoving = true;
        }

        if (!isMoving) {
            this.player.anims.stop();
        }
    }

    addToScene(): void {
        this.player = this.scene.physics.add.sprite(this.x, this.y, 'dude');
        this.player.setScale(GAME_SCALE);
        this.player.setFrame(7);
    }

    addAnimations(): void {
        this.scene.anims.create({
            key: Cardinal_Direction.UP,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 0, end: 2 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
        this.scene.anims.create({
            key: Cardinal_Direction.RIGHT,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 3, end: 5 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
        this.scene.anims.create({
            key: Cardinal_Direction.DOWN,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 6, end: 8 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
        this.scene.anims.create({
            key: Cardinal_Direction.LEFT,
            frames: this.scene.anims.generateFrameNumbers('dude', { start: 9, end: 11 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
    }


}