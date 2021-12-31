/// <reference path="../node_modules/phaser/types/phaser.d.ts"/>

import 'phaser';
import { BootScene } from './scenes/boot';
import { PreloadScene } from './scenes/preload';
import { GameTitleScene } from './scenes/gameTitle';
import { SiteScene } from './scenes/site';
import { GameOverScene } from './scenes/gameOver';

import { WORLD_WIDTH, WORLD_HEIGHT, INVENTORY_REGISTRY_KEY, UI_SCENE_KEY, GAME_BG_COLOR, SITE_TYPES, IS_DEBUG, SITE_COMPLETE_SCENE_KEY } from './constants';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { UIScene } from './scenes/uiScene';
import { SiteCompleteScene } from './scenes/siteComplete';

const config: Phaser.Types.Core.GameConfig = {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: GAME_BG_COLOR,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        // autoCenter: 1,
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT
    },
    render: {
        pixelArt: true,
        roundPixels: true,
        antialias: false,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: IS_DEBUG,
            gravity: {
                y: 0,
            },
        },
    },
    zoom: 1,
    dom: {
        createContainer: true,
    },
    input: {
        gamepad: true,
    }
};

export class Game extends Phaser.Game {

    constructor(config: Phaser.Types.Core.GameConfig) {

        super(config);

        this.registry.set(INVENTORY_REGISTRY_KEY, 0);

        this.scene.add('Boot', BootScene, false);
        this.scene.add('Preload', PreloadScene, false);
        this.scene.add('GameTitle', GameTitleScene, false);
        this.scene.add(SITE_TYPES.overworld, SiteScene, false);
        this.scene.add(SITE_TYPES.site, SiteScene, false);
        this.scene.add(UI_SCENE_KEY, UIScene, false);
        this.scene.add('GameOver', GameOverScene, false);
        this.scene.add(SITE_COMPLETE_SCENE_KEY, SiteCompleteScene, false);

        this.scene.start('Boot');

        if (Capacitor.isNativePlatform()) {
            StatusBar.hide()
                .catch(console.log);
            SplashScreen.hide();
        }
    }

}

new Game(config);