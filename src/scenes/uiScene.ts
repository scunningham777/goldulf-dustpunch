import { STUFF_CONFIGS, TOKEN_CONFIGS, RELIC_CONFIGS } from "../config";
import { INVENTORY_STUFF_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, GAME_SCALE, SHOW_MENU_REGISTRY_KEY, STATIC_TEXTURE_KEY, STUFF_TINT, HERO_TINT, UI_TEXTURE_KEY, INVENTORY_TOKENS_REGISTRY_KEY, INVENTORY_RELICS_REGISTRY_KEY, HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, UI_BAR_HEIGHT, AUDIO_MUTE_REGISTRY_KEY, DASH_COOLDOWN_ENDS_AT_REGISTRY_KEY, DASH_ACTIVE_UNTIL_REGISTRY_KEY, SPIN_COOLDOWN_ENDS_AT_REGISTRY_KEY, WALL_BREAK_COOLDOWN_ENDS_AT_REGISTRY_KEY, TEXT_TINT, TEXT_TINT_HEX, SITE_DATA_REGISTRY_KEY, EXIT_SITE_REQUEST_KEY, SITE_TYPES, IS_DEBUG } from "../constants";
import { HERO_MOVEMENT_CONTROLLERS } from "../interfaces/heroMovementController";
import { InventoryItem } from "../interfaces/stuffInInventory";
import { TEXT_INVENTORY_TITLE_TEXT as TEXT_INVENTORY_HEADER_TEXT } from "../text";

