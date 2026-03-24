export class FloatingCommandText {
	life = 0.65;

	constructor(x, y, command, color, entities) {
		this.entities = entities;
		this.position = { x, y };
		this.command = command;
		this.color = color;
	}

	update = (time) => {
		this.life -= time.secondsPassed;
		this.position.y -= 24 * time.secondsPassed;

		if (this.life <= 0) this.entities.remove(this);
	};

	draw = (context, camera) => {
		const width = Math.max(36, this.command.length * 6 + 8);
		const x = Math.floor(this.position.x - camera.position.x - width / 2);
		const y = Math.floor(this.position.y - camera.position.y);

		context.save();
		context.globalAlpha = Math.max(0, this.life / 0.65);
		context.fillStyle = 'rgba(5, 10, 18, 0.82)';
		context.fillRect(x, y - 8, width, 10);
		context.strokeStyle = this.color;
		context.strokeRect(x + 0.5, y - 7.5, width - 1, 9);
		context.fillStyle = '#f6fbff';
		context.font = 'bold 7px monospace';
		context.fillText(this.command, x + 4, y);
		context.restore();
	};
}
