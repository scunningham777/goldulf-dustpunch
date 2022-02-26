import { ModalMenuConfig } from "../interfaces/modalMenuConfig";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import { GAME_SCALE } from "../constants";

export class ModalMenu {
    private bg: RoundRectangle;
    private visible = true;

    constructor(
        private scene: Phaser.Scene,
        private config: ModalMenuConfig
    ) {
        this.bg = new RoundRectangle(scene, config.x, config.y, config.width, config.height, 4 * GAME_SCALE, 0x000000);
        this.bg.setOrigin(.5, 0)
                .setStrokeStyle(GAME_SCALE, 0xffffff);
        scene.add.existing(this.bg);
    }

    public toggleVisibility(visible?: boolean) {
        if (visible != undefined) {
            this.bg.setVisible(visible);
        } else {
            this.bg.setVisible(!this.bg.visible);
        }
    }
}