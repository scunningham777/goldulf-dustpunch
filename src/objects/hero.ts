import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, HERO_ANIM_FRAME_RATES, HERO_FRAMES, HERO_TINT, HERO_OFFSETS, HERO_TEXTURE_KEY,
         DOUBLE_TAP_THRESHOLD, DASH_SPEED_MULT, SWIPE_MAX_TIME, SWIPE_MIN_DISTANCE, INVENTORY_RELICS_REGISTRY_KEY } from '../constants';
import { HeroMovementController } from '../interfaces/heroMovementController';
import { FOLLOW_HERO_MOVEMENT_CONTROLLER } from './followHeroMovmentController';

export class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;

    // ---- existing input state (used by joystick controller) ----
    public touchStartX: number = null;
    public touchStartY: number = null;
    public moveThreshold = 30;

    // ---- dash / special move state ----
    private lastTapDir: CARDINAL_DIRECTION = null;
    private lastTapTime = 0;                       // timestamp of last directional tap
    private prevGamepadDirections = {up:false,down:false,left:false,right:false};

    private isDashing = false;
    private dashDir: CARDINAL_DIRECTION = null;
    private dashCooldownEndsAt = 0;  // timestamp when cooldown expires (0 = no cooldown)

    private pointerDownX: number = null;
    private pointerDownY: number = null;
    private pointerDownTime = 0;

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

        // hook pointer events for swipe detection/double tap on mobile
        this.scene.input.on('pointerdown', this.onPointerDown, this);
        this.scene.input.on('pointerup', this.onPointerUp, this);
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, gamepad?: Phaser.Input.Gamepad.Gamepad): void {
        if (this.isFrozen) {
            return;
        }

        // dash handling takes precedence; just let physics run until we hit a
        // wall and then clear the state.  we still want dust collisions and
        // other overlaps to fire, and the movement controller may need to update
        // its touch registry, so call it even when dashing.
        if (this.isDashing) {
            const body = this.heroSprite.body as Phaser.Physics.Arcade.Body;
            if (body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down) {
                // stopped by a tile/wall - end dash and start cooldown
                this.isDashing = false;
                const sandalQuantity = this.getSandalQuantity();
                const cooldownMs = this.calculateDashCooldownMs(sandalQuantity);
                this.dashCooldownEndsAt = this.scene.time.now + cooldownMs;
                this.heroSprite.setVelocity(0);
            }
            this.mvtCtrl.update(this);
            return; // skip normal input while dashing
        }

        // read input events so we can spot double-taps / just-pressed
        const pointer = this.scene.input.activePointer;
        const gamepadDirections = this.calculateGamepad(gamepad);

        // keyboard just-down detection
        if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
            this.handleTap(CARDINAL_DIRECTION.LEFT);
        }
        if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
            this.handleTap(CARDINAL_DIRECTION.RIGHT);
        }
        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.handleTap(CARDINAL_DIRECTION.UP);
        }
        if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
            this.handleTap(CARDINAL_DIRECTION.DOWN);
        }

        // gamepad edge detection
        ['left','right','up','down'].forEach((dir: string) => {
            const active = (gamepadDirections as any)[dir];
            const prev = (this.prevGamepadDirections as any)[dir];
            if (active && !prev) {
                // just pressed
                this.handleTap(CARDINAL_DIRECTION[dir.toUpperCase() as keyof typeof CARDINAL_DIRECTION]);
            }
            (this.prevGamepadDirections as any)[dir] = active;
        });

        if (!this.isDashing) {
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

            // fix #17 - cap lineara velocity at 1 x this.velocity
            if (this.heroSprite.body.velocity.x != 0 && this.heroSprite.body.velocity.y != 0) {
                this.heroSprite.body.velocity.x *= Math.SQRT2 / 2;
                this.heroSprite.body.velocity.y *= Math.SQRT2 / 2;
            }
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

    // ---------- dash helpers ----------
    private handleTap(direction: CARDINAL_DIRECTION) {
        const now = this.scene.time.now;
        if (this.lastTapDir === direction && now - this.lastTapTime <= DOUBLE_TAP_THRESHOLD) {
            this.startDash(direction);
            // reset so a third tap doesn't immediately re-trigger
            this.lastTapDir = null;
        } else {
            this.lastTapDir = direction;
            this.lastTapTime = now;
        }
    }

    private startDash(direction: CARDINAL_DIRECTION) {
        if (!this.canDash()) {
            return;
        }
        this.isDashing = true;
        this.dashDir = direction;
        this.currentDirection = direction;
        const speed = this.velocity * DASH_SPEED_MULT;
        switch (direction) {
            case CARDINAL_DIRECTION.LEFT:
                this.heroSprite.setVelocityX(-speed);
                break;
            case CARDINAL_DIRECTION.RIGHT:
                this.heroSprite.setVelocityX(speed);
                break;
            case CARDINAL_DIRECTION.UP:
                this.heroSprite.setVelocityY(-speed);
                break;
            case CARDINAL_DIRECTION.DOWN:
                this.heroSprite.setVelocityY(speed);
                break;
        }
        const animDir = direction === CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT : direction;
        this.heroSprite.anims.play('walk' + animDir, true);
    }

    private canDash(): boolean {
        return !this.isDashing && this.getSandalQuantity() > 0 && this.scene.time.now >= this.dashCooldownEndsAt;
    }

    private getSandalQuantity(): number {
        const relics = this.scene.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const sandal = relics.find((item: any) => item.inventoryItemKey === 'sandal');
        return sandal ? sandal.quantity : 0;
    }

    private calculateDashCooldownMs(sandalQuantity: number): number {
        let cooldownSeconds = 20;
        // Half the cooldown for each sandal beyond the first, rounded up each time
        for (let i = 1; i < sandalQuantity; i++) {
            cooldownSeconds = Math.ceil(cooldownSeconds / 2);
        }
        return Math.max(1, cooldownSeconds) * 1000;  // minimum 1 second, convert to ms
    }

    private hasSandalRelic(): boolean {
        return this.getSandalQuantity() > 0;
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
        this.pointerDownX = pointer.x;
        this.pointerDownY = pointer.y;
        this.pointerDownTime = pointer.downTime;
    }

    private onPointerUp(pointer: Phaser.Input.Pointer) {
        // detect quick directional swipe
        const dx = pointer.x - (this.pointerDownX ?? 0);
        const dy = pointer.y - (this.pointerDownY ?? 0);
        const dt = pointer.upTime - this.pointerDownTime;
        this.pointerDownX = null;
        this.pointerDownY = null;
        if (dt <= SWIPE_MAX_TIME && (Math.abs(dx) >= SWIPE_MIN_DISTANCE || Math.abs(dy) >= SWIPE_MIN_DISTANCE)) {
            const dir = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? CARDINAL_DIRECTION.RIGHT : CARDINAL_DIRECTION.LEFT)
                : (dy > 0 ? CARDINAL_DIRECTION.DOWN : CARDINAL_DIRECTION.UP);
            this.startDash(dir);
        }
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