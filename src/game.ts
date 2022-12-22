/// <reference path="../node_modules/phaser/types/phaser.d.ts"/>

import 'phaser';
import { BootScene } from './scenes/boot';
import { PreloadScene } from './scenes/preload';
import { GameTitleScene } from './scenes/gameTitle';
import { SiteScene } from './scenes/site';
import { GameOverScene } from './scenes/gameOver';

import { WORLD_WIDTH, WORLD_HEIGHT, INVENTORY_STUFF_REGISTRY_KEY, UI_SCENE_KEY, GAME_BG_COLOR_HEX_STRING, SITE_TYPES, IS_DEBUG, SITE_COMPLETE_SCENE_KEY, SITE_DATA_REGISTRY_KEY, INVENTORY_STUFF_REGISTRY_KEY__OLD } from './constants';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { UIScene } from './scenes/uiScene';
import { SiteCompleteScene } from './scenes/siteComplete';
import { Storage } from './objects/storage';
import { StuffInInventory } from './interfaces/stuffInInventory';
import { SiteGenerationData } from './interfaces/siteGenerationData';

const config: Phaser.Types.Core.GameConfig = {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: GAME_BG_COLOR_HEX_STRING,
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
    private dataStore = new Storage();

    constructor(config: Phaser.Types.Core.GameConfig) {

        super(config);

        this.scene.add('Boot', BootScene, false);
        this.scene.add('Preload', PreloadScene, false);
        this.scene.add('GameTitle', GameTitleScene, false);
        this.scene.add(SITE_TYPES.overworld, SiteScene, false);
        this.scene.add(SITE_TYPES.site, SiteScene, false);
        this.scene.add(UI_SCENE_KEY, UIScene, false);
        this.scene.add('GameOver', GameOverScene, false);
        this.scene.add(SITE_COMPLETE_SCENE_KEY, SiteCompleteScene, false);

        Promise.all([
            this.dataStore.get(SITE_DATA_REGISTRY_KEY),
            this.dataStore.get(INVENTORY_STUFF_REGISTRY_KEY).then(stuff => {
                if (stuff) {
                    return stuff;
                } else {
                    return this.dataStore.get(INVENTORY_STUFF_REGISTRY_KEY__OLD).then(oldStuff => {
                        this.dataStore.set(INVENTORY_STUFF_REGISTRY_KEY, oldStuff);
                        this.dataStore.remove(INVENTORY_STUFF_REGISTRY_KEY__OLD);
                    });
                } 
            })
        ])
        .then(([siteData, inventory]: [(SiteGenerationData | null), (StuffInInventory[] | null)]) => {
            if (!!siteData) {
                this.registry.set(SITE_DATA_REGISTRY_KEY, siteData);
            }
            this.registry.set(INVENTORY_STUFF_REGISTRY_KEY, inventory || []);
    
            this.registry.events.on('changedata', this.updateDataStore, this);

            this.scene.start('Boot');
        })
        

        if (Capacitor.isNativePlatform()) {
            StatusBar.hide()
                .catch(console.log);
            SplashScreen.hide();
        }

    }

    private updateDataStore(_parent: any, key: string, data: any) {
        if (key === INVENTORY_STUFF_REGISTRY_KEY) {
            this.dataStore.set(INVENTORY_STUFF_REGISTRY_KEY, data);
        }
        if (key === SITE_DATA_REGISTRY_KEY) {
            this.dataStore.set(SITE_DATA_REGISTRY_KEY, data);
        }
    }

}

new Game(config);