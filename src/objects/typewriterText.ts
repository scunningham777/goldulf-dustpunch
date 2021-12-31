import { TYPEWRITER_WORD_INTERVAL } from "../constants";

const DIVIDER = '';

export class TypewriterText {
    private words: string[];
    private printIndex = 0;
    private printIntervalId: number;
    private textObject: Phaser.GameObjects.Text;
    private completedCallback: Function | null;

    constructor (private baseText: string, private scene: Phaser.Scene, yPosition: number, wordInterval: number = TYPEWRITER_WORD_INTERVAL, completedCallback?: Function, completedCallbackContext?: any) {
        this.words = this.baseText.split(DIVIDER);
        this.completedCallback = completedCallback.bind(completedCallbackContext);

        this.textObject = this.scene.add.text(
            this.scene.cameras.main.displayWidth / 2,
            yPosition,
            this.words[this.printIndex++],
            {font: `32px '7_12'`, color: '#fff', align: 'center', wordWrap: {width: this.scene.cameras.main.displayWidth * .85}}
        );
        this.textObject.setOrigin(.5, 0);

        this.printIntervalId = window.setInterval(() => {
            this.textObject.setText(this.words.slice(0, this.printIndex + 1).join(DIVIDER));
            if (this.words[this.printIndex].match(/\w/)) {
                this.scene.sound.play('type', {volume: .4});
            }

            this.printIndex += 1;
            if (this.printIndex >= this.words.length) {
                this.finish();
            }
        }, wordInterval)

        this.scene.input.keyboard.on('keydown', this.shortCircuit, this);
        this.scene.input.on('pointerdown', this.shortCircuit, this);
        this.scene.input.gamepad.on('down', this.shortCircuit, this);
    }

    shortCircuit() {
        this.textObject.setText(this.words.join(DIVIDER));
        this.finish();
    }

    finish() {
        window.clearInterval(this.printIntervalId);
        this.scene.input.keyboard.off('keydown', this.shortCircuit);
        this.scene.input.off('pointerdown', this.shortCircuit);
        this.scene.input.gamepad.off('down', this.shortCircuit);
        if (!!this.completedCallback) {
            this.completedCallback();
        }
    }

}