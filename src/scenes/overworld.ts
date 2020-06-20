import Hero from '../objects/hero';
import { WORLD_WIDTH, WORLD_HEIGHT, GAME_SCALE } from '../constants';

export class OverworldScene extends Phaser.Scene {

    private hero: Hero;
    private cursors: any;
    private dungeon: Phaser.Physics.Arcade.Image;

    create(): void {
        this.hero = new Hero(WORLD_WIDTH / 2, 100, this, 160);
        this.addDungeons();
        this.addCollisions();
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(): void {
        if (!!this.hero) {
            this.hero.update(this.cursors);
        }
    }

    addDungeons() {
        this.dungeon = new Phaser.Physics.Arcade.Image(this, WORLD_WIDTH / 2, WORLD_HEIGHT - 100, 'terrain', 1);
        this.dungeon.setScale(GAME_SCALE);
        this.physics.world.enable(this.dungeon);

        this.add.existing(this.dungeon);
    }

    addCollisions() {
        // collisions between player and dungeon icons
        this.physics.add.overlap(this.hero.entity, this.dungeon, this.enterDungeon.bind(this))
    }

    enterDungeon() {
        this.scene.start('Dungeon');
    }
}
