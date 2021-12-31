import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, HERO_ANIM_FRAME_RATES, HERO_FRAMES, HERO_TINT, HERO_OFFSETS, HERO_TEXTURE_KEY } from '../constants';
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
    private _currentDirection = CARDINAL_DIRECTION.DOWN;
    public set currentDirection(newDir: CARDINAL_DIRECTION) {
        this._currentDirection = newDir;
        if (this.heroSprite != null) {
            this.heroSprite.flipX = newDir === CARDINAL_DIRECTION.LEFT ? true : false;
        }
    }
    public get currentDirection(): CARDINAL_DIRECTION {
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
        startingDirection: CARDINAL_DIRECTION,
        private mvtCtrl: HeroMovementController = FOLLOW_HERO_MOVEMENT_CONTROLLER,
    ) {
        this.addToScene(startingDirection);
        this.addAnimations();
        this.mvtCtrl.init(this);
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, gamepad?: Phaser.Input.Gamepad.Gamepad): void {
        if (this.isFrozen) {
            return;
        }

        this.heroSprite.setVelocity(0);

        let newDirection: CARDINAL_DIRECTION = null;
        const pointer = this.scene.input.activePointer;
        const gamepadDirections = this.calculateGamepad(gamepad);

        if (cursors.left.isDown || gamepadDirections.left || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.LEFT)) {
            this.heroSprite.setVelocityX(-this.velocity);
            newDirection = CARDINAL_DIRECTION.LEFT;
        } else if (cursors.right.isDown || gamepadDirections.right || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.RIGHT)) {
            this.heroSprite.setVelocityX(this.velocity);
            newDirection = CARDINAL_DIRECTION.RIGHT;
        }

        if (cursors.up.isDown || gamepadDirections.up || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.UP)) {
            this.heroSprite.setVelocityY(-this.velocity);
            newDirection = CARDINAL_DIRECTION.UP;
        } else if (cursors.down.isDown || gamepadDirections.down || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.DOWN)) {
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

    addToScene(startingDirection: CARDINAL_DIRECTION): void {
        this.heroSprite = this.scene.physics.add
            .sprite(this.x, this.y, HERO_TEXTURE_KEY)
            .setSize(8, 8)
            .setOffset(HERO_OFFSETS.standing.x, HERO_OFFSETS.standing.y)
            .setScale(GAME_SCALE)
            .setFrame(HERO_FRAMES.standing[startingDirection])
            .setDepth(1)
            .setTint(HERO_TINT)
            .on('animationupdate', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, heroSprite: Phaser.GameObjects.Sprite) => {
                // add punching sound effects
                if (this.isPunching && animation.key.toLocaleLowerCase().includes('punch')) {
                    if (frame.index % 5 == 1) {
                        this.scene.sound.play('punch2');
                    }
                    if (frame.index % 5 == 0) {
                        this.scene.sound.play('punch1');
                    }
                } else {
                    if (frame.index % 3 == 1) {
                        this.scene.sound.play('step', {rate: 2.6});
                    }
                    if (frame.index % 3 == 0) {
                        this.scene.sound.play('step', {rate: 2});
                    }
                }
            })
            ;
        // jump-start flipX & currentDirection
        this.currentDirection = startingDirection;
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
                    frames: this.scene.anims.generateFrameNumbers(HERO_TEXTURE_KEY, { 
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

    calculateGamepad(gamepad: Phaser.Input.Gamepad.Gamepad): {up: boolean, down: boolean, left: boolean, right: boolean} {
        const directions = {
            up: false,
            down: false,
            left: false,
            right: false,
        }

        
        if (!!gamepad) {
            const axisH = gamepad.axes[0].getValue();
            const axisV = gamepad.axes[1].getValue();
            if (gamepad.up || axisV < 0) {
                directions.up = true;
            }
            if (gamepad.down || axisV > 0) {
                directions.down = true;
            }
            if (gamepad.left || axisH < 0) {
                directions.left = true;
            }
            if (gamepad.right || axisH > 0) {
                directions.right = true;
            }
        }

        return directions;
    }
}