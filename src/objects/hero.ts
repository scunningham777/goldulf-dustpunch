import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, POINTS_REGISTRY_KEY } from '../constants';

const ANIM_FRAME_RATE = 6;
const DIRECTION_FRAMES: Map<CARDINAL_DIRECTION, number> = new Map();
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.UP, 1);
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.RIGHT, 4);
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.DOWN, 1);
DIRECTION_FRAMES.set(CARDINAL_DIRECTION.LEFT, 4);

export default class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;
    private touchStartX: number = null;
    private touchStartY: number = null;
	private moveThreshold = 30;

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
            this.heroSprite.flipX = true;
            newDirection = CARDINAL_DIRECTION.DOWN;
        }

        if (newDirection != null) {
            this.currentDirection = newDirection;
            const animDirection = newDirection == CARDINAL_DIRECTION.DOWN ? CARDINAL_DIRECTION.UP 
                                : newDirection == CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT
                                : newDirection;
            this.heroSprite.anims.play(animDirection, true);
        } else {
            this.heroSprite.anims.stop();
            this.heroSprite.setFrame(DIRECTION_FRAMES.get(this.currentDirection));
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
            this.scene.registry.set(POINTS_REGISTRY_KEY,  this.scene.registry.get(POINTS_REGISTRY_KEY) + 10);
        }
    }

    addToScene(): void {
        this.heroSprite = this.scene.physics.add
            .sprite(this.x, this.y, 'hero')
            .setSize(8, 8)
            .setOffset(4, 8)
            .setScale(GAME_SCALE)
            .setFrame(1)
            .setFlipX(true)
            .setDepth(1)
            ;
    }

    addAnimations(): void {
        this.scene.anims.create({
            key: CARDINAL_DIRECTION.UP,
            frames: this.scene.anims.generateFrameNumbers('hero', { start: 0, end: 2 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
        this.scene.anims.create({
            key: CARDINAL_DIRECTION.RIGHT,
            frames: this.scene.anims.generateFrameNumbers('hero', { start: 3, end: 5 }),
            frameRate: ANIM_FRAME_RATE,
            repeat: -1,
            yoyo: true,
        });
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