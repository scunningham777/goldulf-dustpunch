export default class Player {

	private player;
	private scene;
	private x;
	private y;
	private controls;
	private touchStartX: number = null;
	private doubleTouch = false;
	private turnThreshold = 30;

	constructor(x, y, scene){

		this.scene = scene;
		this.x = x;
		this.y = y;
		// this.controls = this.scene.input.activePointer;
		this.controls = this.scene.input.keyboard.createCursorKeys();

		this.addToScene();
		this.addAnimations();

		console.log('player created');

		this.scene.input.on('pointerdown', pointer => {
			this.touchStartX = pointer.x;

			if (this.doubleTouch) {
				this.jump();
				this.doubleTouch = false;
			} else {
				this.doubleTouch = true;
				setTimeout(() => {
					this.doubleTouch = false;
				}, 500);
			}
		});

		this.scene.input.on('pointerup', () => {
			this.touchStartX = null;
		});
	}

	get entity() {
		return this.player;
	}

	jump() {
		this.player.setVelocityY(-200);
		console.log('going up');
	}

	update(): void {
		const aPointer = this.scene.input.activePointer;

		if(this.controls.up.isDown && this.player.body.touching.down){
			this.jump();
		}
		if (this.controls.left.isDown || this.touchStartX != null && aPointer.x < this.touchStartX - this.turnThreshold) {
			this.player.setVelocityX(-170);
			this.player.anims.play('left', true);
		} else if (this.controls.right.isDown || this.touchStartX != null && aPointer.x > this.touchStartX + this.turnThreshold) {
			this.player.setVelocityX(170);
			this.player.anims.play('right', true);
		} else {
			this.player.setVelocityX(0);
			this.player.anims.play('turn');
		}

	}

	addToScene(): void {

		this.player = this.scene.physics.add.sprite(this.x, this.y, 'dude');
		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(true);
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