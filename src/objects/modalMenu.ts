import { ModalMenuConfig } from "../interfaces/modalMenuConfig";
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import { GAME_SCALE, UI_TEXTURE_KEY } from "../constants";
import { calculateGamepad, CARDINAL_DIRECTION } from "../utils";
import { EntityMovementController } from "../interfaces/heroMovementController";
import { JOYSTICK_HERO_MOVEMENT_CONTROLLER } from "./joystickHeroMovementController";
import { TouchEnabledWithEntity } from "../interfaces/touchEnabledWithEntity";

export class ModalMenu implements TouchEnabledWithEntity {
    public touchStartX: number = null;
    public touchStartY: number = null;
    public touchMoveThreshold = 30;
    private layer: Phaser.GameObjects.Layer;
    private bg: RoundRectangle;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private enterKey: Phaser.Input.Keyboard.Key;
    private mvtCtrl: EntityMovementController = JOYSTICK_HERO_MOVEMENT_CONTROLLER;
    private currentSelectionIndex = 0;
    private cursor: Phaser.GameObjects.Image;
    public get entity() {
        return this.bg;
    }

    constructor(
        private scene: Phaser.Scene,
        private config: ModalMenuConfig
    ) {
        this.bg = new RoundRectangle(scene, config.x, config.y, config.width, config.height, 4 * GAME_SCALE, 0x000000);
        this.bg.setOrigin(.5, 0)
                .setStrokeStyle(GAME_SCALE, 0xffffff);
        scene.add.existing(this.bg);
        this.layer = scene.add.layer([this.bg]);
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.enterKey = this.scene.input.keyboard.addKey('ENTER');

        const cursorPadding = config.showCursor ? 20 * GAME_SCALE : 0;
        config.items.forEach((item, index) => {
            const {x: itemX, y: itemY} = this.determineItemBaseCoords(index);
            const itemLabel = scene.add.text(
                itemX + cursorPadding,
                itemY,
                item.text,
                {font: `${16 * GAME_SCALE}px '7_12'`, color: '#fff'}
            );
            // TODO: add click handler
            this.layer.add(itemLabel);
        });

        if (config.showCursor) {
            const {x: cursorX, y: cursorY} = this.determineItemBaseCoords(this.currentSelectionIndex);
            this.cursor = scene.add.image(cursorX, cursorY, UI_TEXTURE_KEY, 0);
            this.cursor.setScale(GAME_SCALE)
                    .setOrigin(0,0);
            this.layer.add(this.cursor);
        }
    }

    public update() {
        if (!this.layer.visible) {
            return;
        }
        const pointer = this.scene.input.activePointer;
        const gamepadDirections = calculateGamepad(this.scene.input.gamepad.gamepads[0]);
        if (this.config.showCursor && Phaser.Input.Keyboard.JustDown(this.cursors.up) || gamepadDirections.up || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.UP)) {
            if (this.currentSelectionIndex == 0) {
                this.currentSelectionIndex = this.config.items.length - 1;
            } else {
                this.currentSelectionIndex -= 1;
            }
            this.updateCursorPosition();
        } else if (this.config.showCursor && Phaser.Input.Keyboard.JustDown(this.cursors.down) || gamepadDirections.down || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.DOWN)) {
            if (this.currentSelectionIndex == this.config.items.length - 1) {
                this.currentSelectionIndex = 0;
            } else {
                this.currentSelectionIndex += 1;
            }
            this.updateCursorPosition();
        } else if (this.config.showCursor && Phaser.Input.Keyboard.JustDown(this.cursors.right) || gamepadDirections.right || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.RIGHT)) {
            this.currentSelectionIndex += Math.ceil(this.config.items.length / this.config.numColumns);
            // not gonna work if items.length is not divisible by numColumns
            // if (this.config.items.length % this.config.numColumns === 1 && this.currentSelectionIndex >= this.config.items.length) {
            //     this.currentSelectionIndex -= 1;
            // }
            this.currentSelectionIndex %= this.config.items.length;
            this.updateCursorPosition();
        } else if (this.config.showCursor && Phaser.Input.Keyboard.JustDown(this.cursors.left) || gamepadDirections.left || this.mvtCtrl.testDirection(this, pointer, CARDINAL_DIRECTION.LEFT)) {
            this.currentSelectionIndex += this.config.items.length - Math.ceil(this.config.items.length / this.config.numColumns);
            this.currentSelectionIndex %= this.config.items.length;
            this.updateCursorPosition();
        } else if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.config.items[this.currentSelectionIndex].onSelect();
        }
    }

    public toggleVisibility(visible?: boolean) {
        if (visible != undefined) {
            this.layer.setVisible(visible);
        } else {
            this.layer.setVisible(!this.layer.visible);
        }
    }

    private determineItemBaseCoords(index: number): Phaser.Math.Vector2 {
        const itemsPerCol = Math.ceil(this.config.items.length / this.config.numColumns)
        const gapHeight = this.config.height / itemsPerCol;
        const gapWidth = this.config.width / this.config.numColumns;
        const textPadding = 4 * GAME_SCALE;

        const itemX = gapWidth * Math.floor(index / itemsPerCol) + (this.bg.x - this.bg.displayWidth * this.bg.originX) + textPadding;
        const itemY = gapHeight * (index % itemsPerCol) + this.bg.y + textPadding;
        return new Phaser.Math.Vector2(itemX, itemY);
    }

    private updateCursorPosition() {
        if (this.cursor) {
            const {x: cursorX, y: cursorY} = this.determineItemBaseCoords(this.currentSelectionIndex);
            this.cursor.setPosition(cursorX, cursorY);
        }
    }
}