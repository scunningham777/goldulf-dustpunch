import { Hero } from '../objects/hero';
import { GAME_SCALE, DUNGEON_LAYER_KEYS, EXIT_COLLISION_EVENT_KEY, SITE_TYPES, PLAY_MODE, SHOW_MENU_REGISTRY_KEY, SHOW_SETTINGS_REGISTRY_KEY, HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY, STATIC_TEXTURE_KEY, SITE_COMPLETE_SCENE_KEY, GATED_ENTRY_SCENE_KEY, HERO_FRAMES, HERO_VELOCITY, HERO_DEBUG_VELOCITY_MULTIPLIER, SITE_DATA_REGISTRY_KEY, TOUCH_MOVEMENT_REGISTRY_KEY, INVENTORY_TOKENS_REGISTRY_KEY, GAME_BG_COLOR, GATE_SITE_BG_COLOR, HERO_TINT, UI_BAR_HEIGHT, SPIN_DUST_BREAK_EVENT_KEY, INVENTORY_RELICS_REGISTRY_KEY, AUDIO_MUTE_REGISTRY_KEY, WALL_BREAK_EVENT_KEY, EXIT_SITE_REQUEST_KEY, JUMP_TO_SITE_REQUEST_KEY, PLAY_MODES } from '../constants';
import { CARDINAL_DIRECTION, justInsideWall, weightedRandomizeAnything } from '../utils';
import { SiteConfig } from '../interfaces/siteConfig';
import { MAP_CONFIGS, STUFF_CONFIGS } from '../config';
import { MapArea } from '../interfaces/mapArea';
import { StuffModel } from '../siteGenerator/stuffModel';
import { Stuff } from '../objects/stuff';
import { DustModel } from '../siteGenerator/dustModel';
import { Dust } from '../objects/dust';
import { Exit } from '../objects/exit';
import { SiteCompleteSceneProps } from './siteComplete';
import { GatedEntrySceneProps } from './gatedEntry';
import { SiteGenerationData } from '../interfaces/siteGenerationData';
import { GeneratorMapping } from '../siteGenerator/siteGenerator';
import { InventoryItem } from '../interfaces/stuffInInventory';
export class SiteScene extends Phaser.Scene {
    private mapKey: string;
    private mapConfig: SiteConfig;
    private hero: Hero;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private escKey: Phaser.Input.Keyboard.Key;
    private map: Phaser.Tilemaps.Tilemap;
    private mapLayer: Phaser.Tilemaps.TilemapLayer;
    private areas: MapArea[] = [];
    private stuffGroup: Phaser.Physics.Arcade.Group;
    private dustGroup: Phaser.Physics.Arcade.Group;
    private exitGroup: Phaser.Physics.Arcade.Group;
    private hasHeroReachedExit = false;
    private burstEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private get greatestXCoord(): number {
        return this.map.width - 1;
    }
    private get greatestYCoord(): number {
        return this.map.height - 1;
    }

    /* lifecycle methods */
    init(): void {
        this.mapKey = this.scene.key + '-map';
        this.stuffGroup = this.physics.add.group();
        this.stuffGroup.runChildUpdate = true;
    }

    create(): void {
        this.selectMapConfig();
        this.createMap();
        this.createHero();
        this.createEmitter();
        this.addListeners();
        this.addCollisions();
        this.initInput();
        this.initCamera();
        this.initRegistry();

        this.begin();
    }

