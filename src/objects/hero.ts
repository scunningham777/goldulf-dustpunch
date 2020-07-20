import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, HERO_ANIM_FRAME_RATE, HERO_FRAMES, HERO_TINT, HERO_OFFSETS } from '../constants';

export default class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;
    private touchStartX: number = null;
    private touchStartY: number = null;
    private moveThreshold = 30;
    private doubleTouch = false;
    public isPunching = false;
    private set currentDirection(newDir: CARDINAL_DIRECTION) {
        this._currentDirection = newDir;
        if (this.heroSprite != null) {
            this.heroSprite.flipX = newDir === CARDINAL_DIRECTION.LEFT ? true : false;
        }
    }
    private get currentDirection(): CARDINAL_DIRECTION {
        return this._currentDirection;
    }
    public get entity() {
        return this.heroSprite;
    }

    constructor(
        private x: number,
        private y: number,
        private scene: Phaser.Scene,
        private velocity: number,
        private _currentDirection = CARDINAL_DIRECTION.DOWN,
    ) {
        this.addToScene();
        this.addAnimations();
        this.setUpInput();
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
        this.heroSprite.setVelocity(0);
        let newDirection: CARDINAL_DIRECTION = null;
        const activePointer = this.scene.input.activePointer;

        if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
            this.punch();
        }

        if (!this.isPunching) {
            if (cursors.left.isDown || this.touchStartX != null && activePointer.x < this.touchStartX - this.moveThreshold) {
                this.heroSprite.setVelocityX(-this.velocity);
                newDirection = CARDINAL_DIRECTION.LEFT;
            } else if (cursors.right.isDown || this.touchStartX != null && activePointer.x > this.touchStartX + this.moveThreshold) {
                this.heroSprite.setVelocityX(this.velocity);
                newDirection = CARDINAL_DIRECTION.RIGHT;
            }

            if (cursors.up.isDown || this.touchStartY != null && activePointer.y < this.touchStartY - this.moveThreshold) {
                this.heroSprite.setVelocityY(-this.velocity);
                newDirection = CARDINAL_DIRECTION.UP;
            } else if (cursors.down.isDown || this.touchStartY != null && activePointer.y > this.touchStartY + this.moveThreshold) {
                this.heroSprite.setVelocityY(this.velocity);
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
            this.heroSprite.setFrame(this.isPunching ? HERO_FRAMES.punch[this.currentDirection]
                : HERO_FRAMES.standing[this.currentDirection]);
        }
    }

    addToScene(): void {
        this.heroSprite = this.scene.physics.add
            .sprite(this.x, this.y, 'hero')
            .setSize(8, 8)
            .setOffset(HERO_OFFSETS.standing.x, HERO_OFFSETS.standing.y)
            .setScale(GAME_SCALE)
            .setFrame(HERO_FRAMES.standing[CARDINAL_DIRECTION.DOWN])
            .setDepth(1)
            ;
        this.heroSprite.tint = HERO_TINT;
        // jump-start flipX
        this.currentDirection = this.currentDirection;
    }

    addAnimations(): void {
        [
            CARDINAL_DIRECTION.UP,
            CARDINAL_DIRECTION.RIGHT,
            CARDINAL_DIRECTION.DOWN,
        ].forEach(direction => {
            this.scene.anims.create({
                key: direction,
                frames: this.scene.anims.generateFrameNumbers('hero', { start: HERO_FRAMES.animStart[direction], end: HERO_FRAMES.animEnd[direction] }),
                frameRate: HERO_ANIM_FRAME_RATE,
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
        this.scene.input.on('pointerdown', pointer => {
            this.touchStartX = pointer.x;

            if (this.doubleTouch) {
                this.punch();
                this.doubleTouch = false;
            } else {
                this.doubleTouch = true;
                setTimeout(() => {
                    this.doubleTouch = false;
                }, 500);
            }
        });
    }

    freeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = false;
    }

    punch() {
        this.isPunching = true;
        this.heroSprite.setOffset(HERO_OFFSETS.punching[this.currentDirection].x, HERO_OFFSETS.punching[this.currentDirection].y);
        this.scene.time.delayedCall(250, () => {
            this.isPunching = false;
            this.heroSprite.setOffset(HERO_OFFSETS.standing.x, HERO_OFFSETS.standing.y);
        }, [], this);
    }
}