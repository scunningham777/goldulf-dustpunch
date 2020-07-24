import { POINTS_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, GAME_SCALE } from "../constants";

const VIRTUAL_JOYSTICK_DIAMETER = 16;

export class UIScene extends Phaser.Scene {
    private pointsText: Phaser.GameObjects.Text;
    private virtualJoystick: Phaser.GameObjects.Ellipse;

    preload(): void {
    }

    create(): void {
        const gamePoints = this.registry.values[POINTS_REGISTRY_KEY] ?? 0;
        
        this.pointsText = this.add.text(20, 16, 'Points: ' + gamePoints, {font: `32px '7_12'`, fill: '#fff'});
        this.virtualJoystick = this.add.ellipse(10, 50, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, 0x000000, 1);
        this.hideVirtualJoystick();
        
        // maybe a hack to clean up duplicate listeners - shouldn't be necessary after fixing issue #26, but leave in case
        this.registry.events.off('changedata', this.updatePoints, this);
        this.registry.events.on('changedata', this.updatePoints, this);
    }

    updatePoints(_parent: any, key: string, data: any) {
        if (key === POINTS_REGISTRY_KEY) {
            this.pointsText.setText('Points: ' + data);
        } else if (key === TOUCH_MOVEMENT_REGISTRY_KEY) {
            if (data != null) {
                this.showVirtualJoystick(data);
            } else {
                this.hideVirtualJoystick();
            }
        }
    }

    showVirtualJoystick(data: {startX: number, startY: number}) {
        this.virtualJoystick
            .setX(data.startX)
            .setY(data.startY)
            .setAlpha(.4)
            ;
    }

    hideVirtualJoystick() {
        this.virtualJoystick.setAlpha(0);
    }
}