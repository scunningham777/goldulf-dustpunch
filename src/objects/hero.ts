import { CARDINAL_DIRECTION } from '../utils';
import { GAME_SCALE, HERO_ANIM_FRAME_RATES, HERO_FRAMES, HERO_TINT, HERO_OFFSETS } from '../constants';

export default class Hero {

    private heroSprite: Phaser.Physics.Arcade.Sprite;
    private targetX: number = null;
    private targetY: number = null;
    // private touchStartX: number = null;
    // private touchStartY: number = null;
    // private moveThreshold = 30;
    // private doubleTouch = false;
    public isPunching = false;
    public isFrozen = false;
    private touchTimeoutId = null;
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
        if (this.isFrozen) {
            this.unfreeze();
        }
        let newDirection: CARDINAL_DIRECTION = null;
        const pointer = this.scene.input.activePointer;

        if (cursors.left.isDown || pointer.isDown && pointer.worldX < this.heroSprite.x - this.heroSprite.width / 2) {
            this.heroSprite.setVelocityX(-this.velocity);
            newDirection = CARDINAL_DIRECTION.LEFT;
        } else if (cursors.right.isDown || pointer.isDown && pointer.worldX > this.heroSprite.x + this.heroSprite.width / 2) {
            this.heroSprite.setVelocityX(this.velocity);
            newDirection = CARDINAL_DIRECTION.RIGHT;
        }

        if (cursors.up.isDown || pointer.isDown && pointer.worldY < this.heroSprite.y - this.heroSprite.height / 2) {
            this.heroSprite.setVelocityY(-this.velocity);
            newDirection = CARDINAL_DIRECTION.UP;
        } else if (cursors.down.isDown || pointer.isDown && pointer.worldY > this.heroSprite.y + this.heroSprite.height / 2) {
            this.heroSprite.setVelocityY(this.velocity);
            newDirection = CARDINAL_DIRECTION.DOWN;
        }

        if (newDirection != null) {
            this.currentDirection = newDirection;
            const animDirection = newDirection == CARDINAL_DIRECTION.LEFT ? CARDINAL_DIRECTION.RIGHT
                : newDirection;
            this.heroSprite.anims.play((this.isPunching ? 'punch' : 'walk') + animDirection, true);
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
            .setTint(HERO_TINT)
            ;
        // this.heroSprite.tint = HERO_TINT;
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

    setUpInput() {
        // this.scene.input.on('pointerdown', (pointer:Phaser.Input.Pointer) => {
        //     this.targetX = pointer.worldX;
        //     this.targetY = pointer.worldY;
        //     this.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, {startX: pointer.x, startY: pointer.y});
        //     if (this.touchTimeoutId != null) {
        //         clearTimeout(this.touchTimeoutId)
        //     }
        //     this.touchTimeoutId = setTimeout(() => {
        //         this.scene.registry.set(TOUCH_MOVEMENT_REGISTRY_KEY, null);
        //     }, 1000);
        // });
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

    punch() {
        this.isPunching = true;
        this.heroSprite.setOffset(HERO_OFFSETS.punching[this.currentDirection].x, HERO_OFFSETS.punching[this.currentDirection].y);
        this.scene.time.delayedCall(250, () => {
            this.isPunching = false;
            this.heroSprite.setOffset(HERO_OFFSETS.standing.x, HERO_OFFSETS.standing.y);
        }, [], this);
    }
}