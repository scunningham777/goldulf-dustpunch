import Hero from '../objects/hero';
import { WORLD_WIDTH, WORLD_HEIGHT, GAME_SCALE } from '../constants';
import { Cardinal_Direction } from '../utils';

export class DungeonScene extends Phaser.Scene {

    private hero: Hero;
    private cursors: any;
    private dungeon: Phaser.Physics.Arcade.Image;

    create(): void {
        this.hero = new Hero(100, WORLD_HEIGHT / 2, this, 160, Cardinal_Direction.RIGHT);
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
        
        this.dungeon = new Phaser.Physics.Arcade.Image(this, WORLD_WIDTH - 100, WORLD_HEIGHT / 2, 'terrain', 26);
        this.dungeon.setScale(GAME_SCALE);
        this.physics.world.enable(this.dungeon);

        this.add.existing(this.dungeon);
    }

    addCollisions() {
        // collisions between player and dungeon icons
        this.physics.add.overlap(this.hero.entity, this.dungeon, this.enterDungeon.bind(this))
    }

    enterDungeon() {
        this.scene.start('Overworld');
    }
}
