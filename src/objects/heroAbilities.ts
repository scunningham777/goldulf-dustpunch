import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, HERO_FRAMES, HERO_TINT, INVENTORY_RELICS_REGISTRY_KEY, SPIN_DUST_BREAK_EVENT_KEY, WALL_BREAK_EVENT_KEY, WALL_BREAK_PUSH_THRESHOLD } from '../constants';

export class HeroAbilities {
    // ---- dash / special move state ----
    private _isDashing = false;
    private _dashDir: CARDINAL_DIRECTION = null;
    private dashCooldownEndsAt = 0;  // timestamp when cooldown expires (0 = no cooldown)
    private _dashPhaseEndTime = 0;    // when current dash phase ends
    private _isBoosting = false;
    private boostDuration = 5000; // total ms of boost
    private blinkTimer: Phaser.Time.TimerEvent;
    private blinkState = false;  // false = HERO_TINT, true = white
    private blinkDelay = 250; // ms between blink state changes during boost

    // spin move state
    private spinCooldownEndsAt = 0;
    private _isSpinning = false;
    private spinStep = 0;
    private originalDirection: CARDINAL_DIRECTION = null;
    private spinTimer: Phaser.Time.TimerEvent;
    private spinDustRadius = 4 * 16 * GAME_SCALE; // pixels

    // wall break state (cestus relic)
    private wallPushTimer = 0; // how long (ms) hero has been pushing into wall
    private wallPushCoords: {x: number, y: number} = null; // tile coords of wall being pushed
    private wallBreakCooldownEndsAt = 0; // timestamp when cooldown expires (0 = no cooldown)
    private wallPushOverlaySprite: Phaser.GameObjects.Sprite = null; // overlay sprite to lock hero tint on the pushed wall tile
    private heroShakeOverlay: Phaser.GameObjects.Sprite = null; // non-physics overlay for hero shake visual
    private heroShakeTween: Phaser.Tweens.Tween = null; // tween for hero shaking effect
    private _heroShakeOffset = { x: 0, y: 0 }; // current shake offset for overlay sprite

    constructor(private scene: Phaser.Scene, private heroSprite: Phaser.Physics.Arcade.Sprite) {}

    // ---------- dash methods ----------
    canDash(): boolean {
        return !this._isDashing && !this._isBoosting && this.getSandalQuantity() > 0 && this.scene.time.now >= this.dashCooldownEndsAt;
    }

    startDash(direction: CARDINAL_DIRECTION) {
        if (!this.canDash()) {
            return;
        }
        this.stopWallPushEffects();
        this._isDashing = true;
        this._dashDir = direction;
        this._dashPhaseEndTime = this.scene.time.now + 1000;  // 2 seconds dash
        const animDir = direction === CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT : direction;
        this.heroSprite.anims.play('walk' + animDir, true);
        this.heroSprite.setTint(0xFFFFFF);
    }

    updateDash(): boolean {
        if (!this._isDashing) return false;

        const now = this.scene.time.now;
        const body = this.heroSprite.body as Phaser.Physics.Arcade.Body;
        const hitWall = body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down;

        // dash phase: 4x speed, straight line, no control
        if (hitWall || now >= this._dashPhaseEndTime) {
            this.endDash();
            return true;
        } else {
            // Check for upcoming wall collisions to prevent tunneling at high speeds
            if (this.willCollideWithWall(this._dashDir, this.heroSprite.body.velocity.x || this.heroSprite.body.velocity.y || 0)) {
                // Stop the dash immediately if we're about to hit a wall
                this.endDash();
                return true;
            }
        }
        return false;
    }

    private endDash() {
        this._isDashing = false;
        this._isBoosting = true;
        this._dashPhaseEndTime = this.scene.time.now + this.boostDuration;
        this.heroSprite.setVelocity(0);  // stop momentum
        this.startBoostBlinking();
    }

