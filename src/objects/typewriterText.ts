import { TYPEWRITER_WORD_INTERVAL } from "../constants";

const DIVIDER = '';

export class TypewriterText {
    private words: string[];
    private printIndex = 0;
    private printIntervalId: number;
    private textObject: Phaser.GameObjects.Text;

    constructor (private baseText: string, private scene: Phaser.Scene, yPosition: number, wordInterval: number = TYPEWRITER_WORD_INTERVAL, completeCallback?: Function, completeCallbackContext?: any) {
        this.words = this.baseText.split(DIVIDER);


        this.textObject = this.scene.add.text(
            this.scene.cameras.main.displayWidth / 2,
            yPosition,
            this.words[this.printIndex++],
            {font: `32px '7_12'`, color: '#fff', align: 'center', wordWrap: {width: this.scene.cameras.main.displayWidth * .85}}
        );
        this.textObject.setOrigin(.5, 0);

        this.printIntervalId = window.setInterval(() => {
            this.textObject.setText(this.words.slice(0, this.printIndex + 1).join(DIVIDER));

            this.printIndex += 1;
            if (this.printIndex >= this.words.length) {
                window.clearInterval(this.printIntervalId);
                if (!!completeCallback) {
                    completeCallback.apply(completeCallbackContext);
                }
            }
        }, wordInterval)
    }

}