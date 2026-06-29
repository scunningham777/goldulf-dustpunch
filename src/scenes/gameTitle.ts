import { GAME_BG_COLOR, HERO_TEXTURE_KEY, INVENTORY_RELICS_REGISTRY_KEY, INVENTORY_STUFF_REGISTRY_KEY, INVENTORY_TOKENS_REGISTRY_KEY, SITE_DATA_REGISTRY_KEY, SITE_TYPES, SKIP_OVERWORLD, UI_SCENE_KEY } from "../constants";
import { SiteGenerationData } from "../interfaces/siteGenerationData";
import { TEXT_TITLE_TUTORIAL_BODY, TEXT_TITLE_TUTORIAL_CALL_TO_ACTION } from "../text";

const TITLE_PORTION = .25;
const TITLE_TEXT_PORTION = .08;
const SUBTITLE_Y_OFFSET = .04;
const SUBTITLE_TEXT_PORTION = .12;
const LOGO_Y_OFFSET = .04;
const LOGO_PORTION = .3;
const INSTRUCTION_PORTION = .12;
const INSTRUCTION_TEXT_PORTION = .04;
const TUTORIAL_TEXT_PORTION = .04;
const TITLE_DELAY = 200;
const DUSTPUNCH_DELAY = 500;
const INSTRUCTION_DELAY = 1000;
const TUTORIAL_DELAY = 2000;

const SELECTED_COLOR = '#ffffff';
const UNSELECTED_COLOR = '#888888';

export class GameTitleScene extends Phaser.Scene {
    private titleText: Phaser.GameObjects.Text;
    private subtitleText: Phaser.GameObjects.Text;
    private dustpunchLogo: Phaser.GameObjects.Image;
    private continueButton: Phaser.GameObjects.Text;
    private newGameButton: Phaser.GameObjects.Text;
    private tutorialText: Phaser.GameObjects.Text;
    private tutorialCTAText: Phaser.GameObjects.Text;
    private selectedOption: number = 0;
    private hasSaveData: boolean = false;

    create(): void {
        this.time.delayedCall(TITLE_DELAY, () => {
            this.titleText = this.add.text(
                this.scale.width / 2,
                this.scale.height * TITLE_PORTION,
                'Goldulf:',
                {font: `${this.scale.height * TITLE_TEXT_PORTION}px '7_12'`, color: '#fff'}
            );
            this.titleText.setOrigin(0.5, 1);
            this.sound.play('punch1');
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

            this.sound.play('punch1');
        }, [], this);

        this.time.delayedCall(TITLE_DELAY + DUSTPUNCH_DELAY + INSTRUCTION_DELAY, () => {
            const inventoryStuff = this.registry.get(INVENTORY_STUFF_REGISTRY_KEY) as any[];
            this.hasSaveData = !!(inventoryStuff?.length);

            this.add.rectangle(
                this.scale.width / 2,
                this.scale.height * (1 - INSTRUCTION_PORTION - INSTRUCTION_TEXT_PORTION),
                this.scale.width,
                this.scale.height * (INSTRUCTION_PORTION + INSTRUCTION_TEXT_PORTION),
                GAME_BG_COLOR,
            )
            .setOrigin(.5, 0)
            .setScrollFactor(0)
            .setDepth(1);

            const buttonFontSize = this.scale.height * INSTRUCTION_TEXT_PORTION;
            const buttonStyle = (color: string) => ({
                font: `${buttonFontSize}px '7_12'`,
                color,
                align: 'center',
                wordWrap: {width: this.scale.width - 16},
            });

            if (this.hasSaveData) {
                this.selectedOption = 0;

                this.continueButton = this.add.text(
                    this.scale.width / 2,
                    this.scale.height * (1 - INSTRUCTION_PORTION),
                    '> Continue',
                    buttonStyle(SELECTED_COLOR),
                )
                .setOrigin(0.5, 0)
                .setScrollFactor(0)
                .setDepth(2);

                this.newGameButton = this.add.text(
                    this.scale.width / 2,
                    this.scale.height * (1 - INSTRUCTION_PORTION) + buttonFontSize * 1.6,
                    '  New Game',
                    buttonStyle(UNSELECTED_COLOR),
                )
                .setOrigin(0.5, 0)
                .setScrollFactor(0)
                .setDepth(2);
            } else {
                this.selectedOption = 0;

                this.newGameButton = this.add.text(
                    this.scale.width / 2,
                    this.scale.height * (1 - INSTRUCTION_PORTION),
                    '> New Game',
                    buttonStyle(SELECTED_COLOR),
                )
                .setOrigin(0.5, 0)
                .setScrollFactor(0)
                .setDepth(2);
            }

            this.sound.play('punch2', {rate: 1});

            this.input.keyboard.on('keydown', this.handleKeydown, this);
            this.input.on('pointerdown', this.executeSelectedOption, this);
            this.input.gamepad.on('down', this.executeSelectedOption, this);
            this.sound.play('yesterpunch', {loop: true});
        }, [], this)

        this.time.delayedCall(TITLE_DELAY + DUSTPUNCH_DELAY + INSTRUCTION_DELAY + TUTORIAL_DELAY, () => {
            const tutorialTextStyle = {font: `${this.scale.height * TUTORIAL_TEXT_PORTION}px '7_12'`, color: '#fff', align: 'justify', wordWrap: {width: this.scale.width * .85}, padding: {bottom: this.scale.height * TUTORIAL_TEXT_PORTION / 2}};
            this.tutorialText = this.add.text(
                this.scale.width / 2,
                this.scale.height,
                TEXT_TITLE_TUTORIAL_BODY,
                tutorialTextStyle,
            )
            .setOrigin(.5, 0)
            .setLineSpacing(this.scale.height * TUTORIAL_TEXT_PORTION / 2);

            this.tutorialCTAText = this.add.text(
                this.scale.width / 2,
                this.scale.height + this.tutorialText.height,
                TEXT_TITLE_TUTORIAL_CALL_TO_ACTION,
                {...tutorialTextStyle, align: 'center'},
            )
            .setOrigin(.5, 0)
            .setLineSpacing(this.scale.height * TUTORIAL_TEXT_PORTION / 2);

            const panDuration = 1000 * ((this.tutorialText.displayHeight + this.tutorialCTAText.displayHeight) / (this.scale.height * TUTORIAL_TEXT_PORTION * 1.5))
            this.cameras.main.pan(this.scale.width / 2, this.scale.height * (.6 + INSTRUCTION_PORTION) + this.tutorialText.displayHeight + this.tutorialCTAText.displayHeight, panDuration);
        })

        this.scale.on('orientationchange', this.recenterContents, this);
    }

