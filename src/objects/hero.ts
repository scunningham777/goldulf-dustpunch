import {
    GAME_SCALE, HERO_ANIM_FRAME_RATES, HERO_FRAMES,
    HERO_OFFSETS, HERO_TEXTURE_KEY,
    HERO_TINT
} from '../constants';
import { HERO_MOVEMENT_CONTROLLER_MAP, HERO_MOVEMENT_CONTROLLERS, HeroMovementController } from '../interfaces/heroMovementController';
import { CARDINAL_DIRECTION } from '../utils';
import { FOLLOW_HERO_MOVEMENT_CONTROLLER } from './followHeroMovmentController';
import { HeroAbilities } from './heroAbilities';
import { HeroInput } from './heroInput';

export class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;
    private mvtCtrl: HeroMovementController = FOLLOW_HERO_MOVEMENT_CONTROLLER;
    private abilities: HeroAbilities;
    private input: HeroInput;

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

    // Input delegation methods for movement controllers (Law of Demeter)
    public getTouchStartX(): number { return this.input.touchStartX; }
    public getTouchStartY(): number { return this.input.touchStartY; }
    public getMoveThreshold(): number { return this.input.moveThreshold; }
    public setTouchStartX(value: number): void { this.input.touchStartX = value; }
    public setTouchStartY(value: number): void { this.input.touchStartY = value; }

    constructor(
        private x: number,
        private y: number,
        private scene: Phaser.Scene,
        private velocity: number,
        startingDirection: CARDINAL_DIRECTION,
        mvtCtrlType: HERO_MOVEMENT_CONTROLLERS = HERO_MOVEMENT_CONTROLLERS.FOLLOW_HERO,
    ) {
        this.addToScene(startingDirection);
        this.addAnimations();
        this.setMovementController(mvtCtrlType);
        this.abilities = new HeroAbilities(this.scene, this.heroSprite);
        this.input = new HeroInput(this.scene);

        // jump-start flipX & currentDirection
        this.currentDirection = startingDirection;
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, gamepad?: Phaser.Input.Gamepad.Gamepad): void {
        if (this.isFrozen) {
            return;
        }

        // dash handling takes precedence; just let physics run until we hit a
        // wall and then clear the state.  we still want dust collisions and
        // other overlaps to fire, and the movement controller may need to update
        // its touch registry, so call it even when dashing.
        if (this.abilities.isDashing) {
            this.abilities.applyDashVelocity(this.velocity);
            this.abilities.updateDash();

            this.mvtCtrl.update(this);
            return; // skip normal input while dashing
        }

        // handle spinning state
        if (this.abilities.isSpinning) {
            // spinning blocks all other input and movement
            this.mvtCtrl.update(this);
            return;
        }

        // read input events so we can spot double-taps / just-pressed
        const pointer = this.scene.input.activePointer;
        const gamepadDirections = this.input.calculateGamepad(gamepad);

        // keyboard just-down detection
        if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
            if (this.input.handleTap(CARDINAL_DIRECTION.LEFT)) {
                this.abilities.startDash(CARDINAL_DIRECTION.LEFT);
            }
        }
        if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
            if (this.input.handleTap(CARDINAL_DIRECTION.RIGHT)) {
                this.abilities.startDash(CARDINAL_DIRECTION.RIGHT);
            }
        }
        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (this.input.handleTap(CARDINAL_DIRECTION.UP)) {
                this.abilities.startDash(CARDINAL_DIRECTION.UP);
            }
        }
        if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
            if (this.input.handleTap(CARDINAL_DIRECTION.DOWN)) {
                this.abilities.startDash(CARDINAL_DIRECTION.DOWN);
            }
        }

        // gamepad edge detection
        const gamepadTapDir = this.input.getGamepadEdge(gamepadDirections);
        if (gamepadTapDir && this.input.handleTap(gamepadTapDir)) {
            this.abilities.startDash(gamepadTapDir);
        }

        // pointer swipe detection
        const swipeDir = this.input.checkPointerSwipe();
        if (swipeDir) {
            this.abilities.startDash(swipeDir);
        }

        // spin move detection
        if (this.input.checkKeyboardSpin()) {
            this.tryStartSpin();
        }
        if (this.input.checkPointerSpin()) {
            this.tryStartSpin();
        }
        if (gamepad && !this.abilities.isDashing && !this.abilities.isBoosting) {
            if (this.input.checkGamepadSpin(gamepad)) {
                this.tryStartSpin();
            }
        }

        if (!this.abilities.isDashing && !this.abilities.isSpinning) {
            this.heroSprite.setVelocity(0);

            let newDirection: CARDINAL_DIRECTION = null;

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

            // apply boost multiplier if in boost phase
            this.abilities.updateBoost();

            // fix #17 - cap linear velocity at 1 x this.velocity
            if (this.heroSprite.body.velocity.x != 0 && this.heroSprite.body.velocity.y != 0) {
                this.heroSprite.body.velocity.x *= Math.SQRT2 / 2;
                this.heroSprite.body.velocity.y *= Math.SQRT2 / 2;
            }

            // wall push tracking (cestus relic ability)
            this.abilities.updateWallPush();
        }

        this.abilities.updateShakeOverlay();

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

    public setMovementController(mvtCtrlType: HERO_MOVEMENT_CONTROLLERS) {
        this.mvtCtrl = HERO_MOVEMENT_CONTROLLER_MAP.get(mvtCtrlType) ?? FOLLOW_HERO_MOVEMENT_CONTROLLER;
        this.mvtCtrl.init(this);
    }

    freeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = false;
        this.abilities.stopAll();
        this.heroSprite.anims.pause();
        this.isFrozen = true;
    }
    unfreeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = true;
        this.heroSprite.anims.resume();
        this.isFrozen = false;
    }

    private tryStartSpin() {
        if (this.abilities.canSpin()) {
            this.abilities.startSpin(this.currentDirection);
        }
    }
}