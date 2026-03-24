const MAX_COMMANDS = 6;
const PANEL_WIDTH = 122;
const PANEL_HEIGHT = 72;
const LEFT_PANEL = { x: 6, y: 46, width: PANEL_WIDTH, height: PANEL_HEIGHT };
const RIGHT_PANEL = { x: 254, y: 46, width: PANEL_WIDTH, height: PANEL_HEIGHT };

const truncateText = (text, maxLength) =>
	text.length > maxLength ? `${text.slice(0, maxLength - 1)}.` : text;

export class CommandFeedOverlay {
	commandLog = [[], []];

	push(playerId, profile, command) {
		this.commandLog[playerId].unshift({
			command: command.displayCommand,
			description: command.shortExplanation,
			confirmed: false,
			color: profile.colors.primary,
			textColor: profile.colors.secondary,
		});

		this.commandLog[playerId] = this.commandLog[playerId].slice(0, MAX_COMMANDS);
	}

	confirmLatest(playerId) {
		const entry = this.commandLog[playerId].find(
			(logEntry) => !logEntry.confirmed
		);
		if (entry) entry.confirmed = true;
	}

	update = () => {};

	drawPanel = (context, panel, playerId) => {
		context.fillStyle = 'rgba(3, 8, 16, 0.72)';
		context.fillRect(panel.x, panel.y, panel.width, panel.height);

		context.strokeStyle =
			this.commandLog[playerId][0]?.color ?? 'rgba(120, 145, 170, 0.8)';
		context.strokeRect(panel.x + 0.5, panel.y + 0.5, panel.width - 1, panel.height - 1);

		context.fillStyle = '#8ea4bc';
		context.font = '7px monospace';
		context.fillText('COMMAND FEED', panel.x + 6, panel.y + 10);

		const playerLabel = `P${playerId + 1}`;
		context.fillStyle = this.commandLog[playerId][0]?.color ?? '#f2f7ff';
		context.fillText(playerLabel, panel.x + panel.width - 18, panel.y + 10);

		this.commandLog[playerId].forEach((entry, index) => {
			const y = panel.y + 22 + index * 8;

			context.fillStyle = entry.confirmed ? entry.color : '#d6e0ea';
			context.font = 'bold 7px monospace';
			context.fillText(truncateText(entry.command, 12), panel.x + 6, y);

			context.fillStyle = entry.textColor;
			context.font = '7px monospace';
			context.fillText(truncateText(entry.description, 16), panel.x + 58, y);
		});
	};

	draw(context) {
		this.drawPanel(context, LEFT_PANEL, 0);
		this.drawPanel(context, RIGHT_PANEL, 1);
	}
}
