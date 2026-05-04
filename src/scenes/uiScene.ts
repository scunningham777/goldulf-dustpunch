import { STUFF_CONFIGS, TOKEN_CONFIGS, RELIC_CONFIGS } from "../config";
import { INVENTORY_STUFF_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, GAME_SCALE, SHOW_MENU_REGISTRY_KEY, STATIC_TEXTURE_KEY, STUFF_TINT, HERO_TINT, UI_TEXTURE_KEY, INVENTORY_TOKENS_REGISTRY_KEY, INVENTORY_RELICS_REGISTRY_KEY, HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, UI_BAR_HEIGHT } from "../constants";
import { HERO_MOVEMENT_CONTROLLERS } from "../interfaces/heroMovementController";
import { InventoryItem } from "../interfaces/stuffInInventory";
import { TEXT_INVENTORY_TITLE_TEXT as TEXT_INVENTORY_HEADER_TEXT } from "../text";

const VIRTUAL_JOYSTICK_DIAMETER = 16;
const MENU_BTN_DIMENSION = UI_BAR_HEIGHT;
const MENU_BG_WIDTH_RATIO = 1; // Full width
const MENU_BODY_OFFSET_X_RATIO = 0.06;
const STANDARD_FONT_SIZE = 8 * GAME_SCALE;
const HEADER_FONT_SIZE = 12 * GAME_SCALE;
const TITLE_FONT_SIZE = 16 * GAME_SCALE;
const ITEM_SPACING = 24 * GAME_SCALE;
const SECTION_VERTICAL_SPACING = 36 * GAME_SCALE;
const TEXT_VERTICAL_SPACING = 8 * GAME_SCALE;
const POINTS_TEXT_OFFSET = 16;
const HEADER_TEXT_OFFSET = 16;

interface MenuSection {
    headerText: Phaser.GameObjects.Text;
    displayGroup: Phaser.GameObjects.Group;
}

export class UIScene extends Phaser.Scene {
    private pointsText: Phaser.GameObjects.Text;
    private virtualJoystick: Phaser.GameObjects.Ellipse;
    private menuLayer: Phaser.GameObjects.Layer;
    private menuBackground: Phaser.GameObjects.Rectangle;
    private closeImage: Phaser.GameObjects.Image;
    private menuHeaderText: Phaser.GameObjects.Text;
    private settingsHeaderText: Phaser.GameObjects.Text;
    private mvtCtrlHeaderText: Phaser.GameObjects.Text;
    private mvtCtrlFollowBtn: Phaser.GameObjects.Text;
    private mvtCtrlJoystickBtn: Phaser.GameObjects.Text;
    private menuBtn: Phaser.GameObjects.Rectangle;
    private menuBtnImage: Phaser.GameObjects.Image;
    private isHidingMenu: boolean = false;

    private menuSections: { [key: string]: MenuSection } = {};

    private uiUpdateHandlers: { [key: string]: (data: any) => void } = {};

    create(): void {
        this.initMenuButton();
        this.initVirtualJoystick();
        this.initMenu();
        this.initEventListeners();
        this.initUIUpdates();
    }

