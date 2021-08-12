import { STUFF_CONFIGS } from "../config";
import { GAME_SCALE, INVENTORY_REGISTRY_KEY, DUST_PUNCH_EVENT_KEY } from "../constants";
import StuffConfig from "./stuffConfig";
import StuffInInventory from "./stuffInInventory";

export default class Stuff extends Phaser.Physics.Arcade.Image {
    private hasBeenScored = false;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, private stuffConfig: StuffConfig, public id: string) {
        super(scene, x, y, key, stuffConfig.frameIndex);

        // enable physics
        this.scene.physics.world.enable(this);
        // scale the stuff
        this.setScale(GAME_SCALE);
        // hide by default
        this.setAlpha(0);
        // color - should this be done here??
        this.setTint(0x79A1D2);
        // listen for dustpunch events
        this.scene.registry.events.on(DUST_PUNCH_EVENT_KEY, this.dustpunchHandler, this);
        // add the stuff to our existing scene
        this.scene.add.existing(this);
    }

    dustpunchHandler(punchedId: string) {
        if (this.id === punchedId) {
            this.scorePoints();
        }
    }

    scorePoints() {
        if (this.hasBeenScored === false) {
            this.setAlpha(1);
            const inventory: StuffInInventory[] = this.scene.registry.get(INVENTORY_REGISTRY_KEY) || [];
            const currentStuffType = inventory.find(i => i.stuffConfigId == this.stuffConfig.stuffName);
            if (currentStuffType === undefined) {
                inventory.push({stuffConfigId: this.stuffConfig.stuffName, quantity: 1})
            } else {
                currentStuffType.quantity++;
            }
            this.scene.registry.set(INVENTORY_REGISTRY_KEY, inventory);
        }
        this.hasBeenScored = true;
    }
}