    update(): void {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.shift) && !this.registry.get(SHOW_SETTINGS_REGISTRY_KEY)) {
            this.registry.set(SHOW_MENU_REGISTRY_KEY, !this.registry.get(SHOW_MENU_REGISTRY_KEY));
        }
        if (Phaser.Input.Keyboard.JustDown(this.escKey) && !this.registry.get(SHOW_MENU_REGISTRY_KEY)) {
            this.registry.set(SHOW_SETTINGS_REGISTRY_KEY, !this.registry.get(SHOW_SETTINGS_REGISTRY_KEY));
        }

        if (!!this.hero) {
            this.hero.update(this.cursors, this.input.gamepad.gamepads[0]);
        }
    }
    /* end lifecycle */

    selectMapConfig() {
        this.mapConfig = MAP_CONFIGS[this.scene.key].find(mc => mc.mapConfigName == this.scene.settings.data['mapConfigName'])
            ?? Phaser.Math.RND.pick(MAP_CONFIGS[this.scene.key]);
    }

    createMap() {
        const savedSiteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
        const useSavedSite: boolean = !!savedSiteData && savedSiteData.siteType == this.mapConfig.siteType && savedSiteData.siteConfigName == this.mapConfig.mapConfigName;
        const siteWidth = useSavedSite ? savedSiteData.siteWidth : Phaser.Math.RND.integerInRange(this.mapConfig.minMapWidth, this.mapConfig.maxMapWidth);
        const siteHeight = useSavedSite ? savedSiteData.siteHeight : Phaser.Math.RND.integerInRange(this.mapConfig.minMapHeight, this.mapConfig.maxMapHeight)
        this.map = this.make.tilemap({
            tileWidth: this.mapConfig.tileWidth,
            tileHeight: this.mapConfig.tileHeight,
            width: siteWidth,
            height: siteHeight,
            key: this.mapKey,
        });
        const inventoryTokens: InventoryItem[] = this.registry.get(INVENTORY_TOKENS_REGISTRY_KEY) || [];
        const inventoryRelics: InventoryItem[] = this.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const siteData: SiteGenerationData = useSavedSite ? savedSiteData : (GeneratorMapping[this.mapConfig.siteGenerationType])?.generateSite(
            this.mapConfig,
            siteWidth,
            siteHeight,
            inventoryTokens,
            inventoryRelics
        );

        if (!useSavedSite) {
            // persist mapData
            this.registry.set(SITE_DATA_REGISTRY_KEY, siteData);
        }
        
        const newTileset = this.map.addTilesetImage(
            this.mapConfig.tilesetKey,
            this.mapConfig.tilesetKey,
            this.mapConfig.tileWidth,
            this.mapConfig.tileHeight,
            this.mapConfig.tilesetMargin ?? 0,
            this.mapConfig.tileSpacing ?? 0
        );
        this.mapLayer = this.map.createBlankLayer(DUNGEON_LAYER_KEYS.BG_LAYER, newTileset);
        
        for (let y = 0; y < siteData.tileIndexData.length; y++) {
            for (let x = 0; x < siteData.tileIndexData[y].length; x++) {
                const tileIndex = siteData.tileIndexData[y][x];
                if (tileIndex !== null && tileIndex !== undefined) {
                    this.mapLayer.putTileAt(tileIndex, x, y);
                }
            }
        }
        this.mapLayer.setScale(GAME_SCALE);

        this.areas = siteData.areas;
        this.exitGroup = this.createExits(siteData.areas.filter(a => a.linkedMapConfigName != null))
        if (siteData.dust.length > 0){
            this.dustGroup = this.createDust(siteData.dust);
        }
        this.tintMap();
    }
    
    createHero() {
        this.hasHeroReachedExit = false;

        const savedSiteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
        const entranceLocation = new Phaser.Math.Vector2(savedSiteData.heroSpawnCoords) || this.getEntranceLocation() || new Phaser.Math.Vector2(1,1);
        const heroStartLocation = justInsideWall(entranceLocation, this.greatestXCoord, this.greatestYCoord);
        const heroStartXInPixels = (heroStartLocation.x + .5) * (this.map.tileWidth * GAME_SCALE);
        const heroStartYInPixels = (heroStartLocation.y + .5) * (this.map.tileHeight * GAME_SCALE);
        // determine start direction based on location of entrance;
        let heroStartDirection = CARDINAL_DIRECTION.DOWN;
        if (entranceLocation.x === 0) {
            heroStartDirection = CARDINAL_DIRECTION.RIGHT;
        } else if (entranceLocation.x === this.greatestXCoord) {
            heroStartDirection = CARDINAL_DIRECTION.LEFT;
        } else if (entranceLocation.y === this.greatestYCoord) {
            heroStartDirection = CARDINAL_DIRECTION.UP;
        }
        const heroMvtCtrl = this.registry.get(HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY);
        this.hero = new Hero(
            heroStartXInPixels,
            heroStartYInPixels,
            this,
            HERO_VELOCITY * (PLAY_MODE !== PLAY_MODES.prod ? HERO_DEBUG_VELOCITY_MULTIPLIER : 1),
            heroStartDirection,
            heroMvtCtrl
        );
        this.hero.isPunching = this.scene.key !== SITE_TYPES.overworld;
    }

    createEmitter() {
        this.burstEmitter = this.add.particles(0, 0, '__WHITE', {
            speed: { min: 0, max: 50 },
            angle: { min: 0, max: 360 },
            lifespan: 1200,
            emitting: false,
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(-8 * GAME_SCALE, -8 * GAME_SCALE, 16 * GAME_SCALE, 16 * GAME_SCALE),
                quantity: 1
            }
        });
    }

    addListeners() {
        this.registry.events.on(EXIT_COLLISION_EVENT_KEY, this.nextMap, this);
        this.registry.events.on('changedata', this.registryChangeHandler, this);
        this.registry.events.on(SPIN_DUST_BREAK_EVENT_KEY, this.spinDustBreakHandler, this);
        this.registry.events.on(WALL_BREAK_EVENT_KEY, this.wallBreakHandler, this);
        this.registry.events.on(EXIT_SITE_REQUEST_KEY, this.exitToOverworld, this);
        this.registry.events.on(JUMP_TO_SITE_REQUEST_KEY, this.jumpToSite, this);
        this.input.gamepad.on('down', this.gamepadDownHandler, this);
        this.events.once('shutdown', this.clearListeners, this);
    }
    clearListeners() {
        this.registry.events.off(EXIT_COLLISION_EVENT_KEY, this.nextMap, this);
        this.registry.events.off('changedata', this.registryChangeHandler, this);
        this.registry.events.off(SPIN_DUST_BREAK_EVENT_KEY, this.spinDustBreakHandler, this);
        this.registry.events.off(WALL_BREAK_EVENT_KEY, this.wallBreakHandler, this);
        this.registry.events.off(EXIT_SITE_REQUEST_KEY, this.exitToOverworld, this);
        this.registry.events.off(JUMP_TO_SITE_REQUEST_KEY, this.jumpToSite, this);
        this.input.gamepad.off('down', this.gamepadDownHandler);
        this.stopAudio();
    }

    addCollisions() {
        // corral the hero within the map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * GAME_SCALE, this.map.heightInPixels * GAME_SCALE);
        this.hero.entity.setCollideWorldBounds(true);

        // collisions between hero and walls, and "broken" entrance if it's wall-placed
        const collisionIndices = [...this.mapConfig.wallTileWeights.map(wtw => wtw.index), ...this.mapConfig.pathObstructionTileWeights?.map(otw => otw.index) ?? []];
        const entranceLoc = this.getEntranceLocation();
        if (entranceLoc.x === 0 || entranceLoc.x === this.greatestXCoord || entranceLoc.y === 0 || entranceLoc.y === this.greatestYCoord) {
            collisionIndices.push(this.mapConfig.entranceAreaConfig.focusTileIndex);
        }

        this.mapLayer.setCollision(collisionIndices);
        this.physics.add.collider(this.hero.entity, this.mapLayer);
        this.physics.add.overlap(this.hero.entity, this.exitGroup, this.exitCollision, null, this);
        if (this.dustGroup != null) {
            this.physics.add.overlap(this.hero.entity, this.dustGroup, this.dustCollision, null, this);
        }
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    initCamera() {
        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = this.cameras.main;

        // Set bg color so we can tween for gated sites
        camera.setBackgroundColor(GAME_BG_COLOR);

        // Constrain the camera so that it isn't allowed to move outside the width/height
        // of the tilemap.  We subtract the UI bar height from the bottom bound so that
        // the lowest row of tiles is always visible above the overlaying UI elements.
        const setCameraBounds = () => {
            camera.setBounds(
                0,
                0,
                this.map.widthInPixels * GAME_SCALE,
                this.map.heightInPixels * GAME_SCALE + UI_BAR_HEIGHT
            );
        };

        setCameraBounds();
        // keep bounds up to date if the canvas is resized (orientation change, etc.)
        this.scale.on('resize', setCameraBounds);

        // follow the hero; offset the camera upwards by half the UI bar height so that
        // the hero (and bottom row) never sit directly underneath the overlay.
        camera.startFollow(this.hero.entity, true, 0.1, 0.1, 0, UI_BAR_HEIGHT / 2);
    }

    initRegistry() {
        this.registry.set(SHOW_MENU_REGISTRY_KEY, false);
        this.registry.set(SHOW_SETTINGS_REGISTRY_KEY, false);
        this.sound.mute = this.registry.get(AUDIO_MUTE_REGISTRY_KEY) ?? false;
    }

    begin() {
        this.hero.freeze();
        const cam = this.cameras.main;
        cam.fadeIn(500)
        cam.once('camerafadeincomplete', () => {
            if (this.mapConfig.mapConfigName != 'new_game') {
                this.sound.play('dust', {rate: .2});
                this.sound.play('dust', {delay: .5, rate: .4});
                cam.shake(1000, .025);
                this.time.delayedCall(300, () => {
                    const entrance = this.getEntranceLocation();
                    this.burstEmitter.explode(24, (entrance.x + .5) * (this.map.tileWidth * GAME_SCALE), (entrance.y + .5) * (this.map.tileHeight * GAME_SCALE));
                });
                this.time.delayedCall(1000, () => {
                    this.hero.unfreeze();
                    if (!this.sound.isPlaying(this.mapConfig.songTitle)) {
                        this.sound.play(this.mapConfig.songTitle, {loop: true, volume: .7 });
                    }
                });
            } else {
                this.time.delayedCall(200, () => {
                    this.hero.unfreeze();
                    if (!this.sound.isPlaying(this.mapConfig.songTitle)) {
                        this.sound.play(this.mapConfig.songTitle, {loop: true, volume: .7 });
                    }
                });
            }
        });
    }


    createExits(exitData: MapArea[]): Phaser.Physics.Arcade.Group {
        const exitGroup = this.physics.add.group();
        for (let exit of exitData) {
            const imageIndex = exit.focusTileIndex != null
                ? exit.focusTileIndex
                : MAP_CONFIGS[exit.linkedMapConfigType].find(mc => mc.mapConfigName == exit.linkedMapConfigName)?.externalIconTileIndex;
            const exitX = (exit.focusX + .5) * this.map.tileWidth * GAME_SCALE;
            const exitY = (exit.focusY + .5) * this.map.tileWidth * GAME_SCALE;
            const newExit = new Exit(
                this,
                exitX, exitY,
                this.mapConfig.tilesetKey, imageIndex,
                '' + new Date().getTime(),
                exit.linkedMapConfigType, exit.linkedMapConfigName,
                exit.requiredTokens
            );
            exitGroup.add(newExit);
        }
        return exitGroup;
    }

    createStuff(stuffData: StuffModel): void {
        const newStuffConfig = STUFF_CONFIGS.find(s => s.stuffName === stuffData.stuffConfigId);
        if (newStuffConfig === undefined) {
            return;
        }
        const newStuff = new Stuff(this, stuffData.x, stuffData.y, stuffData.textureKey, newStuffConfig);
        this.stuffGroup.add(newStuff);
    }

    createDust(dustData: DustModel[]): Phaser.Physics.Arcade.Group {
        const dustGroup = this.physics.add.group();
        for (let dust of dustData) {
            const newDust = new Dust(this, dust.x, dust.y, dust.key, dust.frame, dust.id);
            dustGroup.add(newDust);
        }
        return dustGroup;
    }

    tintMap() {
        // Initialize with first tint
        this.mapLayer.forEachTile(t => t.tint = this.mapConfig.tileTints[0]);
        this.exitGroup.children.iterate((exit: Phaser.GameObjects.GameObject) => {
            const exitMapConfig: SiteConfig = MAP_CONFIGS.site.find(mc => mc.mapConfigName == (exit as Exit).linkedMapConfigName);
            const exitTint = !!exitMapConfig ? exitMapConfig.tileTints[0] : this.mapConfig.tileTints[0];
            (exit as Exit).setTint(exitTint);
            return true;
        }, this);

        // If multiple tints exist, set up cycling tween
        if (this.mapConfig.tileTints.length > 1) {
            let currentTintIndex = 0;
            let lastUpdateTime = 0;

            const tweenToNext = () => {
                const source = Phaser.Display.Color.ValueToColor(this.mapConfig.tileTints[currentTintIndex]);
                const nextIndex = (currentTintIndex + 1) % this.mapConfig.tileTints.length;
                const dest = Phaser.Display.Color.ValueToColor(this.mapConfig.tileTints[nextIndex]);

                this.tweens.add({
                    targets: source,
                    red: dest.red,
                    green: dest.green,
                    blue: dest.blue,
                    duration: 1200,
                    ease: 'Linear',
                    onUpdate: () => {
                        const currentTime = Date.now();
                        if (currentTime - lastUpdateTime >= 300) {
                            const tweenedTint = Phaser.Display.Color.GetColor(
                                Math.floor(source.red),
                                Math.floor(source.green),
                                Math.floor(source.blue)
                            );
                            this.mapLayer.forEachTile(t => t.tint = tweenedTint);
                            this.exitGroup.children.iterate((exit: Phaser.GameObjects.GameObject) => {
                                (exit as Exit).setTint(tweenedTint);
                                return true;
                            }, this);
                            lastUpdateTime = currentTime;
                        }
                    },
                    onComplete: () => {
                        currentTintIndex = nextIndex;
                        lastUpdateTime = 0;
                        tweenToNext();
                    }
                });
            };

            tweenToNext();
        }
    }

    nextMap(exitConfig?: {linkedMapSceneType: SITE_TYPES, linkedMapConfigName: string, requiredTokens?: { [tokenKey: string]: number }, x?: number, y?: number}) {
        if (exitConfig?.linkedMapSceneType === SITE_TYPES.gatedSite) {
            this.beginGatedEntry(exitConfig);
            return;
        }

        this.hasHeroReachedExit = true;
        this.hero.freeze();
        this.clearListeners();
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0, false, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
            if (progress >= .5) {
                
            }
        });
        this.stopAudio();
        cam.once('camerafadeoutcomplete', () => {
            // deduct any tokens required by the exit before changing scenes
            if (exitConfig?.requiredTokens) {
                const inventory: InventoryItem[] =
                    this.registry.get(INVENTORY_TOKENS_REGISTRY_KEY) || [];
                Object.entries(exitConfig.requiredTokens).forEach(([key, qty]) => {
                    const item = inventory.find(i => i.inventoryItemKey === key);
                    if (item) {
                        item.quantity = Math.max(0, item.quantity - qty);
                    }
                });
                // retain zero-quantity entries to differentiate from entries that have never been collected
                this.registry.set(INVENTORY_TOKENS_REGISTRY_KEY, inventory);
            }

            const sceneConfig = {
                mapConfigName: exitConfig?.linkedMapConfigName,
            };
            this.scene.start(exitConfig.linkedMapSceneType, sceneConfig);
        });
    }

    beginGatedEntry(exitConfig: {linkedMapSceneType: SITE_TYPES, linkedMapConfigName: string, requiredTokens?: { [tokenKey: string]: number }, x?: number, y?: number}) {
        this.hasHeroReachedExit = true;
        this.hero.freeze();
        this.stopAudio();
        this.hero.entity.setFrame(HERO_FRAMES.standing[this.hero.currentDirection]);

        const cam = this.cameras.main;
        // this scene keeps running (and its camera keeps easing toward the hero via
        // its smoothed follow) underneath the launched overlay scene, so lock scroll
        // in place now -- otherwise it keeps drifting for a few frames after this
        // snapshot is taken, and the in-place Exit (never hidden, unlike the hero)
        // visibly slides out from under the overlay's static copy of its icon
        cam.stopFollow();

        // fall back to the hero's position (matching the old hard-coded placement) if the
        // exit's world position wasn't provided, e.g. when jumping straight to a site via
        // the debug menu rather than colliding with an actual Exit
        const entranceDisplayX = exitConfig.x != null ? exitConfig.x - cam.scrollX : this.hero.entity.x - cam.scrollX + this.hero.entity.displayWidth;
        const entranceDisplayY = exitConfig.y != null ? exitConfig.y - cam.scrollY : this.hero.entity.y - cam.scrollY;

        const gatedEntryProps: GatedEntrySceneProps = {
            heroDisplayX: this.hero.entity.x - cam.scrollX,
            heroDisplayY: this.hero.entity.y - cam.scrollY,
            heroDirection: this.hero.currentDirection,
            entranceDisplayX,
            entranceDisplayY,
            callingSceneKey: this.scene.key as SITE_TYPES,
            exitConfig,
        };
        this.scene.launch(GATED_ENTRY_SCENE_KEY, gatedEntryProps);

        this.hero.entity.setVisible(false);
    }

    dustCollision = (_heroObj: Phaser.Types.Physics.Arcade.GameObjectWithBody, dustObj: Phaser.Types.Physics.Arcade.GameObjectWithBody) => {
        const dust = dustObj as Dust;
        if (this.hero.isPunching) {
            dust.clearDust();

            // update saved Dust list and Hero respawn point
            const savedSiteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
            const destroyedDustCoords = this.map.worldToTileXY(dust.x, dust.y);
            const destroyedDustIndex = savedSiteData?.dust?.findIndex(d => d.id == dust.id) ?? -1;
            if (destroyedDustIndex > -1 && this.dustGroup.getChildren().length > 0) {
                savedSiteData.dust.splice(destroyedDustIndex, 1);
                this.registry.set(SITE_DATA_REGISTRY_KEY, {...savedSiteData, heroSpawnCoords: destroyedDustCoords});
            }
            
            if (this.dustGroup.getChildren().length == 0) {
                this.performSiteCompleteEmitterBurst(dust.x, dust.y);
                this.sound.play('dust', {rate: .4});
                this.sound.play('dust', {delay: .5, rate: .5});
                this.completeSite();
            } else {
                this.burstEmitter.explode(28, dust.x, dust.y);
                this.sound.play('dust');
                const stuffType = weightedRandomizeAnything(this.mapConfig.stuffTypeWeights);
                
                if (STUFF_CONFIGS.find(s => s.stuffName == stuffType)) {
                    const newStuff = new StuffModel(
                        dust.x,
                        dust.y,
                        STATIC_TEXTURE_KEY,
                        stuffType,  
                    );
                    this.createStuff(newStuff);
                }

                // Crown relic chain reaction: 50% chance per crown to blow up nearby dust
                const relics = this.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
                const crown = relics.find((item: any) => item.inventoryItemKey === 'crown');
                const crownQuantity = crown ? crown.quantity : 0;
                
                for (let i = 0; i < crownQuantity; i++) {
                    if (Math.random() < 0.5) { // 50% chance per crown
                        this.triggerCrownChainReaction(dust.x, dust.y, 0, crownQuantity);
                    }
                }
            }
        }
    }

    triggerCrownChainReaction = (x: number, y: number, depth: number = 0, maxDepth: number = 0) => {
        // Don't allow chaining beyond the maximum depth
        if (depth >= maxDepth) {
            return;
        }

        if (this.dustGroup != null) {
            // Find all dust within 2.5 squares (2.5 * 16 pixels * GAME_SCALE)
            const chainRadius = 2.5 * 16 * GAME_SCALE;
            const nearbyDust: Dust[] = [];
            
            this.dustGroup.getChildren().forEach((dustObj) => {
                const dust = dustObj as Dust;
                const distance = Phaser.Math.Distance.Between(x, y, dust.x, dust.y);
                if (distance <= chainRadius && distance > 0) { // distance > 0 to exclude the original dust
                    nearbyDust.push(dust);
                }
            });
            
            // If there are nearby dust particles, pick one randomly and destroy it after 200ms delay
            if (nearbyDust.length > 0) {
                const randomDust = Phaser.Utils.Array.GetRandom(nearbyDust);
                this.time.delayedCall(200, () => {
                    this.destroyDustForCrownChain(randomDust, depth + 1, maxDepth);
                }, [], this);
            }
        }
    }

    destroyDustForCrownChain = (dust: Dust, depth: number = 0, maxDepth: number = 0) => {
        // Safety check: ensure dust still exists and is active
        if (!dust || !dust.active) {
            return;
        }

        dust.clearDust();

        // update saved Dust list and Hero respawn point
        const savedSiteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
        const destroyedDustCoords = this.map.worldToTileXY(dust.x, dust.y);
        const destroyedDustIndex = savedSiteData?.dust?.findIndex(d => d.id == dust.id) ?? -1;
        if (destroyedDustIndex > -1 && this.dustGroup.getChildren().length > 0) {
            savedSiteData.dust.splice(destroyedDustIndex, 1);
            this.registry.set(SITE_DATA_REGISTRY_KEY, {...savedSiteData, heroSpawnCoords: destroyedDustCoords});
        }
        
        if (this.dustGroup.getChildren().length == 0) {
            this.performSiteCompleteEmitterBurst(dust.x, dust.y);
            this.sound.play('dust', {rate: .4});
            this.sound.play('dust', {delay: .5, rate: .5});
            this.completeSite();
        } else {
            this.burstEmitter.explode(28, dust.x, dust.y);
            this.sound.play('dust');
            const stuffType = weightedRandomizeAnything(this.mapConfig.stuffTypeWeights);
            
            if (STUFF_CONFIGS.find(s => s.stuffName == stuffType)) {
                const newStuff = new StuffModel(
                    dust.x,
                    dust.y,
                    STATIC_TEXTURE_KEY,
                    stuffType,  
                );
                this.createStuff(newStuff);
            }

            // Crown relic chain reaction: 50% chance per crown to blow up nearby dust
            const relics = this.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
            const crown = relics.find((item: any) => item.inventoryItemKey === 'crown');
            const crownQuantity = crown ? crown.quantity : 0;
            
            for (let i = 0; i < crownQuantity; i++) {
                if (Math.random() < 0.5) { // 50% chance per crown
                    this.triggerCrownChainReaction(dust.x, dust.y, depth, maxDepth);
                }
            }
        }
    }

    spinDustBreakHandler = (x: number, y: number, radius: number) => {
        if (this.dustGroup != null) {
            const dustToBreak: Dust[] = [];
            this.dustGroup.getChildren().forEach((dustObj) => {
                const dust = dustObj as Dust;
                const distance = Phaser.Math.Distance.Between(x, y, dust.x, dust.y);
                if (distance <= radius) {
                    dustToBreak.push(dust);
                }
            });
            
            dustToBreak.forEach(dust => {
                dust.clearDust();
                
                // update saved Dust list and Hero respawn point
                const savedSiteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
                const destroyedDustCoords = this.map.worldToTileXY(dust.x, dust.y);
                const destroyedDustIndex = savedSiteData?.dust?.findIndex(d => d.id == dust.id) ?? -1;
                if (destroyedDustIndex > -1 && this.dustGroup.getChildren().length > 0) {
                    savedSiteData.dust.splice(destroyedDustIndex, 1);
                    this.registry.set(SITE_DATA_REGISTRY_KEY, {...savedSiteData, heroSpawnCoords: destroyedDustCoords});
                }
                
                if (this.dustGroup.getChildren().length == 0) {
                    this.performSiteCompleteEmitterBurst(dust.x, dust.y);
                    this.sound.play('dust', {rate: .4});
                    this.sound.play('dust', {delay: .5, rate: .5});
                    this.completeSite();
                } else {
                    this.burstEmitter.explode(28, dust.x, dust.y);
                    this.sound.play('dust');
                    const stuffType = weightedRandomizeAnything(this.mapConfig.stuffTypeWeights);
                    
                    if (STUFF_CONFIGS.find(s => s.stuffName == stuffType)) {
                        const newStuff = new StuffModel(
                            dust.x,
                            dust.y,
                            STATIC_TEXTURE_KEY,
                            stuffType,  
                        );
                        this.createStuff(newStuff);
                    }
                }
            });
        }
    }

    wallBreakHandler = (tileX: number, tileY: number) => {
        // Check if player has cestus relic
        const relics = this.registry.get(INVENTORY_RELICS_REGISTRY_KEY) || [];
        const cestus = relics.find((item: any) => item.inventoryItemKey === 'cestus');
        if (!cestus || cestus.quantity === 0) {
            return;
        }

        // Get tile at coordinates
        const tile = this.mapLayer.getTileAt(tileX, tileY);
        if (!tile) {
            return;
        }

        // Check if it's a wall tile (wallTileWeights or pathObstructionTileWeights)
        const isWallTile = this.mapConfig.wallTileWeights.some(w => w.index === tile.index) ||
                          (this.mapConfig.pathObstructionTileWeights?.some(w => w.index === tile.index) ?? false);
        
        if (isWallTile) {
            this.destroyWallTile(tileX, tileY);
        }
    }

    destroyWallTile(tileX: number, tileY: number) {
        // Get a random floor tile from mapConfig
        const floorTileIndex = weightedRandomizeAnything(
            this.mapConfig.floorTileWeights.map(ftw => ({key: ftw.index, weight: ftw.weight}))
        );

        // Replace the wall tile with floor tile
        this.mapLayer.putTileAt(floorTileIndex, tileX, tileY);

        // Remove collision from this tile
        const tile = this.mapLayer.getTileAt(tileX, tileY);
        if (tile) {
            tile.setCollision(false, false, false, false);
        }

        // Play particle effect at tile center (convert tile to pixel coords)
        const tileWidthPixels = this.map.tileWidth * GAME_SCALE;
        const tileHeightPixels = this.map.tileHeight * GAME_SCALE;
        const effectX = (tileX + 0.5) * tileWidthPixels;
        const effectY = (tileY + 0.5) * tileHeightPixels;
        
        this.burstEmitter.explode(28, effectX, effectY);
        this.sound.play('dust');

        // Update saved site data
        const savedSiteData: SiteGenerationData = this.registry.get(SITE_DATA_REGISTRY_KEY);
        if (savedSiteData && savedSiteData.tileIndexData) {
            savedSiteData.tileIndexData[tileY][tileX] = floorTileIndex;
            this.registry.set(SITE_DATA_REGISTRY_KEY, {...savedSiteData});
        }
    }

    exitCollision = (_heroObj: Phaser.Types.Physics.Arcade.GameObjectWithBody, exitObj: Phaser.Types.Physics.Arcade.GameObjectWithBody) => {
        (exitObj as Exit).exitCollision();
    }

    getEntranceLocation(): Phaser.Math.Vector2 {
        const entranceLocation = new Phaser.Math.Vector2(this.areas[0].focusX, this.areas[0].focusY);
        return entranceLocation;
    }

    registryChangeHandler(_parent, key: String, data: any) {
        if (key === SHOW_MENU_REGISTRY_KEY || key === SHOW_SETTINGS_REGISTRY_KEY) {
            if (data) {
                this.hero.freeze();
            } else if (!this.hasHeroReachedExit) {
                this.hero.unfreeze();
            }
        }
        if (key === HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY) {
            this.hero.setMovementController(data);
        }
        if (key === AUDIO_MUTE_REGISTRY_KEY) {
            this.sound.mute = !!data;
        }
    }

    gamepadDownHandler(_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button, _value: number) {
        if (button.index == 8 || button.index == 9 && button.pressed && !this.hasHeroReachedExit) {
            this.registry.set(SHOW_MENU_REGISTRY_KEY, !this.registry.get(SHOW_MENU_REGISTRY_KEY));
        }
    }

    performSiteCompleteEmitterBurst(x: number, y: number) {
        this.burstEmitter.setConfig({
            lifespan: 3000,
            speed: {min: 0, max: window.innerHeight / 2}
        });
        this.burstEmitter.explode(window.innerHeight, x, y);
        this.resetEmitter();
    }

    resetEmitter() {
        this.burstEmitter.setConfig({
            lifespan: 1200,
            speed: { min: 0, max: 50 }
        });
    }

    completeSite() {
        this.hasHeroReachedExit = true;
        this.stopAudio();
        this.hero.freeze();
        this.hero.entity.setFrame(HERO_FRAMES.punchAnimStart[this.hero.currentDirection]);
        this.time.delayedCall(2000, () => {
            const siteCompleteProps: SiteCompleteSceneProps = {
                heroDisplayX: this.hero.entity.x - this.cameras.main.scrollX,
                heroDisplayY: this.hero.entity.y - this.cameras.main.scrollY,
                heroDirection: this.hero.currentDirection,
                siteConfig: this.mapConfig,
                callingSceneKey: this.scene.key as SITE_TYPES,
            }
            this.scene.launch(SITE_COMPLETE_SCENE_KEY, siteCompleteProps);
            
            this.hero.entity.setVisible(false);
        })
    }

    stopAudio() {
        this.sound.getAll(this.mapConfig.songTitle).forEach(s => {
            s.stop();
        });
    }

    jumpToSite(exitConfig: { linkedMapSceneType: SITE_TYPES, linkedMapConfigName: string }) {
        this.nextMap(exitConfig);
    }

    exitToOverworld() {
        if (this.mapConfig.siteType !== SITE_TYPES.overworld) {
            this.nextMap({
                linkedMapSceneType: SITE_TYPES.overworld,
                linkedMapConfigName: 'new_game',
            });
        }
    }
}
