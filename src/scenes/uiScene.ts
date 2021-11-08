import { STUFF_CONFIGS } from "../config";
import { INVENTORY_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, GAME_SCALE, SHOW_MENU_REGISTRY_KEY, STATIC_TEXTURE_KEY, STUFF_TINT, HERO_TINT, UI_TEXTURE_KEY } from "../constants";
import StuffInInventory from "../objects/stuffInInventory";

const VIRTUAL_JOYSTICK_DIAMETER = 16;
const MENU_BTN_DIMENSION = 20 * GAME_SCALE;

export class UIScene extends Phaser.Scene {
    private pointsText: Phaser.GameObjects.Text;
    private virtualJoystick: Phaser.GameObjects.Ellipse;
    private menuLayer: Phaser.GameObjects.Layer;
    private menuBackground: Phaser.GameObjects.Rectangle;
    private closeImage: Phaser.GameObjects.Image;
    private menuStuffDisplayGroup: Phaser.GameObjects.Group;
    private menuHeaderText: Phaser.GameObjects.Text;
    private stuffHeaderText: Phaser.GameObjects.Text;
    private menuBtn: Phaser.GameObjects.Rectangle;
    private menuBtnImage: Phaser.GameObjects.Image;
    // private orientationText: Phaser.GameObjects.Text;
    // private checkOrientation: (orientation: Phaser.Scale.Orientation) => void;

    create(): void {
        this.menuBtn = this.add.rectangle(this.scale.width - MENU_BTN_DIMENSION, 0, MENU_BTN_DIMENSION, MENU_BTN_DIMENSION, 0x000000)
            .setOrigin(0,0);
        this.menuBtnImage = this.add.image(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2, UI_TEXTURE_KEY, 0)
            .setScale(GAME_SCALE);
        this.menuBtn.setInteractive();

        this.menuBtn.on('pointerdown', () => {
            this.showInventory(null);
        });

        this.virtualJoystick = this.add.ellipse(10, 50, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, 0x000000, 1);
        this.hideVirtualJoystick();
        
        this.menuLayer = this.generateMenu();
        this.menuStuffDisplayGroup = this.add.group()
        
        // maybe a hack to clean up duplicate listeners - shouldn't be necessary after fixing issue #26, but leave in case
        this.registry.events.off('changedata', this.updateUI, this);
        this.registry.events.on('changedata', this.updateUI, this);

        this.scale.on('resize', () => {
            this.resizeMenu();
        });
    }

    generateMenu(): Phaser.GameObjects.Layer {
        const menuBGWidth = this.calculateMenuBGWidth();
        this.menuBackground = this.add.rectangle(window.innerWidth - menuBGWidth, 0, menuBGWidth, window.innerHeight, 0x000000);
        this.menuBackground.setOrigin(0,0);

        this.menuHeaderText = this.add.text(this.menuBackground.x + this.menuBackground.width / 2, 16, "MENU", {font: `${16 * GAME_SCALE}px '7_12'`, color: '#fff'})
            .setOrigin(.5, 0);

        const gamePoints = this.registry.values[INVENTORY_REGISTRY_KEY] ?? 0;
        this.pointsText = this.add.text(this.menuBackground.x + 20, this.menuHeaderText.y + this.menuHeaderText.displayHeight + 16, 'Points: ' + gamePoints, {font: `32px '7_12'`, color: '#fff'});
    
        this.stuffHeaderText = this.add.text(this.menuBackground.x + 20, this.pointsText.y + this.pointsText.displayHeight + 8, 'Your Stuff: ', {font: `32px '7_12'`, color: `#fff`});
        this.closeImage = this.add.image(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2, UI_TEXTURE_KEY, 1).setScale(GAME_SCALE);

        const menuLayer = this.add.layer([this.menuBackground, this.menuHeaderText, this.pointsText, this.stuffHeaderText, this.closeImage]);
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
            const x = this.stuffHeaderText.x + (16 * index * GAME_SCALE);
            const y = this.stuffHeaderText.y + this.stuffHeaderText.height + 8 * GAME_SCALE;
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

    private resizeMenu() {
        this.menuBtn.setPosition(this.scale.width - MENU_BTN_DIMENSION, 0);
        this.menuBtnImage.setPosition(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2);
        this.closeImage.setPosition(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2);
        const menuBGWidth = this.calculateMenuBGWidth();
        this.menuBackground.setPosition(window.innerWidth - menuBGWidth, 0)
            .setSize(menuBGWidth, window.innerHeight);
        this.menuHeaderText.setPosition(this.menuBackground.x + this.menuBackground.width / 2, 16);
        this.pointsText.setPosition(this.menuBackground.x + 20, this.menuHeaderText.y + this.menuHeaderText.displayHeight + 16)
        this.stuffHeaderText.setPosition(this.menuBackground.x + 20, this.pointsText.y + this.pointsText.displayHeight + 8);
    }

    private calculateMenuBGWidth() {
        return this.game.device.os.iOS ? window.innerWidth : 320;
    }

    private initOrientationCheck() {
        const isIOS = this.game.device.os.iOS;
        if (isIOS) {
            window.addEventListener('resize', this.checkOrientation.bind(this));
        } else {
            this.scale.on('orientationchange', this.checkOrientation, this);
        }
        
        this.checkOrientation(isIOS);
    }

    private checkOrientation(isIOS: boolean): void {
        this.showInventory(isIOS ? window.innerHeight > window.innerWidth : this.scale.orientation === Phaser.Scale.Orientation.PORTRAIT);
    }


}
