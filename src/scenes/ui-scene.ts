import { POINTS_REGISTRY_KEY } from "../constants";

export class UIScene extends Phaser.Scene {
    private pointsText: Phaser.GameObjects.Text;

    preload(): void {
    }

    create(): void {
        const gamePoints = this.registry.values[POINTS_REGISTRY_KEY] ?? 0;
        
        this.pointsText = this.add.text(20, 16, 'Points: ' + gamePoints, {font: '32px Arial', fill: '#fff'});
        
        // maybe a hack to clean up duplicate listeners
        this.registry.events.off('changedata', this.updatePoints, this);
        this.registry.events.on('changedata', this.updatePoints, this);
    }

    updatePoints(_parent: any, key: string, data: any) {
        if (key === POINTS_REGISTRY_KEY) {
            this.pointsText.setText('Points: ' + data);
        }
    }
}