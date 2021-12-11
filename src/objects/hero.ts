import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, HERO_ANIM_FRAME_RATES, HERO_FRAMES, HERO_TINT, HERO_OFFSETS } from '../constants';
import { HeroMovementController } from '../interfaces/heroMovementController';
import { FOLLOW_HERO_MOVEMENT_CONTROLLER } from './followHeroMovmentController';

export default class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;
    public touchStartX: number = null;
    public touchStartY: number = null;
    public moveThreshold = 30;
    public isPunching = false;
    public isFrozen = false;
    public lastAnimationFrame = -1;
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
        private mvtCtrl: HeroMovementController = FOLLOW_HERO_MOVEMENT_CONTROLLER,
    ) {
        this.addToScene();
        this.addAnimations();
        this.mvtCtrl.init(this);
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
        this.heroSprite.setVelocity(0);
        // if (this.isFrozen) {
        //     this.unfreeze();
        // }
        let newDirection: CARDINAL_DIRECTION = null;
        const pointer = this.scene.input.activePointer;

        if (cursors.left.isDown || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.LEFT)) {
            this.heroSprite.setVelocityX(-this.velocity);
            newDirection = CARDINAL_DIRECTION.LEFT;
        } else if (cursors.right.isDown || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.RIGHT)) {
            this.heroSprite.setVelocityX(this.velocity);
            newDirection = CARDINAL_DIRECTION.RIGHT;
        }

        if (cursors.up.isDown || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.UP)) {
            this.heroSprite.setVelocityY(-this.velocity);
            newDirection = CARDINAL_DIRECTION.UP;
        } else if (cursors.down.isDown || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.DOWN)) {
            this.heroSprite.setVelocityY(this.velocity);
            newDirection = CARDINAL_DIRECTION.DOWN;
        }

        if (newDirection != null) {
            this.currentDirection = newDirection;
            const animDirection = newDirection == CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT
                : newDirection;
            this.heroSprite.anims.play((this.isPunching ? 'punch' : 'walk') + animDirection, true);
        }

        this.mvtCtrl.update(this);
    }

    addToScene(): void {
        this.heroSprite = this.scene.physics.add
            .sprite(this.x, this.y, 'hero')
            .setSize(8, 8)
            .setOffset(HERO_OFFSETS.standing.x, HERO_OFFSETS.standing.y)
            .setScale(GAME_SCALE)
            .setFrame(HERO_FRAMES.standing[CARDINAL_DIRECTION.DOWN])
            .setDepth(1)
            .setTint(HERO_TINT)
            .on('animationupdate', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, heroSprite: Phaser.GameObjects.Sprite) => {
                // add punching sound effects
                if (this.isPunching && animation.key.toLocaleLowerCase().includes('punch')) {
                    if (frame.index % 5 == 1) {
                        this.scene.sound.play('punch1');
                    }
                    if (frame.index % 5 == 0) {
                        this.scene.sound.play('punch2');
                    }
                }
            })
            ;
        // jump-start flipX
        this.currentDirection = this.currentDirection;
    }

    addAnimations(): void {
        ['walk', 'punch'].forEach(state => {

            [
                CARDINAL_DIRECTION.UP,
                CARDINAL_DIRECTION.RIGHT,
                CARDINAL_DIRECTION.DOWN,
            ].forEach(direction => {
                this.scene.anims.create({
                    key: state + direction,
                    frames: this.scene.anims.generateFrameNumbers('hero', { 
                        start: HERO_FRAMES[state + 'AnimStart'][direction],
                        end: HERO_FRAMES[state + 'AnimEnd'][direction],
                    }),
                    frameRate: HERO_ANIM_FRAME_RATES[state],
                    repeat: -1,
                    yoyo: true,
                });
            });
        })
    }

    freeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = false;
        this.heroSprite.anims.pause();
        this.isFrozen = true;
    }
    unfreeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = true;
        this.heroSprite.anims.resume();
        this.isFrozen = false;
    }
}