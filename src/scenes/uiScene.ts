import { STUFF_CONFIGS } from "../config";
import { INVENTORY_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, GAME_SCALE, WORLD_WIDTH, WORLD_HEIGHT, SHOW_MENU_REGISTRY_KEY } from "../constants";
import StuffInInventory from "../objects/stuffInInventory";

const VIRTUAL_JOYSTICK_DIAMETER = 16;

export class UIScene extends Phaser.Scene {
    private pointsText: Phaser.GameObjects.Text;
    private virtualJoystick: Phaser.GameObjects.Ellipse;
    private menu: Phaser.GameObjects.Layer;

    preload(): void {
    }

    create(): void {
        const gamePoints = this.registry.values[INVENTORY_REGISTRY_KEY] ?? 0;
        
        this.pointsText = this.add.text(20, 16, 'Points: ' + gamePoints, {font: `32px '7_12'`, color: '#fff'});

        this.virtualJoystick = this.add.ellipse(10, 50, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, 0x000000, 1);
        this.hideVirtualJoystick();

        this.menu = this.generateMenu();
        
        // maybe a hack to clean up duplicate listeners - shouldn't be necessary after fixing issue #26, but leave in case
        this.registry.events.off('changedata', this.updateUI, this);
        this.registry.events.on('changedata', this.updateUI, this);
    }

    generateMenu(): Phaser.GameObjects.Layer {
        const menuBGWidth = (WORLD_WIDTH >= 768) ? 320 : WORLD_WIDTH;
        const menuBG = this.add.rectangle(WORLD_WIDTH - menuBGWidth, 0, menuBGWidth, WORLD_HEIGHT, 0x000000);
        menuBG.setOrigin(0,0);

        const menuLayer = this.add.layer(menuBG);
        menuLayer.setVisible(false);
        
        return menuLayer;
    }

    updateUI(_parent: any, key: string, data: any) {
        if (key === INVENTORY_REGISTRY_KEY) {
            const totalPoints =  (data as StuffInInventory[]).reduce((points: number, s) => {
                const stuffConfig = STUFF_CONFIGS.find(sC => sC.stuffName === s.stuffConfigId);
                if (stuffConfig === undefined) {
                    return points;
                }
                return (points + (stuffConfig.points * s.quantity)); 
            }, 0)
            this.pointsText.setText('Points: ' + totalPoints);
        } else if (key === TOUCH_MOVEMENT_REGISTRY_KEY) {
            if (data != null) {
                this.showVirtualJoystick(data);
            } else {
                this.hideVirtualJoystick();
            }
        } else if (key === SHOW_MENU_REGISTRY_KEY) {
            this.showInventory(data);
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

    showInventory(doShow: boolean) {
        if (doShow === null || doShow === undefined) {
            doShow = !this.menu.visible;
        }
        this.menu.setVisible(doShow)
    }
}