    applyDashVelocity(velocity: number) {
        if (!this._isDashing) return;

        const speed = velocity * 4;
        switch (this._dashDir) {
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

    updateBoost(velocity: number): boolean {
        if (!this._isBoosting) return false;

        // apply boost multiplier if in boost phase
        if (this.heroSprite.body.velocity.x !== 0 || this.heroSprite.body.velocity.y !== 0) {
            this.heroSprite.body.velocity.x *= 2;
            this.heroSprite.body.velocity.y *= 2;
        }

        // check if boost phase should end
        if (this.scene.time.now >= this._dashPhaseEndTime) {
            this._isBoosting = false;
            this.stopBoostBlinking();
            const sandalQuantity = this.getSandalQuantity();
            const cooldownMs = this.calculateDashCooldownMs(sandalQuantity);
            this.dashCooldownEndsAt = this.scene.time.now + cooldownMs;
            return true;
        }
        return false;
    }

    // ---------- spin methods ----------
    canSpin(): boolean {
        return this.getRelicQuantity('dagger') > 0 && !this._isDashing && !this._isBoosting && !this._isSpinning && this.scene.time.now >= this.spinCooldownEndsAt;
    }

    startSpin(currentDirection: CARDINAL_DIRECTION) {
        this.stopWallPushEffects();
        this._isSpinning = true;
        this.spinStep = 0;
        this.originalDirection = currentDirection;
        this.heroSprite.setVelocity(0);
        this.heroSprite.anims.stop();
        this.doSpinStep();
    }

    updateSpin(): boolean {
        return this._isSpinning;
    }

    stopSpin() {
        if (this.spinTimer) {
            this.scene.time.removeEvent(this.spinTimer);
            this.spinTimer = null;
        }
        if (this._isSpinning) {
            this._isSpinning = false;
        }
    }

    private doSpinStep() {
        const spinDirections = [CARDINAL_DIRECTION.DOWN, CARDINAL_DIRECTION.LEFT, CARDINAL_DIRECTION.UP, CARDINAL_DIRECTION.RIGHT];

        if (this.spinStep < spinDirections.length) {
            // set direction for current spin step
            const dir = spinDirections[this.spinStep];
            this.heroSprite.setFrame(HERO_FRAMES.punchAnimStart[dir]);

            this.spinStep++;

            // break dust halfway through spin (after 2 steps)
            if (this.spinStep === 2) {
                this.scene.registry.events.emit(SPIN_DUST_BREAK_EVENT_KEY, this.heroSprite.x, this.heroSprite.y, this.spinDustRadius);
            }

            this.spinTimer = this.scene.time.delayedCall(200, this.doSpinStep, [], this);
        } else {
            // spin complete, return to original direction and resume
            this.heroSprite.setFrame(HERO_FRAMES.standing[this.originalDirection]);
            this._isSpinning = false;

            // set cooldown after spin completes
            const daggerQuantity = this.getRelicQuantity('dagger');
            const cooldownMs = this.calculateAbilityCooldownMs(daggerQuantity);
            this.spinCooldownEndsAt = this.scene.time.now + cooldownMs;
        }
    }

    // ---------- wall push methods ----------
    updateWallPush() {
        const body = this.heroSprite.body as Phaser.Physics.Arcade.Body;
        const isBlocked = body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down;
        const isMoving = this.heroSprite.body.velocity.x !== 0 || this.heroSprite.body.velocity.y !== 0;
        const wasPushing = this.wallPushTimer > 0;

        // check if hero is pushing into wall while moving and not in another special state
        if (isBlocked && isMoving && !this._isDashing && !this._isBoosting && !this._isSpinning && this.scene.time.now >= this.wallBreakCooldownEndsAt) {
            // increment push timer
            this.wallPushTimer += this.scene.game.loop.delta;

            // start effects if we just started pushing
            if (!wasPushing && this.wallPushTimer > 0) {
                this.startWallPushEffects(this.heroSprite.flipX ? CARDINAL_DIRECTION.LEFT : CARDINAL_DIRECTION.RIGHT);
            }

            // if we've been pushing long enough, emit wall break event
            if (this.wallPushTimer >= WALL_BREAK_PUSH_THRESHOLD) {
                const coords = this.getWallTileCoords();
                if (coords) {
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

    updateShakeOverlay() {
        if (this.heroShakeOverlay) {
            this.heroShakeOverlay.setPosition(
                this.heroSprite.x + this._heroShakeOffset.x,
                this.heroSprite.y + this._heroShakeOffset.y
            );
        }
    }

    // ---------- private helpers ----------
    private getSandalQuantity(): number {
        const relics = this.scene.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const sandal = relics.find((item: any) => item.inventoryItemKey === 'sandal');
        return sandal ? sandal.quantity : 0;
    }

    private getRelicQuantity(relicName: string): number {
        const relics = this.scene.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const relic = relics.find((item: any) => item.inventoryItemKey === relicName);
        return relic ? relic.quantity : 0;
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

    private startWallPushEffects(currentDirection: CARDINAL_DIRECTION) {
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
        const punchFrame = HERO_FRAMES.punchAnimStart[this.heroSprite.flipX ? CARDINAL_DIRECTION.LEFT : CARDINAL_DIRECTION.RIGHT];
        this.heroSprite.setFrame(punchFrame);
        this.heroSprite.anims.pause();
        this.heroSprite.visible = false;

        this.heroShakeOverlay = this.scene.add.sprite(this.heroSprite.x, this.heroSprite.y, this.heroSprite.texture.key)
            .setScale(this.heroSprite.scaleX, this.heroSprite.scaleY)
            .setFrame(punchFrame)
            .setFlipX(this.heroSprite.flipX)
            .setTint(HERO_TINT)
            .setDepth(this.heroSprite.depth + 0.1);

        this._heroShakeOffset = { x: 0, y: 0 };

        this.heroShakeTween = this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 100,
            repeat: -1,
            ease: 'Linear',
            onUpdate: (tween) => {
                const progress = tween.getValue();
                this._heroShakeOffset.x = Math.sin(progress * Math.PI * 4) * 2;
                this._heroShakeOffset.y = Math.cos(progress * Math.PI * 6) * 2;
            }
        });
    }

    private stopWallPushEffects(resumeAnimation: boolean = true) {
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
        if (resumeAnimation) {
            this.heroSprite.anims.resume();
        }
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

    // ---------- getters for Hero to access state ----------
    get isDashing() { return this._isDashing; }
    get isBoosting() { return this._isBoosting; }
    get isSpinning() { return this._isSpinning; }
    get heroShakeOffset() { return this._heroShakeOffset; }
    get dashDir() { return this._dashDir; }
    get dashPhaseEndTime() { return this._dashPhaseEndTime; }

    stopAll() {
        this.stopBoostBlinking();
        this.stopSpin();
        this.stopWallPushEffects(false);
    }
}