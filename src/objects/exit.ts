import { GAME_SCALE, EXIT_COLLISION_EVENT_KEY, SITE_TYPES } from "../constants";
import { MAP_CONFIGS } from "../config";

export class Exit extends Phaser.Physics.Arcade.Image {
    private blinkState: 0 | 1 | 2 | 3 = 0;
    private blinkTimer: Phaser.Time.TimerEvent;
    private blinkTint: number;
    constructor(
        scene: Phaser.Scene,
        x: number, y: number,
        key: string, frame: number,
        public id: string,
        private linkedMapSceneType?: SITE_TYPES,
        public linkedMapConfigName?: string,
        private linkedMapConfigCategory?: string,
        public requiredTokens?: { [tokenKey: string]: number },
    ) {
        super(scene, x, y, key, frame);

        // enable physics
        this.scene.physics.world.enable(this);
        // TODO #8: shrink the hit box to require more overlap
        this.setSize(8, 8);
        // scale the exit
        this.setScale(GAME_SCALE);
        // add the exit to our existing scene
        this.scene.add.existing(this);

        // if this exit links to a gatedSite, start blinking behaviour
        if (this.linkedMapSceneType === SITE_TYPES.gatedSite) {
            // derive tint from target config if available
            const cfg = MAP_CONFIGS[this.linkedMapSceneType].find(mc => mc.mapConfigName == this.linkedMapConfigName);
            this.blinkTint = cfg?.defaultTileTint ?? 0xffffff;
            this.blink();
        }
    }

    exitCollision() {
        this.scene.registry.events.emit(EXIT_COLLISION_EVENT_KEY, {
            linkedMapSceneType: this.linkedMapSceneType,
            linkedMapConfigName: this.linkedMapConfigName,
            linkedMapConfigCategory: this.linkedMapConfigCategory,
            requiredTokens: this.requiredTokens
        });
    }

    override destroy(fromScene?: boolean) {
        if (this.blinkTimer) {
            this.scene.time.removeEvent(this.blinkTimer);
        }
        super.destroy(fromScene);
    }

    private blink() {
        // cancel any pending timer before scheduling the next step
        if (this.blinkTimer) {
            this.scene.time.removeEvent(this.blinkTimer);
        }

        this.blinkState += 1;
        if (this.blinkState > 3) {
            this.blinkState = 0;
        }

        let delay = 200;
        switch (this.blinkState) {
            case 0:
                this.setTint(this.blinkTint);
                delay = 500;
                break;
            case 1:
                this.setTint(0xffffff);
                break;
            case 2:
                this.setTint(this.blinkTint);
                delay = 100;
                break;
            case 3:
                this.setTint(0xffffff);
                break;
        }

        this.blinkTimer = this.scene.time.delayedCall(delay, this.blink, [], this);
    }
}