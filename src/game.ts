import 'phaser';
import { BootScene } from './scenes/boot';
import { PreloadScene } from './scenes/preload';
import { GameTitleScene } from './scenes/game-title';
import { MainScene } from './scenes/main';
import { GameOverScene } from './scenes/game-over';

import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';

import { Plugins } from '@capacitor/core';

const config: Phaser.Types.Core.GameConfig = {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#93e7ff',
    render: {
        pixelArt: true,
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

        this.scene.add('Boot', BootScene, false);
        this.scene.add('Preload', PreloadScene, false);
        this.scene.add('GameTitle', GameTitleScene, false);
        this.scene.add('Main', MainScene, false);
        this.scene.add('GameOver', GameOverScene, false);

        this.scene.start('Boot');

        StatusBar.hide()
            .catch(console.log);
        SplashScreen.hide();

    }

}

new Game(config);