    private handleKeydown(event: KeyboardEvent) {
        if (this.hasSaveData && (event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
            this.selectedOption = this.selectedOption === 0 ? 1 : 0;
            this.updateButtonVisuals();
            return;
        }
        this.executeSelectedOption();
    }

    private updateButtonVisuals() {
        if (this.selectedOption === 0) {
            this.continueButton.setText('> Continue').setColor(SELECTED_COLOR);
            this.newGameButton.setText('  New Game').setColor(UNSELECTED_COLOR);
        } else {
            this.continueButton.setText('  Continue').setColor(UNSELECTED_COLOR);
            this.newGameButton.setText('> New Game').setColor(SELECTED_COLOR);
        }
    }

    private executeSelectedOption() {
        if (this.hasSaveData && this.selectedOption === 1) {
            this.startNewGame();
        } else if (this.hasSaveData) {
            this.continueGame();
        } else {
            this.startNewGame();
        }
    }

    private continueGame() {
        this.scene.launch(UI_SCENE_KEY);
        const savedSiteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
        const sceneKey = savedSiteData?.siteType ?? (SKIP_OVERWORLD ? SITE_TYPES.site : SITE_TYPES.overworld);
        const mapConfigName = savedSiteData?.siteConfigName ?? (SKIP_OVERWORLD ? 'temple' : 'new_game');
        this.cleanup();
        this.scene.start(sceneKey, {mapConfigName});
    }

    private startNewGame() {
        this.registry.set(INVENTORY_STUFF_REGISTRY_KEY, []);
        this.registry.set(INVENTORY_TOKENS_REGISTRY_KEY, []);
        this.registry.set(INVENTORY_RELICS_REGISTRY_KEY, []);
        this.registry.set(SITE_DATA_REGISTRY_KEY, null);

        this.scene.launch(UI_SCENE_KEY);
        const initialMapSceneConfig = {
            mapConfigName: SKIP_OVERWORLD ? 'temple' : 'new_game',
        };
        this.cleanup();
        this.scene.start(SKIP_OVERWORLD ? SITE_TYPES.site : SITE_TYPES.overworld, initialMapSceneConfig);
    }

    startGame() {
        this.startNewGame();
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
        if (!!this.continueButton) {
            this.continueButton.setX(this.scale.width / 2);
            this.continueButton.setY(this.scale.height * (1 - INSTRUCTION_PORTION));
        }
        if (!!this.newGameButton) {
            this.newGameButton.setX(this.scale.width / 2);
            const buttonFontSize = this.scale.height * INSTRUCTION_TEXT_PORTION;
            this.newGameButton.setY(
                this.hasSaveData
                    ? this.scale.height * (1 - INSTRUCTION_PORTION) + buttonFontSize * 1.6
                    : this.scale.height * (1 - INSTRUCTION_PORTION)
            );
        }
    }

    cleanup(): void {
        this.scale.off('orientationchange');
        this.input.off('pointerdown');
        this.input.keyboard.off('keydown');
        this.input.gamepad.off('down');
        this.sound.getAll('yesterpunch').forEach(s => s.stop());
    }
}
