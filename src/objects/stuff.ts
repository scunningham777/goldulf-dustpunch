import { STUFF_CONFIGS } from "../config";
import { GAME_SCALE, INVENTORY_REGISTRY_KEY, DUST_PUNCH_EVENT_KEY, STUFF_TINT } from "../constants";
import StuffConfig from "../interfaces/stuffConfig";
import StuffInInventory from "../interfaces/stuffInInventory";

export default class Stuff extends Phaser.GameObjects.Image {
    private blinkState: 0 | 1 | 2 | 3 = 0;
    private blinkTimer: Phaser.Time.TimerEvent;
    private addToInventoryTween: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, private stuffConfig: StuffConfig) {
        super(scene, x, y, key, stuffConfig.frameIndex);

        // scale the stuff
        this.setScale(GAME_SCALE);
        // add the stuff to our existing scene
        this.scene.add.existing(this);

        const timeline = this.scene.tweens.createTimeline();

        timeline.add({
            targets: this,
            y: y - this.displayHeight,
            duration: 2000,
            onComplete: () => {
                this.blinkState = 1;
                this.setTint(STUFF_TINT);
                this.setVisible(true);
                this.scene.time.removeEvent(this.blinkTimer);
            }
        });

        this.addToInventoryTween = this.scene.tweens.create({
            targets: this,
            x: {value: () => this.scene.cameras.main.scrollX + this.scene.scale.width, ease: 'Quad.easeIn'},
            y: {value: () => this.scene.cameras.main.scrollY + this.scene.scale.height, ease: 'Back.easeIn'},
            scale: {value: 1, ease: 'Quad.easeIn'},
            duration: 2000,
            onComplete: () => {
                this.cleanUp();
            }
        })
        timeline.queue(this.addToInventoryTween);

        console.log(this.scene.scale.height);

        timeline.play();

        this.blink();

        this.scorePoints();
    }

    update() {
        if (this.addToInventoryTween.isPlaying()) {
            this.addToInventoryTween.updateTo('x', this.scene.cameras.main.scrollX + this.scene.scale.width)
            this.addToInventoryTween.updateTo('y', this.scene.cameras.main.scrollY + this.scene.scale.height)
        }
    }

    scorePoints() {
        const inventory: StuffInInventory[] = this.scene.registry.get(INVENTORY_REGISTRY_KEY) || [];
        const currentStuffType = inventory.find(i => i.stuffConfigId == this.stuffConfig.stuffName);
        if (currentStuffType === undefined) {
            inventory.push({stuffConfigId: this.stuffConfig.stuffName, quantity: 1})
        } else {
            currentStuffType.quantity++;
        }
        this.scene.registry.set(INVENTORY_REGISTRY_KEY, inventory);
    }

    blink() {
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
        // this.scene.time.removeEvent(this.blinkTimer);
        this.destroy();
    }
}