const VIRTUAL_JOYSTICK_DIAMETER = 16;
const MENU_BTN_DIMENSION = UI_BAR_HEIGHT;
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
    private fleeSiteBtnText: Phaser.GameObjects.Text;
    private muteBtn: Phaser.GameObjects.Text;
    private menuBtn: Phaser.GameObjects.Rectangle;
    private menuBtnImage: Phaser.GameObjects.Image;
    private sandalCooldownIcon: Phaser.GameObjects.Image;
    private sandalCooldownText: Phaser.GameObjects.Text;
    private daggerCooldownIcon: Phaser.GameObjects.Image;
    private daggerCooldownText: Phaser.GameObjects.Text;
    private cestusCooldownIcon: Phaser.GameObjects.Image;
    private cestusCooldownText: Phaser.GameObjects.Text;
    private isHidingMenu: boolean = false;

    private menuSections: { [key: string]: MenuSection } = {};

    private uiUpdateHandlers: { [key: string]: (data: any) => void } = {};

    create(): void {
        this.initMenuButton();
        this.initCooldownDisplay();
        this.initVirtualJoystick();
        this.initMenu();
        this.initEventListeners();
        this.initUIUpdates();
        this.initDebugKeyBinding();
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
        this.createMuteButton();
        this.assembleMenuLayer();
    }

    private createMenuBackground(): void {
        const menuBGWidth = this.calculateMenuBGWidth();
        this.menuBackground = this.add.rectangle(window.innerWidth - menuBGWidth, 0, menuBGWidth, window.innerHeight, 0x000000).setOrigin(0, 0);
    }

    private createMenuHeader(): void {
        this.menuHeaderText = this.add.text(this.menuBackground.x + this.menuBackground.width / 2, HEADER_TEXT_OFFSET, TEXT_INVENTORY_HEADER_TEXT, {
            font: `${TITLE_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        }).setOrigin(0.5, 0);
    }

    private createPointsText(): void {
        const menuBodyOffsetX = this.menuBackground.width * MENU_BODY_OFFSET_X_RATIO;
        this.pointsText = this.add.text(menuBodyOffsetX, this.menuHeaderText.y + this.menuHeaderText.displayHeight + POINTS_TEXT_OFFSET, 'Points: 0', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        });
    }

    private createInventorySections(): void {
        const menuBodyOffsetX = this.menuBackground.width * MENU_BODY_OFFSET_X_RATIO;
        let currentY = this.pointsText.y + this.pointsText.displayHeight + TEXT_VERTICAL_SPACING;

        // Stuff section
        this.menuSections[INVENTORY_STUFF_REGISTRY_KEY] = {
            headerText: this.add.text(menuBodyOffsetX, currentY, 'Your Stuff: ', {
                font: `${STANDARD_FONT_SIZE}px '7_12'`,
                color: TEXT_TINT_HEX
            }),
            displayGroup: this.add.group()
        };
        currentY += this.menuSections[INVENTORY_STUFF_REGISTRY_KEY].headerText.displayHeight + SECTION_VERTICAL_SPACING;

        // Tokens section
        this.menuSections[INVENTORY_TOKENS_REGISTRY_KEY] = {
            headerText: this.add.text(menuBodyOffsetX, currentY, 'Your Tokens: ', {
                font: `${STANDARD_FONT_SIZE}px '7_12'`,
                color: TEXT_TINT_HEX
            }),
            displayGroup: this.add.group()
        };
        currentY += this.menuSections[INVENTORY_TOKENS_REGISTRY_KEY].headerText.displayHeight + SECTION_VERTICAL_SPACING;

        // Relics section
        this.menuSections[INVENTORY_RELICS_REGISTRY_KEY] = {
            headerText: this.add.text(menuBodyOffsetX, currentY, 'Your Relics: ', {
                font: `${STANDARD_FONT_SIZE}px '7_12'`,
                color: TEXT_TINT_HEX
            }),
            displayGroup: this.add.group()
        };
    }

    private createSettingsSection(): void {
        this.settingsHeaderText = this.add.text(this.menuBackground.x + this.menuBackground.width / 2,
            this.menuSections[INVENTORY_RELICS_REGISTRY_KEY].headerText.y + this.menuSections[INVENTORY_RELICS_REGISTRY_KEY].headerText.displayHeight + SECTION_VERTICAL_SPACING,
            'Settings', {
            font: `${HEADER_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        }).setOrigin(0.5, 0);
    }

    private createMovementControls(): void {
        const menuBodyOffsetX = this.menuBackground.width * MENU_BODY_OFFSET_X_RATIO;
        this.mvtCtrlHeaderText = this.add.text(menuBodyOffsetX, this.settingsHeaderText.y + this.settingsHeaderText.displayHeight + TEXT_VERTICAL_SPACING, 'Player Movement: ', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        });

        this.mvtCtrlFollowBtn = this.add.text(menuBodyOffsetX + TEXT_VERTICAL_SPACING, this.mvtCtrlHeaderText.y + this.mvtCtrlHeaderText.displayHeight + TEXT_VERTICAL_SPACING, 'Follow Cursor', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        });
        this.mvtCtrlFollowBtn.setInteractive();
        this.mvtCtrlFollowBtn.on('pointerdown', () => {
            this.registry.set(HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, HERO_MOVEMENT_CONTROLLERS.FOLLOW_HERO);
        });

        this.mvtCtrlJoystickBtn = this.add.text(this.mvtCtrlFollowBtn.x + this.mvtCtrlFollowBtn.displayWidth + TEXT_VERTICAL_SPACING, this.mvtCtrlFollowBtn.y, 'Joystick', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        });
        this.mvtCtrlJoystickBtn.setInteractive();
        this.mvtCtrlJoystickBtn.on('pointerdown', () => {
            this.registry.set(HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, HERO_MOVEMENT_CONTROLLERS.JOYSTICK);
        });

        const fleeBtnTextY = this.mvtCtrlFollowBtn.y + this.mvtCtrlFollowBtn.displayHeight + TEXT_VERTICAL_SPACING;
        this.fleeSiteBtnText = this.add.text(menuBodyOffsetX + 4, fleeBtnTextY, 'Flee This Place!', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: '#' + STUFF_TINT.toString(16)
        }).setOrigin(0, 0).setInteractive();


        this.fleeSiteBtnText.on('pointerdown', () => {
            this.registry.events.emit(EXIT_SITE_REQUEST_KEY);
        });

        this.fleeSiteBtnText.setVisible(false);
    }

    private createCloseButton(): void {
        this.closeImage = this.add.image(this.menuBtn.width - MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2, UI_TEXTURE_KEY, 1).setScale(GAME_SCALE);
    }

    private createMuteButton(): void {
        this.muteBtn = this.add.text(MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2, 'MUTE', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        }).setOrigin(0.5, 0.5);

        this.muteBtn.setInteractive();
        this.muteBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            const isMuted = this.registry.get(AUDIO_MUTE_REGISTRY_KEY) ?? false;
            this.registry.set(AUDIO_MUTE_REGISTRY_KEY, !isMuted);
        });
    }

    private initCooldownDisplay(): void {
        const sandalConfig = RELIC_CONFIGS.find(relic => relic.key === 'sandal');
        const daggerConfig = RELIC_CONFIGS.find(relic => relic.key === 'dagger');
        const cestusConfig = RELIC_CONFIGS.find(relic => relic.key === 'cestus');
        if (!sandalConfig || !daggerConfig || !cestusConfig) return;

        const iconY = this.scale.height - MENU_BTN_DIMENSION / 2;
        const sandalX = MENU_BTN_DIMENSION / 2;
        const daggerX = sandalX + MENU_BTN_DIMENSION + 32;
        const cestusX = daggerX + MENU_BTN_DIMENSION + 32;

        this.sandalCooldownIcon = this.add.image(sandalX, iconY, STATIC_TEXTURE_KEY, sandalConfig.frameIndex)
            .setScale(GAME_SCALE)
            .setTint(sandalConfig.tint)
            .setOrigin(0.5, 0.5)
            .setVisible(false);

        this.sandalCooldownText = this.add.text(sandalX + (MENU_BTN_DIMENSION / 2) + 4, iconY, '', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        }).setOrigin(0, 0.5).setVisible(false);

        this.daggerCooldownIcon = this.add.image(daggerX, iconY, STATIC_TEXTURE_KEY, daggerConfig.frameIndex)
            .setScale(GAME_SCALE)
            .setTint(daggerConfig.tint)
            .setOrigin(0.5, 0.5)
            .setVisible(false);

        this.daggerCooldownText = this.add.text(daggerX + (MENU_BTN_DIMENSION / 2) + 4, iconY, '', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        }).setOrigin(0, 0.5).setVisible(false);

        this.cestusCooldownIcon = this.add.image(cestusX, iconY, STATIC_TEXTURE_KEY, cestusConfig.frameIndex)
            .setScale(GAME_SCALE)
            .setTint(cestusConfig.tint)
            .setOrigin(0.5, 0.5)
            .setVisible(false);

        this.cestusCooldownText = this.add.text(cestusX + (MENU_BTN_DIMENSION / 2) + 4, iconY, '', {
            font: `${STANDARD_FONT_SIZE}px '7_12'`,
            color: TEXT_TINT_HEX
        }).setOrigin(0, 0.5).setVisible(false);
    }

    private updateCooldownDisplayVisibility(): void {
        if (!this.sandalCooldownIcon || !this.sandalCooldownText || !this.daggerCooldownIcon || !this.daggerCooldownText || !this.cestusCooldownIcon || !this.cestusCooldownText) return;

        const menuOpen = this.menuLayer?.visible;
        const dashActiveUntil = this.registry.get(DASH_ACTIVE_UNTIL_REGISTRY_KEY) || 0;
        const dashCooldownEndsAt = this.registry.get(DASH_COOLDOWN_ENDS_AT_REGISTRY_KEY) || 0;
        const spinCooldownEndsAt = this.registry.get(SPIN_COOLDOWN_ENDS_AT_REGISTRY_KEY) || 0;
        const wallBreakCooldownEndsAt = this.registry.get(WALL_BREAK_COOLDOWN_ENDS_AT_REGISTRY_KEY) || 0;

        // Sandal icon shows during dash/boost OR during cooldown; text only shows during cooldown
        const sandalActive = dashActiveUntil > this.time.now || dashCooldownEndsAt > this.time.now;
        const sandalShowText = dashCooldownEndsAt > this.time.now;
        const showSandalIcon = sandalActive && !menuOpen;
        const showSandalText = sandalShowText && !menuOpen;

        const daggerOnCooldown = spinCooldownEndsAt > this.time.now;
        const cestusOnCooldown = wallBreakCooldownEndsAt > this.time.now;
        const showDagger = daggerOnCooldown && !menuOpen;
        const showCestus = cestusOnCooldown && !menuOpen;

        this.sandalCooldownIcon.setVisible(showSandalIcon);
        this.sandalCooldownText.setVisible(showSandalText);
        this.daggerCooldownIcon.setVisible(showDagger);
        this.daggerCooldownText.setVisible(showDagger);
        this.cestusCooldownIcon.setVisible(showCestus);
        this.cestusCooldownText.setVisible(showCestus);
    }

    private assembleMenuLayer(): void {
        const menuElements: Phaser.GameObjects.GameObject[] = [
            this.menuBackground, this.menuHeaderText, this.pointsText, this.closeImage, this.muteBtn, this.settingsHeaderText,
            this.mvtCtrlHeaderText, this.mvtCtrlFollowBtn, this.mvtCtrlJoystickBtn, this.fleeSiteBtnText
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
            [SHOW_MENU_REGISTRY_KEY]: (data: boolean) => this.showInventory(data),
            [AUDIO_MUTE_REGISTRY_KEY]: (data: boolean) => this.updateMuteButtonState(data),
            [SITE_DATA_REGISTRY_KEY]: (data: any) => this.updateFleeButtonVisibility(data)
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

    private initDebugKeyBinding(): void {
        if (!IS_DEBUG) return;

        this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
            if (event.ctrlKey && event.altKey && event.key === 't') {
                event.preventDefault();
                this.handleDebugTokenInput();
            }
        });

        this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
            if (event.ctrlKey && event.altKey && event.key === 'r') {
                event.preventDefault();
                this.handleDebugRelicInput();
            }
        });
    }

    private handleDebugInventoryInput(configs: any[], registryKey: string, itemType: string): void {
        const itemName = prompt(`Enter ${itemType} name:`);
        if (!itemName) return;

        const config = configs.find(c => c.key === itemName);
        if (!config) {
            alert(`${itemType} "${itemName}" not found.`);
            return;
        }

        const quantityStr = prompt(`Enter quantity for ${itemName}:`);
        if (quantityStr === null) return;

        const quantity = parseInt(quantityStr, 10);
        if (isNaN(quantity) || quantity < 0) {
            alert('Invalid quantity.');
            return;
        }

        // Update the registry
        const currentItems: InventoryItem[] = this.registry.get(registryKey) || [];
        const existingIndex = currentItems.findIndex(item => item.inventoryItemKey === itemName);
        if (existingIndex >= 0) {
            currentItems[existingIndex].quantity = quantity;
        } else {
            currentItems.push({ inventoryItemKey: itemName, quantity });
        }
        this.registry.set(registryKey, currentItems);
    }

    private handleDebugTokenInput(): void {
        this.handleDebugInventoryInput(TOKEN_CONFIGS, INVENTORY_TOKENS_REGISTRY_KEY, 'token');
    }

    private handleDebugRelicInput(): void {
        this.handleDebugInventoryInput(RELIC_CONFIGS, INVENTORY_RELICS_REGISTRY_KEY, 'relic');
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
        const visible = doShow ?? !this.menuLayer.visible;
        this.menuLayer.setVisible(visible);
        this.updateCooldownDisplayVisibility();
    }

    private updateInventorySection(registryKey: string, items: InventoryItem[], configs: any[], defaultTint?: number): void {
        if (registryKey === INVENTORY_STUFF_REGISTRY_KEY) {
            const totalPoints = items.reduce((points: number, item) => {
                const config = configs.find(c => c.stuffName === item.inventoryItemKey);
                return config ? points + (config.points * item.quantity) : points;
            }, 0);
            this.pointsText.setText('Your Points: ' + totalPoints);
        }

        const section = this.menuSections[registryKey];
        if (!section) return;

        section.displayGroup.clear(true, true);
        items.forEach((item, index) => {
            const x = section.headerText.x + (ITEM_SPACING * index);
            const y = section.headerText.y + section.headerText.height + TEXT_VERTICAL_SPACING;
            const config = configs.find(c => (c.stuffName || c.key) === item.inventoryItemKey);
            if (!config) return;

            const tint = config.tint !== undefined ? config.tint : (defaultTint || TEXT_TINT);
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
        this.mvtCtrlFollowBtn.setAlpha(isFollow ? 1 : 0.8).setTint(isFollow ? HERO_TINT : TEXT_TINT);
        this.mvtCtrlJoystickBtn.setAlpha(isFollow ? 0.8 : 1).setTint(isFollow ? TEXT_TINT : HERO_TINT);
    }

    private updateFleeButtonVisibility(siteData: any): void {
        const visible = !!siteData && siteData.siteType !== SITE_TYPES.overworld;
        if (this.fleeSiteBtnText) this.fleeSiteBtnText.setVisible(visible);
    }

    private updateMuteButtonState(isMuted: boolean): void {
        this.muteBtn.setTint(isMuted ? HERO_TINT : TEXT_TINT);
    }

    private resizeMenu(): void {
        this.menuBtn.setPosition(0, this.scale.height - MENU_BTN_DIMENSION).setSize(this.scale.width, MENU_BTN_DIMENSION);
        this.menuBtnImage.setPosition(this.menuBtn.width - MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2);
        this.closeImage.setPosition(this.menuBtn.width - MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2);
        this.muteBtn.setPosition(MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2);

        if (this.sandalCooldownIcon) {
            this.sandalCooldownIcon.setPosition(MENU_BTN_DIMENSION / 2, this.menuBtn.y + this.menuBtn.height / 2);
        }
        if (this.sandalCooldownText) {
            this.sandalCooldownText.setPosition(MENU_BTN_DIMENSION, this.menuBtn.y + this.menuBtn.height / 2);
        }
        if (this.daggerCooldownIcon) {
            this.daggerCooldownIcon.setPosition(MENU_BTN_DIMENSION / 2 + MENU_BTN_DIMENSION + 8, this.menuBtn.y + this.menuBtn.height / 2);
        }
        if (this.daggerCooldownText) {
            this.daggerCooldownText.setPosition(MENU_BTN_DIMENSION * 2 + 8 + (MENU_BTN_DIMENSION / 2) + 4, this.menuBtn.y + this.menuBtn.height / 2);
        }
        if (this.cestusCooldownIcon) {
            this.cestusCooldownIcon.setPosition(MENU_BTN_DIMENSION / 2 + (MENU_BTN_DIMENSION + 8) * 2, this.menuBtn.y + this.menuBtn.height / 2);
        }
        if (this.cestusCooldownText) {
            this.cestusCooldownText.setPosition(MENU_BTN_DIMENSION / 2 + (MENU_BTN_DIMENSION + 8) * 2 + (MENU_BTN_DIMENSION / 2) + 4, this.menuBtn.y + this.menuBtn.height / 2);
        }

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

        if (this.fleeSiteBtnText) {
            const fleeBtnY = this.mvtCtrlFollowBtn.y + this.mvtCtrlFollowBtn.displayHeight + TEXT_VERTICAL_SPACING;
            this.fleeSiteBtnText.setPosition(menuBodyOffsetX + 4, fleeBtnY);
        }
    }

    update(): void {
        this.updateCooldownDisplayVisibility();

        if (!this.sandalCooldownText || !this.sandalCooldownIcon || !this.daggerCooldownText || !this.daggerCooldownIcon || !this.cestusCooldownText || !this.cestusCooldownIcon) return;

        // Sandal: show cooldown text only during cooldown phase (not during dash/boost)
        const dashCooldownEndsAt = this.registry.get(DASH_COOLDOWN_ENDS_AT_REGISTRY_KEY) || 0;
        const dashRemainingMs = Math.max(0, dashCooldownEndsAt - this.time.now);
        if (dashRemainingMs > 0) {
            const secondsRemaining = Math.ceil(dashRemainingMs / 1000);
            this.sandalCooldownText.setText(`${secondsRemaining}s`);
        } else {
            this.sandalCooldownText.setText('');
        }

        const spinCooldownEndsAt = this.registry.get(SPIN_COOLDOWN_ENDS_AT_REGISTRY_KEY) || 0;
        const spinRemainingMs = Math.max(0, spinCooldownEndsAt - this.time.now);
        if (spinRemainingMs > 0) {
            const secondsRemaining = Math.ceil(spinRemainingMs / 1000);
            this.daggerCooldownText.setText(`${secondsRemaining}s`);
        }

        const wallBreakCooldownEndsAt = this.registry.get(WALL_BREAK_COOLDOWN_ENDS_AT_REGISTRY_KEY) || 0;
        const wallBreakRemainingMs = Math.max(0, wallBreakCooldownEndsAt - this.time.now);
        if (wallBreakRemainingMs > 0) {
            const secondsRemaining = Math.ceil(wallBreakRemainingMs / 1000);
            this.cestusCooldownText.setText(`${secondsRemaining}s`);
        }
    }

    private calculateMenuBGWidth() {
        // return this.game.device.os.iOS ? window.innerWidth : 320;
        return window.innerWidth;
    }
}
