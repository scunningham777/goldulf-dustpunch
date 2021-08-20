import { STUFF_CONFIGS } from "../config";
import { INVENTORY_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, GAME_SCALE, WORLD_WIDTH, WORLD_HEIGHT, SHOW_MENU_REGISTRY_KEY, STATIC_TEXTURE_KEY, STUFF_TINT, HERO_TINT } from "../constants";
import Stuff from "../objects/stuff";
import StuffInInventory from "../objects/stuffInInventory";

const VIRTUAL_JOYSTICK_DIAMETER = 16;

export class UIScene extends Phaser.Scene {
    private pointsText: Phaser.GameObjects.Text;
    private virtualJoystick: Phaser.GameObjects.Ellipse;
    private menuLayer: Phaser.GameObjects.Layer;
    private menuBackground: Phaser.GameObjects.Rectangle;
    private menuStuffDisplayGroup: Phaser.GameObjects.Group;

    preload(): void {
    }

    create(): void {
        const gamePoints = this.registry.values[INVENTORY_REGISTRY_KEY] ?? 0;
        
        this.pointsText = this.add.text(20, 16, 'Points: ' + gamePoints, {font: `32px '7_12'`, color: '#fff'});

        this.virtualJoystick = this.add.ellipse(10, 50, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, 0x000000, 1);
        this.hideVirtualJoystick();

        this.menuLayer = this.generateMenu();
        this.menuStuffDisplayGroup = this.add.group()
        
        // maybe a hack to clean up duplicate listeners - shouldn't be necessary after fixing issue #26, but leave in case
        this.registry.events.off('changedata', this.updateUI, this);
        this.registry.events.on('changedata', this.updateUI, this);
    }

    generateMenu(): Phaser.GameObjects.Layer {
        const menuBGWidth = ((WORLD_WIDTH >= 768) ? 320 : WORLD_WIDTH);
        this.menuBackground = this.add.rectangle(WORLD_WIDTH - menuBGWidth, 0, menuBGWidth, WORLD_HEIGHT, 0x000000);
        this.menuBackground.setOrigin(0,0);

        const stuffHeaderText = this.add.text(20, 16, 'Your Stuff: ', {font: `32px '7_12'`, color: `#fff`});

        const menuLayer = this.add.layer([this.menuBackground, stuffHeaderText]);
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
            this.updateMenuStuff(data);
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
            doShow = !this.menuLayer.visible;
        }
        this.menuLayer.setVisible(doShow);
    }

    updateMenuStuff(currentStuff: StuffInInventory[]) {
        this.menuStuffDisplayGroup.clear(true, true);
        currentStuff.forEach((stuff, index) => {
            const x = this.pointsText.x + (16 * index * GAME_SCALE);
            const y = this.pointsText.y + this.pointsText.height + 8 * GAME_SCALE;
            const stuffType = STUFF_CONFIGS.find(sC => sC.stuffName === stuff.stuffConfigId)
            const stuffImg = this.add.image(x, y, STATIC_TEXTURE_KEY, stuffType.frameIndex).setScale(GAME_SCALE).setTint(STUFF_TINT).setOrigin(0, 0);
            const stuffQtyText = this.add.text(stuffImg.x + stuffImg.displayWidth - 2 * GAME_SCALE, stuffImg.y + stuffImg.displayHeight - 2 * GAME_SCALE, 'x' + stuff.quantity, {font: `${8 * GAME_SCALE}px '7_12'`, color: '#' + HERO_TINT.toString(16)});
            // const stuffQtyText = this.add.text(stuffImg.x + stuffImg.displayWidth - 2 * GAME_SCALE, stuffImg.y + stuffImg.displayHeight - 2 * GAME_SCALE, 'x' + stuff.quantity, {font: `22px '7_12'`, color: '#D99E18'});
            stuffQtyText.setOrigin(.5, .5);
            this.menuStuffDisplayGroup.add(stuffImg);
            this.menuStuffDisplayGroup.add(stuffQtyText);
            this.menuLayer.add(stuffImg);
            this.menuLayer.add(stuffQtyText);
        })
    }
}