import { CARDINAL_DIRECTION } from '../utils';
import { DOUBLE_TAP_THRESHOLD, SWIPE_MAX_TIME, SWIPE_MIN_DISTANCE, SHOW_MENU_REGISTRY_KEY, UI_BAR_HEIGHT } from '../constants';

export class HeroInput {
    // ---- existing input state (used by joystick controller) ----
    public touchStartX: number = null;
    public touchStartY: number = null;
    public moveThreshold = 30;

    // ---- dash / special move state ----
    private lastTapDir: CARDINAL_DIRECTION = null;
    private lastTapTime = 0;                       // timestamp of last directional tap

    private prevGamepadDirections = {up:false,down:false,left:false,right:false};
    private prevGamepadButtons: boolean[] = [];

    private pointerDownX: number = null;
    private pointerDownY: number = null;
    private pointerDownTime = 0;
    private lastPointerUpTime = 0;
    private spinRequested = false; // flag set by double tap detection
    private swipeDirection: CARDINAL_DIRECTION | null = null; // direction of detected swipe

    constructor(private scene: Phaser.Scene) {
        // hook pointer events for swipe detection/double tap on mobile
        this.scene.input.on('pointerdown', this.onPointerDown, this);
        this.scene.input.on('pointerup', this.onPointerUp, this);
    }

    // ---------- tap detection methods ----------
    handleTap(direction: CARDINAL_DIRECTION): boolean {
        const now = this.scene.time.now;
        if (this.lastTapDir === direction && now - this.lastTapTime <= DOUBLE_TAP_THRESHOLD) {
            // reset so a third tap doesn't immediately re-trigger
            this.lastTapDir = null;
            return true; // double tap detected
        } else {
            this.lastTapDir = direction;
            this.lastTapTime = now;
            return false;
        }
    }

    // ---------- pointer event handlers ----------
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

    private onPointerUp(pointer: Phaser.Input.Pointer): void {
        // detect quick directional swipe
        const dx = pointer.x - (this.pointerDownX ?? 0);
        const dy = pointer.y - (this.pointerDownY ?? 0);
        const dt = pointer.upTime - this.pointerDownTime;
        this.pointerDownX = null;
        this.pointerDownY = null;

        if (dt <= SWIPE_MAX_TIME && (Math.abs(dx) >= SWIPE_MIN_DISTANCE || Math.abs(dy) >= SWIPE_MIN_DISTANCE)) {
            // it's a swipe - determine direction and store for hero to check
            this.swipeDirection = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? CARDINAL_DIRECTION.RIGHT : CARDINAL_DIRECTION.LEFT)
                : (dy > 0 ? CARDINAL_DIRECTION.DOWN : CARDINAL_DIRECTION.UP);
        } else {
            // check for double tap (no significant movement)
            const now = pointer.upTime;
            if (now - this.lastPointerUpTime <= DOUBLE_TAP_THRESHOLD) {
                // double tap detected - request spin
                this.spinRequested = true;
            }
            this.lastPointerUpTime = now;
        }
    }

    // ---------- gamepad methods ----------
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

    getGamepadEdge(gamepadDirections: {up: boolean, down: boolean, left: boolean, right: boolean}): CARDINAL_DIRECTION | null {
        // gamepad edge detection
        const dirs: (keyof typeof gamepadDirections)[] = ['left','right','up','down'];
        for (const dir of dirs) {
            const active = gamepadDirections[dir];
            const prev = (this.prevGamepadDirections as any)[dir];
            if (active && !prev) {
                // just pressed
                (this.prevGamepadDirections as any)[dir] = active;
                return CARDINAL_DIRECTION[dir.toUpperCase() as keyof typeof CARDINAL_DIRECTION];
            }
            (this.prevGamepadDirections as any)[dir] = active;
        }
        return null;
    }

    checkGamepadSpin(gamepad: Phaser.Input.Gamepad.Gamepad): boolean {
        if (!gamepad) return false;

        // check any gamepad button except index 8 or 9
        for (let i = 0; i < gamepad.buttons.length; i++) {
            if (i !== 8 && i !== 9 && gamepad.buttons[i].value === 1 && !this.prevGamepadButtons[i]) {
                this.prevGamepadButtons = gamepad.buttons.map(b => b.value === 1);
                return true;
            }
        }
        // update previous button states
        this.prevGamepadButtons = gamepad.buttons.map(b => b.value === 1);
        return false;
    }

    // ---------- keyboard spin detection ----------
    checkKeyboardSpin(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));
    }

    // ---------- pointer spin detection ----------
    checkPointerSpin(): boolean {
        if (this.spinRequested) {
            this.spinRequested = false;
            return true;
        }
        return false;
    }

    // ---------- pointer swipe detection ----------
    checkPointerSwipe(): CARDINAL_DIRECTION | null {
        if (this.swipeDirection !== null) {
            const dir = this.swipeDirection;
            this.swipeDirection = null;
            return dir;
        }
        return null;
    }
}