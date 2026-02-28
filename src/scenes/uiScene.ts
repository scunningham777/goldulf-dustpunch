import { STUFF_CONFIGS, TOKEN_CONFIGS, RELIC_CONFIGS } from "../config";
import { INVENTORY_STUFF_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, GAME_SCALE, SHOW_MENU_REGISTRY_KEY, STATIC_TEXTURE_KEY, STUFF_TINT, HERO_TINT, UI_TEXTURE_KEY, INVENTORY_TOKENS_REGISTRY_KEY, INVENTORY_RELICS_REGISTRY_KEY } from "../constants";
import { InventoryItem } from "../interfaces/stuffInInventory";
import { TEXT_INVENTORY_TITLE_TEXT as TEXT_INVENTORY_HEADER_TEXT } from "../text";

const VIRTUAL_JOYSTICK_DIAMETER = 16;
const MENU_BTN_DIMENSION = 20 * GAME_SCALE;

export class UIScene extends Phaser.Scene {
    private pointsText: Phaser.GameObjects.Text;
    private virtualJoystick: Phaser.GameObjects.Ellipse;
    private menuLayer: Phaser.GameObjects.Layer;
    private menuBackground: Phaser.GameObjects.Rectangle;
    private closeImage: Phaser.GameObjects.Image;
    private menuStuffDisplayGroup: Phaser.GameObjects.Group;
    private menuTokensDisplayGroup: Phaser.GameObjects.Group;
    private menuRelicsDisplayGroup: Phaser.GameObjects.Group;
    private menuHeaderText: Phaser.GameObjects.Text;
    private stuffHeaderText: Phaser.GameObjects.Text;
    private tokensHeaderText: Phaser.GameObjects.Text;
    private relicsHeaderText: Phaser.GameObjects.Text;
    private menuBtn: Phaser.GameObjects.Rectangle;
    private menuBtnImage: Phaser.GameObjects.Image;

    create(): void {
        this.menuBtn = this.add.rectangle(this.scale.width - MENU_BTN_DIMENSION, this.scale.height - MENU_BTN_DIMENSION, MENU_BTN_DIMENSION, MENU_BTN_DIMENSION, 0x000000)
            .setOrigin(0,0);
        this.menuBtnImage = this.add.image(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2, UI_TEXTURE_KEY, 0)
            .setScale(GAME_SCALE);
        this.menuBtn.setInteractive();

        this.menuBtn.on('pointerdown', () => {
            this.registry.set(SHOW_MENU_REGISTRY_KEY, !this.registry.get(SHOW_MENU_REGISTRY_KEY));
        });

        this.virtualJoystick = this.add.ellipse(10, 50, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, 0x000000, 1);
        this.hideVirtualJoystick();
        
        this.menuLayer = this.generateMenu();
        this.menuStuffDisplayGroup = this.add.group()
        this.menuTokensDisplayGroup = this.add.group()
        this.menuRelicsDisplayGroup = this.add.group()
        this.updateUI(null, INVENTORY_STUFF_REGISTRY_KEY, this.registry.values[INVENTORY_STUFF_REGISTRY_KEY]);
        this.updateUI(null, INVENTORY_TOKENS_REGISTRY_KEY, this.registry.values[INVENTORY_TOKENS_REGISTRY_KEY]);
        this.updateUI(null, INVENTORY_RELICS_REGISTRY_KEY, this.registry.values[INVENTORY_RELICS_REGISTRY_KEY]);
        
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

        this.menuHeaderText = this.add.text(this.menuBackground.x + this.menuBackground.width / 2, 16, TEXT_INVENTORY_HEADER_TEXT, {font: `${16 * GAME_SCALE}px '7_12'`, color: '#fff'})
            .setOrigin(.5, 0);

        const menuBodyOffsetX = menuBGWidth * .06;
        this.pointsText = this.add.text(menuBodyOffsetX, this.menuHeaderText.y + this.menuHeaderText.displayHeight + 16, 'Points: 0', {font: `32px '7_12'`, color: '#fff'});
    
        this.stuffHeaderText = this.add.text(menuBodyOffsetX, this.pointsText.y + this.pointsText.displayHeight + 8, 'Your Stuff: ', {font: `32px '7_12'`, color: `#fff`});
        this.tokensHeaderText = this.add.text(menuBodyOffsetX, this.stuffHeaderText.y + this.stuffHeaderText.displayHeight + 36 * GAME_SCALE, 'Your Tokens: ', {font: `32px '7_12'`, color: `#fff`});
        this.relicsHeaderText = this.add.text(menuBodyOffsetX, this.tokensHeaderText.y + this.tokensHeaderText.displayHeight + 36 * GAME_SCALE, 'Your Relics: ', {font: `32px '7_12'`, color: `#fff`});
        this.closeImage = this.add.image(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2, UI_TEXTURE_KEY, 1).setScale(GAME_SCALE);

        const menuLayer = this.add.layer([this.menuBackground, this.menuHeaderText, this.pointsText, this.stuffHeaderText, this.tokensHeaderText, this.closeImage, this.relicsHeaderText]);
        menuLayer.setVisible(false);

        return menuLayer;
    }

