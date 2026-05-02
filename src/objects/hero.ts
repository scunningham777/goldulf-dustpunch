import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, HERO_ANIM_FRAME_RATES, HERO_FRAMES, HERO_TINT, HERO_OFFSETS, HERO_TEXTURE_KEY,
         DOUBLE_TAP_THRESHOLD, SWIPE_MAX_TIME, SWIPE_MIN_DISTANCE, INVENTORY_RELICS_REGISTRY_KEY, SHOW_MENU_REGISTRY_KEY, UI_BAR_HEIGHT, SPIN_DUST_BREAK_EVENT_KEY, WALL_BREAK_EVENT_KEY, WALL_BREAK_PUSH_THRESHOLD } from '../constants';
import { HERO_MOVEMENT_CONTROLLER_MAP, HERO_MOVEMENT_CONTROLLERS, HeroMovementController } from '../interfaces/heroMovementController';
import { FOLLOW_HERO_MOVEMENT_CONTROLLER } from './followHeroMovmentController';

export class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;
    private mvtCtrl: HeroMovementController = FOLLOW_HERO_MOVEMENT_CONTROLLER;

    // ---- existing input state (used by joystick controller) ----
    public touchStartX: number = null;
    public touchStartY: number = null;
    public moveThreshold = 30;

    // ---- dash / special move state ----
    private lastTapDir: CARDINAL_DIRECTION = null;
    private lastTapTime = 0;                       // timestamp of last directional tap
    private prevGamepadDirections = {up:false,down:false,left:false,right:false};
    private prevGamepadButtons: boolean[] = [];

    private isDashing = false;
    private dashDir: CARDINAL_DIRECTION = null;
    private dashCooldownEndsAt = 0;  // timestamp when cooldown expires (0 = no cooldown)
    private dashPhaseEndTime = 0;    // when current dash phase ends
    private isBoosting = false;
    private boostDuration = 5000; // total ms of boost
    private blinkTimer: Phaser.Time.TimerEvent;
    private blinkState = false;  // false = HERO_TINT, true = white
    private blinkDelay = 250; // ms between blink state changes during boost

    // spin move state
    private spinCooldownEndsAt = 0;
    private isSpinning = false;
    private spinStep = 0;
    private originalDirection: CARDINAL_DIRECTION = null;
    private spinTimer: Phaser.Time.TimerEvent;
    private spinDustRadius = 4 * 16 * GAME_SCALE; // pixels
    // mobile double tap for spin
    private lastPointerUpTime = 0;

    // wall break state (cestus relic)
    private wallPushTimer = 0; // how long (ms) hero has been pushing into wall
    private wallPushCoords: {x: number, y: number} = null; // tile coords of wall being pushed
    private wallBreakCooldownEndsAt = 0; // timestamp when cooldown expires (0 = no cooldown)
    private wallPushOverlaySprite: Phaser.GameObjects.Sprite = null; // overlay sprite to lock hero tint on the pushed wall tile
    private heroShakeOverlay: Phaser.GameObjects.Sprite = null; // non-physics overlay for hero shake visual
    private heroShakeTween: Phaser.Tweens.Tween = null; // tween for hero shaking effect
    private heroShakeOffset = { x: 0, y: 0 }; // current shake offset for overlay sprite

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
        mvtCtrlType: HERO_MOVEMENT_CONTROLLERS = HERO_MOVEMENT_CONTROLLERS.FOLLOW_HERO,
    ) {
        this.addToScene(startingDirection);
        this.addAnimations();
        this.setMovementController(mvtCtrlType);

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
            const now = this.scene.time.now;
            const body = this.heroSprite.body as Phaser.Physics.Arcade.Body;
            const hitWall = body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down;

            // dash phase: 4x speed, straight line, no control
            if (hitWall || now >= this.dashPhaseEndTime) {
                this.isDashing = false;
                this.isBoosting = true;
                this.dashPhaseEndTime = now + this.boostDuration;
                this.heroSprite.setVelocity(0);  // stop momentum
                this.startBoostBlinking();
            } else {
                // maintain straight line velocity during dash
                const speed = this.velocity * 4;
                
                // Check for upcoming wall collisions to prevent tunneling at high speeds
                if (this.willCollideWithWall(this.dashDir, speed)) {
                    // Stop the dash immediately if we're about to hit a wall
                    this.isDashing = false;
                    this.isBoosting = true;
                    this.dashPhaseEndTime = now + this.boostDuration;
                    this.heroSprite.setVelocity(0);
                    this.startBoostBlinking();
                } else {
                    // maintain straight line velocity during dash
                    switch (this.dashDir) {
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
                }
            }

            this.mvtCtrl.update(this);
            return; // skip normal input while dashing
        }

        // handle spinning state
        if (this.isSpinning) {
            // spinning blocks all other input and movement
            this.mvtCtrl.update(this);
            return;
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

        // spin move detection
        if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))) {
            this.tryStartSpin();
        }
        if (gamepad && !this.isDashing && !this.isBoosting) {
            // check any gamepad button except index 8 or 9
            for (let i = 0; i < gamepad.buttons.length; i++) {
                if (i !== 8 && i !== 9 && gamepad.buttons[i].value === 1 && !this.prevGamepadButtons[i]) {
                    this.tryStartSpin();
                    break;
                }
            }
            // update previous button states
            this.prevGamepadButtons = gamepad.buttons.map(b => b.value === 1);
        }

        if (!this.isDashing && !this.isSpinning) {
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
            if (this.isBoosting) {
                if (this.heroSprite.body.velocity.x !== 0 || this.heroSprite.body.velocity.y !== 0) {
                    this.heroSprite.body.velocity.x *= 2;
                    this.heroSprite.body.velocity.y *= 2;
                }
            }

            // fix #17 - cap linear velocity at 1 x this.velocity
            if (this.heroSprite.body.velocity.x != 0 && this.heroSprite.body.velocity.y != 0) {
                this.heroSprite.body.velocity.x *= Math.SQRT2 / 2;
                this.heroSprite.body.velocity.y *= Math.SQRT2 / 2;
            }

            // check if boost phase should end
            if (this.isBoosting && this.scene.time.now >= this.dashPhaseEndTime) {
                this.isBoosting = false;
                this.stopBoostBlinking();
                const sandalQuantity = this.getSandalQuantity();
                const cooldownMs = this.calculateDashCooldownMs(sandalQuantity);
                this.dashCooldownEndsAt = this.scene.time.now + cooldownMs;
            }

            // wall push tracking (cestus relic ability)
            this.updateWallPushState();
        }

        if (this.heroShakeOverlay) {
            this.heroShakeOverlay.setPosition(
                this.heroSprite.x + this.heroShakeOffset.x,
                this.heroSprite.y + this.heroShakeOffset.y
            );
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

    public setMovementController(mvtCtrlType: HERO_MOVEMENT_CONTROLLERS) {
        this.mvtCtrl = HERO_MOVEMENT_CONTROLLER_MAP.get(mvtCtrlType) ?? FOLLOW_HERO_MOVEMENT_CONTROLLER;
        this.mvtCtrl.init(this);
    }

    freeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = false;
        this.heroSprite.anims.pause();
        this.stopBoostBlinking();
        this.stopSpin();
        this.isFrozen = true;
    }
    unfreeze() {
        (this.entity.body as Phaser.Physics.Arcade.Body).moves = true;
        this.heroSprite.anims.resume();
        if (this.isBoosting) {
            this.startBoostBlinking();
        }
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
        this.stopWallPushEffects();
        this.isDashing = true;
        this.dashDir = direction;
        this.currentDirection = direction;
        this.dashPhaseEndTime = this.scene.time.now + 1000;  // 2 seconds dash
        const animDir = direction === CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT : direction;
        this.heroSprite.anims.play('walk' + animDir, true);
        this.heroSprite.setTint(0xFFFFFF);
    }

    private canDash(): boolean {
        return !this.isDashing && !this.isBoosting && this.getSandalQuantity() > 0 && this.scene.time.now >= this.dashCooldownEndsAt;
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

    private calculateAbilityCooldownMs(relicQuantity: number): number {
        let cooldownSeconds = 20;
        // Half the cooldown for each relic beyond the first, rounded up each time
        for (let i = 1; i < relicQuantity; i++) {
            cooldownSeconds = Math.ceil(cooldownSeconds / 2);
        }
        return Math.max(1, cooldownSeconds) * 1000;  // minimum 1 second, convert to ms
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
        // ignore pointer events that start on the bottom UI bar so UI clicks
        // (like toggling the inventory) don't register as movement input
        if (pointer.y >= (this.scene.scale.height - UI_BAR_HEIGHT)) {
            return;
        }

        // if the inventory/menu is currently open, ignore pointer starts
        if (this.scene.registry.get(SHOW_MENU_REGISTRY_KEY)) {
            return;
        }

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
            // it's a swipe - trigger dash
            const dir = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? CARDINAL_DIRECTION.RIGHT : CARDINAL_DIRECTION.LEFT)
                : (dy > 0 ? CARDINAL_DIRECTION.DOWN : CARDINAL_DIRECTION.UP);
            this.startDash(dir);
        } else {
            // check for double tap (no significant movement)
            const now = pointer.upTime;
            if (now - this.lastPointerUpTime <= DOUBLE_TAP_THRESHOLD) {
                this.tryStartSpin();
            }
            this.lastPointerUpTime = now;
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

    // ---------- boost blinking methods ----------
    private startBoostBlinking() {
        this.stopWallPushEffects();
        this.blinkState = false;
        this.heroSprite.setTint(HERO_TINT);
        this.blinkTimer = this.scene.time.delayedCall(this.blinkDelay, this.boostBlink, [], this);
    }

    private stopBoostBlinking() {
        if (this.blinkTimer) {
            this.scene.time.removeEvent(this.blinkTimer);
            this.blinkTimer = null;
        }
        this.heroSprite.setTint(HERO_TINT);
    }

    private boostBlink() {
        this.blinkState = !this.blinkState;
        this.heroSprite.setTint(this.blinkState ? 0xffffff : HERO_TINT);
        this.blinkTimer = this.scene.time.delayedCall(this.blinkDelay, this.boostBlink, [], this);
    }
    // ---------- spin move methods ----------
    private tryStartSpin() {
        if (this.getRelicQuantity('dagger') > 0 && !this.isDashing && !this.isBoosting && !this.isSpinning && this.scene.time.now >= this.spinCooldownEndsAt) {
            this.startSpin();
        }
    }

    private startSpin() {
        this.stopWallPushEffects();
        this.isSpinning = true;
        this.spinStep = 0;
        this.originalDirection = this.currentDirection;
        this.heroSprite.setVelocity(0);
        this.heroSprite.anims.stop();
        this.doSpinStep();
    }

    private stopSpin() {
        if (this.spinTimer) {
            this.scene.time.removeEvent(this.spinTimer);
            this.spinTimer = null;
        }
        if (this.isSpinning) {
            this.isSpinning = false;
            this.currentDirection = this.originalDirection;
            this.heroSprite.flipX = this.originalDirection === CARDINAL_DIRECTION.LEFT ? true : false;
        }
    }

    private doSpinStep() {
        const spinDirections = [CARDINAL_DIRECTION.DOWN, CARDINAL_DIRECTION.LEFT, CARDINAL_DIRECTION.UP, CARDINAL_DIRECTION.RIGHT];

        if (this.spinStep < spinDirections.length) {
            // set direction for current spin step
            const dir = spinDirections[this.spinStep];
            this.currentDirection = dir;
            this.heroSprite.flipX = dir === CARDINAL_DIRECTION.LEFT ? true : false;
            this.heroSprite.setFrame(HERO_FRAMES.punchAnimStart[dir]);

            this.spinStep++;
            
            // break dust halfway through spin (after 2 steps)
            if (this.spinStep === 2) {
                this.scene.registry.events.emit(SPIN_DUST_BREAK_EVENT_KEY, this.heroSprite.x, this.heroSprite.y, this.spinDustRadius);
            }
            
            this.spinTimer = this.scene.time.delayedCall(200, this.doSpinStep, [], this);
        } else {
            // spin complete, return to original direction and resume
            this.currentDirection = this.originalDirection;
            this.heroSprite.flipX = this.originalDirection === CARDINAL_DIRECTION.LEFT ? true : false;
            this.heroSprite.setFrame(HERO_FRAMES.standing[this.originalDirection]);
            this.isSpinning = false;
            const animDirection = this.originalDirection === CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT : this.originalDirection;
            this.heroSprite.anims.play((this.isPunching ? 'punch' : 'walk') + animDirection, true);
            
            // set cooldown after spin completes
            const daggerQuantity = this.getRelicQuantity('dagger');
            const cooldownMs = this.calculateAbilityCooldownMs(daggerQuantity);
            this.spinCooldownEndsAt = this.scene.time.now + cooldownMs;
        }
    }

    private willCollideWithWall(direction: CARDINAL_DIRECTION, speed: number): boolean {
        // Check ahead in the dash direction for wall tiles to prevent tunneling
        const checkDistance = speed * 0.016; // Check about 1 frame ahead (assuming 60fps)
        let checkX = this.heroSprite.x;
        let checkY = this.heroSprite.y;

        switch (direction) {
            case CARDINAL_DIRECTION.LEFT:
                checkX -= checkDistance;
                break;
            case CARDINAL_DIRECTION.RIGHT:
                checkX += checkDistance;
                break;
            case CARDINAL_DIRECTION.UP:
                checkY -= checkDistance;
                break;
            case CARDINAL_DIRECTION.DOWN:
                checkY += checkDistance;
                break;
        }

        // Find tilemap layers in the scene and check for collisions
        const tilemapLayers = this.scene.children.list.filter(child => 
            child instanceof Phaser.Tilemaps.TilemapLayer
        ) as Phaser.Tilemaps.TilemapLayer[];

        for (const layer of tilemapLayers) {
            // Use hasTileAtWorldXY to check for wall collision
            if (layer.hasTileAtWorldXY(checkX, checkY)) {
                const tile = layer.getTileAtWorldXY(checkX, checkY);
                if (tile && tile.collides) {
                    return true;
                }
            }
        }

        return false;
    }

    private getRelicQuantity(relicName: string): number {
        const relics = this.scene.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const relic = relics.find((item: any) => item.inventoryItemKey === relicName);
        return relic ? relic.quantity : 0;
    }

    // ---------- wall break tracking methods (cestus relic) ----------
    private updateWallPushState() {
        const body = this.heroSprite.body as Phaser.Physics.Arcade.Body;
        const isBlocked = body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down;
        const isMoving = this.heroSprite.body.velocity.x !== 0 || this.heroSprite.body.velocity.y !== 0;
        const wasPushing = this.wallPushTimer > 0;
        
        // check if hero is pushing into wall while moving and not in another special state
        if (isBlocked && isMoving && !this.isDashing && !this.isBoosting && !this.isSpinning && this.scene.time.now >= this.wallBreakCooldownEndsAt) {
            // increment push timer
            this.wallPushTimer += this.scene.game.loop.delta;
            
            // start effects if we just started pushing
            if (!wasPushing && this.wallPushTimer > 0) {
                this.startWallPushEffects();
            }
            
            // if we've been pushing long enough, emit wall break event
            if (this.wallPushTimer >= WALL_BREAK_PUSH_THRESHOLD) {
                const coords = this.getWallTileCoords();
                if (coords) {
                    console.log('Updating wall push state')
                    this.scene.registry.events.emit(WALL_BREAK_EVENT_KEY, coords.x, coords.y);
                    
                    // set cooldown based on cestus quantity
                    const cestusQuantity = this.getRelicQuantity('cestus');
                    const cooldownMs = this.calculateAbilityCooldownMs(cestusQuantity);
                    this.wallBreakCooldownEndsAt = this.scene.time.now + cooldownMs;
                    
                    // reset push timer
                    this.wallPushTimer = 0;
                    this.wallPushCoords = null;
                    this.stopWallPushEffects();
                }
            }
        } else {
            // reset push timer if not pushing anymore
            if (wasPushing) {
                this.stopWallPushEffects();
            }
            this.wallPushTimer = 0;
            this.wallPushCoords = null;
        }
    }

    private getWallTileCoords(): {x: number, y: number} | null {
        // Find the tilemap layer and determine which wall tile the hero is pushing into
        const tilemapLayers = this.scene.children.list.filter(child =>
            child instanceof Phaser.Tilemaps.TilemapLayer
        ) as Phaser.Tilemaps.TilemapLayer[];

        if (tilemapLayers.length === 0) {
            return null;
        }

        const body = this.heroSprite.body as Phaser.Physics.Arcade.Body;
        const layer = tilemapLayers[0]; // assume single layer
        const scaleX = layer.scale;
        const scaleY = layer.scale;

        // Determine which direction hero is being blocked and get tile coords
        let tileX: number, tileY: number;

        if (body.blocked.left) {
            tileX = Math.floor((this.heroSprite.x - this.heroSprite.displayWidth / 2) / (layer.tilemap.tileWidth * scaleX));
            tileY = Math.floor(this.heroSprite.y / (layer.tilemap.tileHeight * scaleY));
        } else if (body.blocked.right) {
            tileX = Math.floor((this.heroSprite.x + this.heroSprite.displayWidth / 2) / (layer.tilemap.tileWidth * scaleX));
            tileY = Math.floor(this.heroSprite.y / (layer.tilemap.tileHeight * scaleY));
        } else if (body.blocked.up) {
            tileX = Math.floor(this.heroSprite.x / (layer.tilemap.tileWidth * scaleX));
            tileY = Math.floor((this.heroSprite.y - this.heroSprite.displayHeight / 2) / (layer.tilemap.tileHeight * scaleY));
        } else if (body.blocked.down) {
            tileX = Math.floor(this.heroSprite.x / (layer.tilemap.tileWidth * scaleX));
            tileY = Math.floor((this.heroSprite.y + this.heroSprite.displayHeight / 2) / (layer.tilemap.tileHeight * scaleY));
        } else {
            return null;
        }

        // clamp to valid tile coordinates
        const mapWidth = layer.tilemap.width;
        const mapHeight = layer.tilemap.height;
        tileX = Math.max(0, Math.min(mapWidth - 1, tileX));
        tileY = Math.max(0, Math.min(mapHeight - 1, tileY));

        return {x: tileX, y: tileY};
    }

    private startWallPushEffects() {
        const coords = this.getWallTileCoords();
        if (!coords) return;

        this.wallPushCoords = coords;

        // Find the tilemap layer
        const tilemapLayers = this.scene.children.list.filter(child =>
            child instanceof Phaser.Tilemaps.TilemapLayer
        ) as Phaser.Tilemaps.TilemapLayer[];
        
        if (tilemapLayers.length === 0) return;
        
        const layer = tilemapLayers[0];
        const tile = layer.getTileAt(coords.x, coords.y);
        if (!tile) return;

        // Create overlay sprite on top of the wall tile and tint it HERO_TINT
        const scaleX = layer.scaleX || layer.scale || 1;
        const scaleY = layer.scaleY || layer.scale || 1;
        const tileWidth = layer.tilemap.tileWidth * scaleX;
        const tileHeight = layer.tilemap.tileHeight * scaleY;
        const spriteX = (coords.x + 0.5) * tileWidth;
        const spriteY = (coords.y + 0.5) * tileHeight;

        const tileset = layer.tilemap.tilesets[0];
        if (!tileset) return;

        this.wallPushOverlaySprite = this.scene.add.sprite(spriteX, spriteY, tileset.image.key, tile.index)
            .setScale(scaleX, scaleY)
            .setTint(HERO_TINT)
            .setDepth(0.5);

        // Shake the hero visually using a separate non-physics overlay sprite
        const punchFrame = HERO_FRAMES.punchAnimStart[this.currentDirection];
        this.heroSprite.setFrame(punchFrame);
        this.heroSprite.anims.pause();
        this.heroSprite.visible = false;

        this.heroShakeOverlay = this.scene.add.sprite(this.heroSprite.x, this.heroSprite.y, HERO_TEXTURE_KEY)
            .setScale(this.heroSprite.scaleX, this.heroSprite.scaleY)
            .setFrame(punchFrame)
            .setFlipX(this.heroSprite.flipX)
            .setTint(HERO_TINT)
            .setDepth(this.heroSprite.depth + 0.1);

        this.heroShakeOffset = { x: 0, y: 0 };

        this.heroShakeTween = this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 100,
            repeat: -1,
            ease: 'Linear',
            onUpdate: (tween) => {
                const progress = tween.getValue();
                this.heroShakeOffset.x = Math.sin(progress * Math.PI * 4) * 2;
                this.heroShakeOffset.y = Math.cos(progress * Math.PI * 6) * 2;
            }
        });
    }

    private stopWallPushEffects() {
        // Destroy overlay sprites if present
        if (this.wallPushOverlaySprite) {
            this.wallPushOverlaySprite.destroy();
            this.wallPushOverlaySprite = null;
        }
        if (this.heroShakeOverlay) {
            this.heroShakeOverlay.destroy();
            this.heroShakeOverlay = null;
        }

        this.wallPushCoords = null;

        if (this.heroShakeTween) {
            this.heroShakeTween.stop();
            this.heroShakeTween = null;
        }

        this.heroSprite.visible = true;
        this.heroSprite.anims.resume();
    }

    private getCestusQuantity(): number {
        const relics = this.scene.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const cestus = relics.find((item: any) => item.inventoryItemKey === 'cestus');
        return cestus ? cestus.quantity : 0;
    }
}