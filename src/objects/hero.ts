import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, POINTS_REGISTRY_KEY } from '../constants';

const ANIM_FRAME_RATE = 6;

const frames = {
    standing: {
        'UP': 1,
        'RIGHT': 5,
        'DOWN': 9,
        'LEFT': 5,
    },
    animStart: {
        'UP': 0,
        'RIGHT': 4,
        'DOWN': 8,
        'LEFT': 4,
    },
    animEnd: {
        'UP': 2,
        'RIGHT': 6,
        'DOWN': 10,
        'LEFT': 6,
    },
    punch: {
        'UP': 3,
        'RIGHT': 7,
        'DOWN': 11,
        'LEFT': 7,
    }
}
// const DIRECTION_FRAMES: Map<CARDINAL_DIRECTION, number> = new Map();
// DIRECTION_FRAMES.set(CARDINAL_DIRECTION.UP, 1);
// DIRECTION_FRAMES.set(CARDINAL_DIRECTION.RIGHT, 4);
// DIRECTION_FRAMES.set(CARDINAL_DIRECTION.DOWN, 1);
// DIRECTION_FRAMES.set(CARDINAL_DIRECTION.LEFT, 4);

export default class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;
    private touchStartX: number = null;
    private touchStartY: number = null;
    private moveThreshold = 30;
    private isPunching = false;

    constructor(
        private x: number,
        private y: number,
        private scene: Phaser.Scene,
        private velocity: number,
        private currentDirection = CARDINAL_DIRECTION.DOWN,
    ) {
        this.addToScene();
        this.addAnimations();
        this.setUpInput();
    }

    get entity() {
        return this.heroSprite;
    }

    update(cursors): void {
        this.heroSprite.setVelocity(0);
        let newDirection: CARDINAL_DIRECTION = null;
        const activePointer = this.scene.input.activePointer;

        if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
            this.isPunching = true;
            this.scene.time.delayedCall(150, () => {
                this.isPunching = false;
                this.scene.registry.set(POINTS_REGISTRY_KEY, this.scene.registry.get(POINTS_REGISTRY_KEY) + 10);
            }, [], this);
        }

        if (!this.isPunching) {
            if (cursors.left.isDown || this.touchStartX != null && activePointer.x < this.touchStartX - this.moveThreshold) {
                this.heroSprite.setVelocityX(-this.velocity);
                this.heroSprite.flipX = true;
                newDirection = CARDINAL_DIRECTION.LEFT;
            } else if (cursors.right.isDown || this.touchStartX != null && activePointer.x > this.touchStartX + this.moveThreshold) {
                this.heroSprite.setVelocityX(this.velocity);
                this.heroSprite.flipX = false;
                newDirection = CARDINAL_DIRECTION.RIGHT;
            }

            if (cursors.up.isDown || this.touchStartY != null && activePointer.y < this.touchStartY - this.moveThreshold) {
                this.heroSprite.setVelocityY(-this.velocity);
                this.heroSprite.flipX = false;
                newDirection = CARDINAL_DIRECTION.UP;
            } else if (cursors.down.isDown || this.touchStartY != null && activePointer.y > this.touchStartY + this.moveThreshold) {
                this.heroSprite.setVelocityY(this.velocity);
                this.heroSprite.flipX = false;
                newDirection = CARDINAL_DIRECTION.DOWN;
            }
        }

        if (newDirection != null) {
            this.currentDirection = newDirection;
            const animDirection = newDirection == CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT
                : newDirection;
            this.heroSprite.anims.play(animDirection, true);
        } else {
            this.heroSprite.anims.stop();
            this.heroSprite.setFrame(this.isPunching ? frames.punch[this.currentDirection]
                : frames.standing[this.currentDirection]);
        }
    }

    addToScene(): void {
        this.heroSprite = this.scene.physics.add
            .sprite(this.x, this.y, 'hero')
            .setSize(8, 8)
            .setOffset(4, 8)
            .setScale(GAME_SCALE)
            .setFrame(frames.standing[CARDINAL_DIRECTION.DOWN])
            .setDepth(1)
            ;
    }

    addAnimations(): void {
        [
            CARDINAL_DIRECTION.UP,
            CARDINAL_DIRECTION.RIGHT,
            CARDINAL_DIRECTION.DOWN,
        ].forEach(direction => {
            this.scene.anims.create({
                key: direction,
                frames: this.scene.anims.generateFrameNumbers('hero', { start: frames.animStart[direction], end: frames.animEnd[direction] }),
                frameRate: ANIM_FRAME_RATE,
                repeat: -1,
                yoyo: true,
            });
        })
    }

    setUpInput() {
        this.scene.input.on('pointerdown', pointer => {
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
        });
        this.scene.input.on('pointerup', () => {
            this.touchStartX = null;
            this.touchStartY = null;
        });
    }

    freeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = false;
    }
}