    updateUI(_parent: any, key: string, data: any) {
        if (key === INVENTORY_STUFF_REGISTRY_KEY) {
            const totalPoints =  (data as InventoryItem[]).reduce((points: number, s) => {
                const stuffConfig = STUFF_CONFIGS.find(sC => sC.stuffName === s.inventoryItemKey);
                if (stuffConfig === undefined) {
                    return points;
                }
                return (points + (stuffConfig.points * s.quantity)); 
            }, 0)
            this.pointsText.setText('Points: ' + totalPoints);
            this.updateMenuStuff(data);
        } else if (key === INVENTORY_TOKENS_REGISTRY_KEY) {
            this.updateMenuTokens(data);
        } else if (key === INVENTORY_RELICS_REGISTRY_KEY) {
            this.updateMenuRelics(data);
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

    updateMenuStuff(currentStuff: InventoryItem[]) {
        this.menuStuffDisplayGroup.clear(true, true);
        currentStuff.forEach((stuff, index) => {
            const x = this.stuffHeaderText.x + (24 * index * GAME_SCALE);
            const y = this.stuffHeaderText.y + this.stuffHeaderText.height + 4 * GAME_SCALE;
            const stuffType = STUFF_CONFIGS.find(sC => sC.stuffName === stuff.inventoryItemKey)
            const stuffImg = this.add.image(x, y, STATIC_TEXTURE_KEY, stuffType.frameIndex).setScale(GAME_SCALE).setTint(STUFF_TINT).setOrigin(0, 0);
            const stuffQtyText = this.add.text(stuffImg.x, stuffImg.y + stuffImg.displayHeight, 'x' + stuff.quantity, {font: `${8 * GAME_SCALE}px '7_12'`, color: '#' + HERO_TINT.toString(16)});
            this.menuStuffDisplayGroup.add(stuffImg);
            this.menuStuffDisplayGroup.add(stuffQtyText);
            this.menuLayer.add(stuffImg);
            this.menuLayer.add(stuffQtyText);
        })
    }

    updateMenuTokens(currentTokens: InventoryItem[]) {
        this.menuTokensDisplayGroup.clear(true, true);
        currentTokens.forEach((token, index) => {
            const x = this.tokensHeaderText.x + (24 * index * GAME_SCALE);
            const y = this.tokensHeaderText.y + this.tokensHeaderText.height + 4 * GAME_SCALE;
            const tokenType = TOKEN_CONFIGS.find(tC => tC.key === token.inventoryItemKey)
            const tokenImg = this.add.image(x, y, STATIC_TEXTURE_KEY, tokenType.frameIndex).setScale(GAME_SCALE).setTint(tokenType.tint).setOrigin(0, 0);
            const tokenQtyText = this.add.text(tokenImg.x, tokenImg.y + tokenImg.displayHeight, 'x' + token.quantity, {font: `${8 * GAME_SCALE}px '7_12'`, color: '#' + HERO_TINT.toString(16)});
            this.menuTokensDisplayGroup.add(tokenImg);
            this.menuTokensDisplayGroup.add(tokenQtyText);
            this.menuLayer.add(tokenImg);
            this.menuLayer.add(tokenQtyText);
        })
    }

    updateMenuRelics(currentRelics: InventoryItem[]) {
        this.menuRelicsDisplayGroup.clear(true, true);
        currentRelics.forEach((relic, index) => {
            const x = this.relicsHeaderText.x + (24 * index * GAME_SCALE);
            const y = this.relicsHeaderText.y + this.relicsHeaderText.height + 4 * GAME_SCALE;
            const relicType = RELIC_CONFIGS.find(rC => rC.key === relic.inventoryItemKey)
            const relicImg = this.add.image(x, y, STATIC_TEXTURE_KEY, relicType.frameIndex).setScale(GAME_SCALE).setTint(relicType.tint).setOrigin(0, 0);
            const relicQtyText = this.add.text(relicImg.x, relicImg.y + relicImg.displayHeight, 'x' + relic.quantity, {font: `${8 * GAME_SCALE}px '7_12'`, color: '#' + HERO_TINT.toString(16)});
            this.menuRelicsDisplayGroup.add(relicImg);
            this.menuRelicsDisplayGroup.add(relicQtyText);
            this.menuLayer.add(relicImg);
            this.menuLayer.add(relicQtyText);
        })
    }

    private resizeMenu() {
        this.menuBtn.setPosition(this.scale.width - MENU_BTN_DIMENSION, this.scale.height - MENU_BTN_DIMENSION);
        this.menuBtnImage.setPosition(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2);
        this.closeImage.setPosition(this.menuBtn.x + this.menuBtn.width / 2, this.menuBtn.y + this.menuBtn.height / 2);
        const menuBGWidth = this.calculateMenuBGWidth();
        this.menuBackground.setPosition(window.innerWidth - menuBGWidth, 0)
            .setSize(menuBGWidth, window.innerHeight);
        this.menuHeaderText.setPosition(this.menuBackground.x + this.menuBackground.width / 2, 16);
        this.pointsText.setPosition(this.menuBackground.x + 20, this.menuHeaderText.y + this.menuHeaderText.displayHeight + 16)
        this.stuffHeaderText.setPosition(this.menuBackground.x + 20, this.pointsText.y + this.pointsText.displayHeight + 8);
        this.tokensHeaderText.setPosition(this.menuBackground.x + 20, this.stuffHeaderText.y + this.stuffHeaderText.displayHeight + 36 * GAME_SCALE);
        this.relicsHeaderText.setPosition(this.menuBackground.x + 20, this.tokensHeaderText.y + this.tokensHeaderText.displayHeight + 36 * GAME_SCALE);
    }

    private calculateMenuBGWidth() {
        // return this.game.device.os.iOS ? window.innerWidth : 320;
        return window.innerWidth;
    }
}
