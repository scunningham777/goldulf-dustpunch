import { GAME_SCALE, INVENTORY_STUFF_REGISTRY_KEY, STUFF_TINT } from "../constants";
import { StuffConfig } from "../interfaces/stuffConfig";
import { InventoryItem } from "../interfaces/stuffInInventory";

export class Stuff extends Phaser.GameObjects.Image {
    private blinkState: 0 | 1 | 2 | 3 = 0;
    private blinkTimer: Phaser.Time.TimerEvent;
    private addToInventoryTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, private stuffConfig: StuffConfig) {
        super(scene, x, y, key, stuffConfig.frameIndex);

        this.setScale(GAME_SCALE);
        this.scene.add.existing(this);

        this.scene.tweens.add({
            targets: this,
            y: y - this.displayHeight,
            duration: 1000,
            onComplete: () => {
                this.blinkState = 1;
                this.setTint(STUFF_TINT);
                this.setVisible(true);
                this.scene.time.removeEvent(this.blinkTimer);
                
                // Start the second tween after first completes
                this.addToInventoryTween = this.scene.tweens.add({
                    targets: this,
                    x: {value: () => this.scene.cameras.main.scrollX + this.scene.scale.width, ease: 'Quad.easeIn'},
                    y: {value: () => this.scene.cameras.main.scrollY + this.scene.scale.height, ease: 'Back.easeIn'},
                    scale: {value: 1, ease: 'Quad.easeIn'},
                    duration: 1500,
                    onComplete: () => {
                        this.cleanUp();
                    }
                });
            }
        });

        this.blink();

        this.scorePoints();
    }

    update() {
        if (this.addToInventoryTween && this.addToInventoryTween.isPlaying()) {
            this.addToInventoryTween.updateTo('x', this.scene.cameras.main.scrollX + this.scene.scale.width)
            this.addToInventoryTween.updateTo('y', this.scene.cameras.main.scrollY + this.scene.scale.height)
        }
    }

    override destroy(fromScene?: boolean) {
        if (this.blinkTimer) {
            this.scene.time.removeEvent(this.blinkTimer);
        }
        if (this.addToInventoryTween) {
            this.addToInventoryTween.stop();
        }
        super.destroy(fromScene);
    }

    scorePoints() {
        const inventory: InventoryItem[] = this.scene.registry.get(INVENTORY_STUFF_REGISTRY_KEY) || [];
        const currentStuffType = inventory.find(i => i.inventoryItemKey == this.stuffConfig.stuffName);
        if (currentStuffType === undefined) {
            inventory.push({inventoryItemKey: this.stuffConfig.stuffName, quantity: 1})
        } else {
            currentStuffType.quantity++;
        }
        this.scene.registry.set(INVENTORY_STUFF_REGISTRY_KEY, inventory);
    }

    blink() {
        // clear any existing timer before scheduling next blink
        if (this.blinkTimer) {
            this.scene.time.removeEvent(this.blinkTimer);
        }

        this.blinkState += 1;
        if (this.blinkState > 3) {
            this.blinkState = 1;
        }

        switch (this.blinkState) {
            case 1:
                this.setTint(STUFF_TINT);
                this.setVisible(true);
                break;
            case 2:
                this.setTint(0xffffff);
                break;
            case 3:
                this.setVisible(false);
                break;
        }

        this.blinkTimer = this.scene.time.delayedCall(100, this.blink, [], this)
    }

    cleanUp() {
        if (this.blinkTimer) {
            this.scene.time.removeEvent(this.blinkTimer);
        }
        if (this.addToInventoryTween) {
            this.addToInventoryTween.stop();
        }
        this.destroy();
    }
}

