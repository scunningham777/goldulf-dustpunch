import { GAME_SCALE } from "../constants";
import { RelicConfig } from "../interfaces/relicConfig";

export class Relic extends Phaser.GameObjects.Image {
    private addToInventoryTween: Phaser.Tweens.Tween | null = null;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        textureKey: string,
        private relicConfig: RelicConfig,
    ) {
        super(scene, x, y, textureKey, relicConfig.frameIndex);

        this.setScale(GAME_SCALE);
        this.setTint(relicConfig.tint);
        this.scene.add.existing(this);
    }

    /**
     * Animate the relic rising and then flying to the inventory, then destroy.
     */
    animateToInventory(onComplete?: () => void) {
        this.scene.tweens.add({
            targets: this,
            y: this.y - this.displayHeight,
            duration: 1000,
            onComplete: () => {
                this.addToInventoryTween = this.scene.tweens.add({
                    targets: this,
                    x: { value: () => this.scene.cameras.main.scrollX + this.scene.scale.width, ease: 'Quad.easeIn' },
                    y: { value: () => this.scene.cameras.main.scrollY + this.scene.scale.height, ease: 'Back.easeIn' },
                    scale: { value: 1, ease: 'Quad.easeIn' },
                    duration: 1500,
                    onComplete: () => {
                        this.destroy();
                        if (onComplete) {
                            onComplete();
                        }
                    }
                });
            }
        });
    }

    update() {
        if (this.addToInventoryTween && this.addToInventoryTween.isPlaying()) {
            this.addToInventoryTween.updateTo('x', this.scene.cameras.main.scrollX + this.scene.scale.width);
            this.addToInventoryTween.updateTo('y', this.scene.cameras.main.scrollY + this.scene.scale.height);
        }
    }
}