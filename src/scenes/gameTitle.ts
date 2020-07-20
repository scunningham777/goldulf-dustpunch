const TITLE_Y_OFFSET = 128;
const SUBTITLE_Y_OFFSET = 96;

export class GameTitleScene extends Phaser.Scene {
    private titleText: Phaser.GameObjects.Text;
    private subtitleText: Phaser.GameObjects.Text;
    private instructionText: Phaser.GameObjects.Text;

    create(): void {
        this.titleText = this.add.text(this.scale.width / 2, TITLE_Y_OFFSET, 'Goldulf:', {font: '64px Arial', fill: '#fff'});
        this.titleText.setOrigin(0.5);
        
        this.time.delayedCall(750, () => {
            this.subtitleText = this.add.text(this.scale.width / 2, TITLE_Y_OFFSET + 32 + SUBTITLE_Y_OFFSET, 'DUSTPUNCH', {font: '80px Arial', fill: '#fff'});
            this.subtitleText.setOrigin(0.5);
        }, [], this);
        
        this.instructionText = this.add.text(this.scale.width / 2, this.scale.height - 128, 'Tap or press any key to begin', {font: '32px Arial', fill: '#fff'});
        this.instructionText.setOrigin(0.5);

        this.input.keyboard.on('keydown', this.startGame, this);
        this.input.on('pointerdown', this.startGame, this);
    }
    
    startGame() {
        this.scene.start('Overworld', { mapConfigName: 'new_game' });
    }
}