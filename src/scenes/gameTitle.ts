import { UI_SCENE_KEY, SITE_TYPES, HERO_TEXTURE_KEY } from "../constants";

const TITLE_PORTION = .25;
const TITLE_TEXT_PORTION = .08;
const SUBTITLE_Y_OFFSET = .04;
const SUBTITLE_TEXT_PORTION = .12;
const LOGO_Y_OFFSET = .04;
const LOGO_PORTION = .3;
const INSTRUCTION_PORTION = .15;
const INSTRUCTION_TEXT_POTION = .04;
const TITLE_DELAY = 200;
const DUSTPUNCH_DELAY = 500;
const INSTRUCTION_DELAY = 1000;
const INSTRUCTION_SHOW_PERIOD = 900;
const INSTRUCTION_BLINK_PERIOD = 500;

export class GameTitleScene extends Phaser.Scene {
    private titleText: Phaser.GameObjects.Text;
    private subtitleText: Phaser.GameObjects.Text;
    private dustpunchLogo: Phaser.GameObjects.Image;
    private instructionText: Phaser.GameObjects.Text;

    create(): void {
        this.time.delayedCall(TITLE_DELAY, () => {
            this.titleText = this.add.text(
                this.scale.width / 2,
                this.scale.height * TITLE_PORTION,
                'Goldulf:',
                {font: `${this.scale.height * TITLE_TEXT_PORTION}px '7_12'`, color: '#fff'}
            );
            this.titleText.setOrigin(0.5, 1);
        }, [], this);
        
        this.time.delayedCall(TITLE_DELAY + DUSTPUNCH_DELAY, () => {
            let subtitleFontSize = this.scale.height * SUBTITLE_TEXT_PORTION;
            this.subtitleText = this.add.text(
                this.scale.width / 2,
                this.scale.height * (TITLE_PORTION + SUBTITLE_Y_OFFSET),
                'DUSTPUNCH',
                {font: `${subtitleFontSize}px '7_12'`,
                color: '#fff'}
            );
            this.subtitleText.setOrigin(0.5, 0);
            while (this.subtitleText.displayWidth > this.scale.width - 16) {
                subtitleFontSize -= 1;
                this.subtitleText.setFontSize(subtitleFontSize);
            }

            this.dustpunchLogo = this.add.image(
                this.scale.width / 2,
                this.scale.height * (TITLE_PORTION + SUBTITLE_Y_OFFSET + SUBTITLE_TEXT_PORTION + LOGO_Y_OFFSET),
                HERO_TEXTURE_KEY,
                9
            ).setOrigin(0.5, 0);
            const logoScale = (this.scale.height * LOGO_PORTION) / this.dustpunchLogo.height;
            this.dustpunchLogo.setScale(logoScale);
        }, [], this);
        
        this.time.delayedCall(TITLE_DELAY + DUSTPUNCH_DELAY + INSTRUCTION_DELAY, () => {
            this.instructionText = this.add.text(
                this.scale.width / 2,
                this.scale.height * (1 - INSTRUCTION_PORTION),
                'Tap or press any key to begin',
                {font: `${this.scale.height * INSTRUCTION_TEXT_POTION}px '7_12'`, color: '#fff', align: 'center', wordWrap: {width: this.scale.width - 16}},
            )
            .setOrigin(0.5, 0);

            this.input.keyboard.on('keydown', this.startGame, this);
            this.input.on('pointerdown', this.startGame, this);

            // blink
            this.time.delayedCall(INSTRUCTION_SHOW_PERIOD, this.hideInstructions, [], this);
        }, [], this)

        this.scale.on('orientationchange', this.recenterContents, this);
    }

    showInstructions() {
        if (this.instructionText != null) {
            this.instructionText.alpha = 1;
        }
        this.time.delayedCall(INSTRUCTION_SHOW_PERIOD, this.hideInstructions, [], this);
    }

    hideInstructions() {
        if (this.instructionText != null) {
            this.instructionText.alpha = 0;
        }
        this.time.delayedCall(INSTRUCTION_BLINK_PERIOD, this.showInstructions, [], this);
    }

    private recenterContents() {
        if (!!this.titleText) {
            this.titleText.setX(this.scale.width / 2);
            this.titleText.setY(this.scale.height * TITLE_PORTION);
        }
        if (!!this.subtitleText) {
            this.subtitleText.setX(this.scale.width / 2);
            this.subtitleText.setY(this.scale.height * (TITLE_PORTION + SUBTITLE_Y_OFFSET));
        }
        if (!!this.dustpunchLogo) {
            this.dustpunchLogo.setX(this.scale.width / 2);
            this.dustpunchLogo.setY(this.scale.height * (TITLE_PORTION + SUBTITLE_Y_OFFSET + SUBTITLE_TEXT_PORTION + LOGO_Y_OFFSET));
        }
        if (!!this.instructionText) {
            this.instructionText.setX(this.scale.width / 2);
            this.instructionText.setY(this.scale.height * (1 - INSTRUCTION_PORTION));
        }
    }
    
    startGame() {
        this.scene.launch(UI_SCENE_KEY);

        const initialMapSceneConfig = {
            mapConfigName: 'new_game',
            // mapConfigName: 'cave_small',
            mapConfigCategory: null,
        };
        this.cleanup();
        
        this.scene.start(SITE_TYPES.overworld, initialMapSceneConfig);
        // this.scene.start(SITE_TYPES.site, initialMapSceneConfig);
    }
    
    cleanup(): void {
        this.scale.off('orientationchange');
        this.input.off('pointerdown');
        this.input.keyboard.off('keydown');
    }
}