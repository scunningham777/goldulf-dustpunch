import { GAME_SCALE } from '../constants';

export default class Player {

	private player: Phaser.GameObjects.Sprite;
	private scene: Phaser.Scene;
	private x: number;
	private y: number;

	constructor(x: number, y: number, scene: Phaser.Scene){

		this.scene = scene;
		this.x = x;
		this.y = y;

		this.addToScene();
		this.addAnimations();

		console.log('player created');
	}

	get entity() {
		return this.player;
	}

	update(): void {
		
	}

	addToScene(): void {

		this.player = this.scene.add.sprite(this.x, this.y, 'dude');
		this.player.setScale(GAME_SCALE);
	}

	addAnimations(): void {
		this.scene.anims.create({
			key: 'left',
			frames: this.scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
		    key: 'turn',
		    frames: [ { key: 'dude', frame: 4 } ],
		    frameRate: 20
		});

		this.scene.anims.create({
		    key: 'right',
		    frames: this.scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
		    frameRate: 10,
		    repeat: -1
		});

	}
	

}