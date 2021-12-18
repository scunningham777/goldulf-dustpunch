import Hero from "../objects/hero";
import { CARDINAL_DIRECTION } from "../utils";

export interface SiteCompleteSceneProps {
    heroDisplayX: number;
    heroDisplayY: number;
    heroDirection: CARDINAL_DIRECTION;
}

export class SiteCompleteScene extends Phaser.Scene {
    private hero: Hero;
    private background: Phaser.GameObjects.Rectangle;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    
    create(): void {
        const {heroDisplayX, heroDisplayY, heroDirection} = this.scene.settings.data as SiteCompleteSceneProps;
        this.hero = new Hero(heroDisplayX, heroDisplayY, this, 0, heroDirection)
        // maybe tween this opacity?
        this.background = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000, .7);
    }
}