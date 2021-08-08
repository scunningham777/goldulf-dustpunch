import 'phaser';
import { BootScene } from './scenes/boot';
import { PreloadScene } from './scenes/preload';
import { GameTitleScene } from './scenes/gameTitle';
import { SiteScene } from './scenes/site';
import { GameOverScene } from './scenes/gameOver';

import { WORLD_WIDTH, WORLD_HEIGHT, POINTS_REGISTRY_KEY, UI_SCENE_KEY, GAME_BG_COLOR, SITE_TYPES } from './constants';

import { Plugins } from '@capacitor/core';
import { UIScene } from './scenes/uiScene';

const config: Phaser.Types.Core.GameConfig = {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: GAME_BG_COLOR,
    render: {
        pixelArt: true,
        roundPixels: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                y: 0,
            },
        },
    },
    zoom: 1,
};

const { StatusBar, SplashScreen } = Plugins;

export class Game extends Phaser.Game {

    constructor(config: Phaser.Types.Core.GameConfig) {

        super(config);

        this.registry.set(POINTS_REGISTRY_KEY, 0);

        this.scene.add('Boot', BootScene, false);
        this.scene.add('Preload', PreloadScene, false);
        this.scene.add('GameTitle', GameTitleScene, false);
        this.scene.add(SITE_TYPES.overworld, SiteScene, false);
        this.scene.add(SITE_TYPES.site, SiteScene, false);
        this.scene.add(UI_SCENE_KEY, UIScene, false);
        this.scene.add('GameOver', GameOverScene, false);

        this.scene.start('Boot');

        StatusBar.hide()
            .catch(console.log);
        SplashScreen.hide();

    }

}

new Game(config);