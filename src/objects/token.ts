import { GAME_SCALE } from "../constants";
import { TokenConfig } from "../interfaces/tokenConfig";

export class Token extends Phaser.GameObjects.Image {
    private addToInventoryTween: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string, tokenConfig: TokenConfig) {
        super(scene, x, y, textureKey, tokenConfig.frameIndex);

        this.setScale(GAME_SCALE);
        this.setTint(tokenConfig.tint);
        this.scene.add.existing(this);

        const timeline = this.scene.tweens.createTimeline();

        timeline.add({
            targets: this,
            y: y - this.displayHeight,
            duration: 1000,
        });

        this.addToInventoryTween = this.scene.tweens.create({
            targets: this,
            x: {value: () => this.scene.cameras.main.scrollX + this.scene.scale.width, ease: 'Quad.easeIn'},
            y: {value: () => this.scene.cameras.main.scrollY + this.scene.scale.height, ease: 'Back.easeIn'},
            scale: {value: 1, ease: 'Quad.easeIn'},
            duration: 1500,
            onComplete: () => {
                this.destroy();
            }
        })
        timeline.queue(this.addToInventoryTween);

        timeline.play();
    }

    update() {
        if (this.addToInventoryTween.isPlaying()) {
            this.addToInventoryTween.updateTo('x', this.scene.cameras.main.scrollX + this.scene.scale.width)
            this.addToInventoryTween.updateTo('y', this.scene.cameras.main.scrollY + this.scene.scale.height)
        }
    }
}