    private initMenuButton(): void {
        this.menuBtn = this.add.rectangle(0, this.scale.height - MENU_BTN_DIMENSION, this.scale.width, MENU_BTN_DIMENSION, 0x000000).setOrigin(0, 0);
        this.menuBtnImage = this.add.image(this.menuBtn.width - MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2, UI_TEXTURE_KEY, 0).setScale(GAME_SCALE);
        this.menuBtn.setInteractive();

        this.menuBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            if (!this.registry.get(SHOW_MENU_REGISTRY_KEY)) {
                this.registry.set(SHOW_MENU_REGISTRY_KEY, true);
            } else {
                this.isHidingMenu = true;
            }
        });

        this.menuBtn.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            if (this.isHidingMenu) {
                this.isHidingMenu = false;
                this.registry.set(SHOW_MENU_REGISTRY_KEY, false);
            }
        });
    }

    private initVirtualJoystick(): void {
        this.virtualJoystick = this.add.ellipse(10, 50, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, VIRTUAL_JOYSTICK_DIAMETER * GAME_SCALE, 0x000000, 1);
        this.hideVirtualJoystick();
    }

    private initMenu(): void {
        this.createMenuBackground();
        this.createMenuHeader();
        this.createPointsText();
        this.createInventorySections();
        this.createSettingsSection();
        this.createMovementControls();
        this.createCloseButton();
        this.assembleMenuLayer();
    }

    private createMenuBackground(): void {
        const menuBGWidth = this.calculateMenuBGWidth();
        this.menuBackground = this.add.rectangle(window.innerWidth - menuBGWidth, 0, menuBGWidth, window.innerHeight, 0x000000).setOrigin(0, 0);
    }

    private createMenuHeader(): void {
        this.menuHeaderText = this.add.text(this.menuBackground.x + this.menuBackground.width / 2, HEADER_TEXT_OFFSET, TEXT_INVENTORY_HEADER_TEXT, {
            font: `${TITLE_FONT_SIZE}px '7_12'`,
            color: '#fff'
        }).setOrigin(0.5, 0);
    }

    private createPointsText(): void {
        const menuBodyOffsetX = this.menuBackground.width * MENU_BODY_OFFSET_X_RATIO;
        this.pointsText = this.add.text(menuBodyOffsetX, this.menuHeaderText.y + this.menuHeaderText.displayHeight + POINTS_TEXT_OFFSET, 'Points: 0', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: '#fff'
        });
    }

    private createInventorySections(): void {
        const menuBodyOffsetX = this.menuBackground.width * MENU_BODY_OFFSET_X_RATIO;
        let currentY = this.pointsText.y + this.pointsText.displayHeight + TEXT_VERTICAL_SPACING;

        // Stuff section
        this.menuSections[INVENTORY_STUFF_REGISTRY_KEY] = {
            headerText: this.add.text(menuBodyOffsetX, currentY, 'Your Stuff: ', {
                font: `${STANDARD_FONT_SIZE}px '7_12'`,
                color: '#fff'
            }),
            displayGroup: this.add.group()
        };
        currentY += this.menuSections[INVENTORY_STUFF_REGISTRY_KEY].headerText.displayHeight + SECTION_VERTICAL_SPACING;

        // Tokens section
        this.menuSections[INVENTORY_TOKENS_REGISTRY_KEY] = {
            headerText: this.add.text(menuBodyOffsetX, currentY, 'Your Tokens: ', {
                font: `${STANDARD_FONT_SIZE}px '7_12'`,
                color: '#fff'
            }),
            displayGroup: this.add.group()
        };
        currentY += this.menuSections[INVENTORY_TOKENS_REGISTRY_KEY].headerText.displayHeight + SECTION_VERTICAL_SPACING;

        // Relics section
        this.menuSections[INVENTORY_RELICS_REGISTRY_KEY] = {
            headerText: this.add.text(menuBodyOffsetX, currentY, 'Your Relics: ', {
                font: `${STANDARD_FONT_SIZE}px '7_12'`,
                color: '#fff'
            }),
            displayGroup: this.add.group()
        };
    }

    private createSettingsSection(): void {
        this.settingsHeaderText = this.add.text(this.menuBackground.x + this.menuBackground.width / 2,
            this.menuSections[INVENTORY_RELICS_REGISTRY_KEY].headerText.y + this.menuSections[INVENTORY_RELICS_REGISTRY_KEY].headerText.displayHeight + SECTION_VERTICAL_SPACING,
            'Settings', {
            font: `${HEADER_FONT_SIZE}px '7_12'`,
            color: '#fff'
        }).setOrigin(0.5, 0);
    }

    private createMovementControls(): void {
        const menuBodyOffsetX = this.menuBackground.width * MENU_BODY_OFFSET_X_RATIO;
        this.mvtCtrlHeaderText = this.add.text(menuBodyOffsetX, this.settingsHeaderText.y + this.settingsHeaderText.displayHeight + TEXT_VERTICAL_SPACING, 'Player Movement: ', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: '#fff'
        });

        this.mvtCtrlFollowBtn = this.add.text(menuBodyOffsetX + TEXT_VERTICAL_SPACING, this.mvtCtrlHeaderText.y + this.mvtCtrlHeaderText.displayHeight + TEXT_VERTICAL_SPACING, 'Follow Cursor', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: '#fff'
        });
        this.mvtCtrlFollowBtn.setInteractive();
        this.mvtCtrlFollowBtn.on('pointerdown', () => {
            this.registry.set(HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, HERO_MOVEMENT_CONTROLLERS.FOLLOW_HERO);
        });

        this.mvtCtrlJoystickBtn = this.add.text(this.mvtCtrlFollowBtn.x + this.mvtCtrlFollowBtn.displayWidth + TEXT_VERTICAL_SPACING, this.mvtCtrlFollowBtn.y, 'Joystick', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: '#fff'
        });
        this.mvtCtrlJoystickBtn.setInteractive();
        this.mvtCtrlJoystickBtn.on('pointerdown', () => {
            this.registry.set(HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, HERO_MOVEMENT_CONTROLLERS.JOYSTICK);
        });
    }

    private createCloseButton(): void {
        this.closeImage = this.add.image(this.menuBtn.width - MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2, UI_TEXTURE_KEY, 1).setScale(GAME_SCALE);
    }

    private assembleMenuLayer(): void {
        const menuElements: Phaser.GameObjects.GameObject[] = [
            this.menuBackground, this.menuHeaderText, this.pointsText, this.closeImage, this.settingsHeaderText,
            this.mvtCtrlHeaderText, this.mvtCtrlFollowBtn, this.mvtCtrlJoystickBtn
        ];

        // Add section headers and groups
        Object.values(this.menuSections).forEach(section => {
            menuElements.push(section.headerText);
            section.displayGroup.getChildren().forEach(child => menuElements.push(child));
        });

        this.menuLayer = this.add.layer(menuElements);
        this.menuLayer.setVisible(false);
    }

    private initEventListeners(): void {
        this.scale.on('resize', () => this.resizeMenu());
    }

    private initUIUpdates(): void {
        this.uiUpdateHandlers = {
            [INVENTORY_STUFF_REGISTRY_KEY]: (data: InventoryItem[]) => this.updateInventorySection(INVENTORY_STUFF_REGISTRY_KEY, data, STUFF_CONFIGS, STUFF_TINT),
            [INVENTORY_TOKENS_REGISTRY_KEY]: (data: InventoryItem[]) => this.updateInventorySection(INVENTORY_TOKENS_REGISTRY_KEY, data, TOKEN_CONFIGS, null),
            [INVENTORY_RELICS_REGISTRY_KEY]: (data: InventoryItem[]) => this.updateInventorySection(INVENTORY_RELICS_REGISTRY_KEY, data, RELIC_CONFIGS, null),
            [TOUCH_MOVEMENT_REGISTRY_KEY]: (data: { startX: number, startY: number } | null) => {
                if (data) this.showVirtualJoystick(data);
                else this.hideVirtualJoystick();
            },
            [HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY]: (data: HERO_MOVEMENT_CONTROLLERS) => this.updateMenuMvtCtrlSelection(data),
            [SHOW_MENU_REGISTRY_KEY]: (data: boolean) => this.showInventory(data)
        };

        // Initial updates
        Object.keys(this.uiUpdateHandlers).forEach(key => {
            if (this.registry.values[key] !== undefined) {
                this.uiUpdateHandlers[key](this.registry.values[key]);
            }
        });

        // Remove duplicate listeners
        this.registry.events.off('changedata', this.updateUI, this);
        this.registry.events.on('changedata', this.updateUI, this);
    }

    private updateUI(_parent: any, key: string, data: any): void {
        const handler = this.uiUpdateHandlers[key];
        if (handler) handler(data);
    }

    private showVirtualJoystick(data: { startX: number, startY: number }): void {
        this.virtualJoystick.setPosition(data.startX, data.startY).setAlpha(0.4);
    }

    private hideVirtualJoystick(): void {
        this.virtualJoystick.setAlpha(0);
    }

    private showInventory(doShow: boolean): void {
        this.menuLayer.setVisible(doShow ?? !this.menuLayer.visible);
    }

    private updateInventorySection(registryKey: string, items: InventoryItem[], configs: any[], defaultTint?: number): void {
        if (registryKey === INVENTORY_STUFF_REGISTRY_KEY) {
            const totalPoints = items.reduce((points: number, item) => {
                const config = configs.find(c => c.stuffName === item.inventoryItemKey);
                return config ? points + (config.points * item.quantity) : points;
            }, 0);
            this.pointsText.setText('Points: ' + totalPoints);
        }

        const section = this.menuSections[registryKey];
        if (!section) return;

        section.displayGroup.clear(true, true);
        items.forEach((item, index) => {
            const x = section.headerText.x + (ITEM_SPACING * index);
            const y = section.headerText.y + section.headerText.height + TEXT_VERTICAL_SPACING;
            const config = configs.find(c => (c.stuffName || c.key) === item.inventoryItemKey);
            if (!config) return;

            const tint = config.tint !== undefined ? config.tint : (defaultTint || 0xffffff);
            const img = this.add.image(x, y, STATIC_TEXTURE_KEY, config.frameIndex).setScale(GAME_SCALE).setTint(tint).setOrigin(0, 0);
            const qtyText = this.add.text(img.x, img.y + img.displayHeight, 'x' + item.quantity, {
                font: `${STANDARD_FONT_SIZE}px '7_12'`,
                color: '#' + HERO_TINT.toString(16)
            });

            section.displayGroup.add(img);
            section.displayGroup.add(qtyText);
            this.menuLayer.add(img as any);
            this.menuLayer.add(qtyText as any);
        });
    }

    private updateMenuMvtCtrlSelection(currentMvtCtrl: HERO_MOVEMENT_CONTROLLERS): void {
        const isFollow = currentMvtCtrl === HERO_MOVEMENT_CONTROLLERS.FOLLOW_HERO;
        this.mvtCtrlFollowBtn.setAlpha(isFollow ? 1 : 0.8).setTint(isFollow ? HERO_TINT : 0xffffff);
        this.mvtCtrlJoystickBtn.setAlpha(isFollow ? 0.8 : 1).setTint(isFollow ? 0xffffff : HERO_TINT);
    }

    private resizeMenu(): void {
        this.menuBtn.setPosition(0, this.scale.height - MENU_BTN_DIMENSION).setSize(this.scale.width, MENU_BTN_DIMENSION);
        this.menuBtnImage.setPosition(this.menuBtn.width - MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2);
        this.closeImage.setPosition(this.menuBtn.width - MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2);

        const menuBGWidth = this.calculateMenuBGWidth();
        this.menuBackground.setPosition(window.innerWidth - menuBGWidth, 0).setSize(menuBGWidth, window.innerHeight);
        this.menuHeaderText.setPosition(this.menuBackground.x + this.menuBackground.width / 2, HEADER_TEXT_OFFSET);

        const menuBodyOffsetX = this.menuBackground.width * MENU_BODY_OFFSET_X_RATIO;
        this.pointsText.setPosition(menuBodyOffsetX, this.menuHeaderText.y + this.menuHeaderText.displayHeight + POINTS_TEXT_OFFSET);

        let currentY = this.pointsText.y + this.pointsText.displayHeight + TEXT_VERTICAL_SPACING;
        Object.values(this.menuSections).forEach(section => {
            section.headerText.setPosition(menuBodyOffsetX, currentY);
            currentY += section.headerText.displayHeight + SECTION_VERTICAL_SPACING;
        });

        this.settingsHeaderText.setPosition(this.menuBackground.x + this.menuBackground.width / 2,
            this.menuSections[INVENTORY_RELICS_REGISTRY_KEY].headerText.y + this.menuSections[INVENTORY_RELICS_REGISTRY_KEY].headerText.displayHeight + SECTION_VERTICAL_SPACING);
        this.mvtCtrlHeaderText.setPosition(menuBodyOffsetX, this.settingsHeaderText.y + this.settingsHeaderText.displayHeight + TEXT_VERTICAL_SPACING);
        this.mvtCtrlFollowBtn.setPosition(menuBodyOffsetX + TEXT_VERTICAL_SPACING, this.mvtCtrlHeaderText.y + this.mvtCtrlHeaderText.displayHeight + TEXT_VERTICAL_SPACING);
        this.mvtCtrlJoystickBtn.setPosition(this.mvtCtrlFollowBtn.x + this.mvtCtrlFollowBtn.displayWidth + TEXT_VERTICAL_SPACING, this.mvtCtrlFollowBtn.y);
    }

    private calculateMenuBGWidth() {
        // return this.game.device.os.iOS ? window.innerWidth : 320;
        return window.innerWidth;
    }
}
