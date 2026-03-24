import { SCENE_HEIGHT, SCENE_WIDTH } from '../constants/stage.js';
import { controls } from '../config/controls.js';
import { Control } from '../constants/controls.js';
import {
	DEFAULT_SELECTED_FIGHTERS,
	getRedisRoster,
	REDIS_ROSTER_ORDER,
} from '../config/redisRoster.js';
import { setSelectedFighters, gameState } from '../states/gameState.js';
import { getCanvasCoordinates } from '../utils/context.js';
import { BattleScene } from './BattleScene.js';

const GRID_COLUMNS = 4;
const CARD_WIDTH = 86;
const CARD_HEIGHT = 24;
const CARD_GAP = 6;
const GRID_ORIGIN = { x: 12, y: 73 };
const ATTACK_CONTROL_IDS = [
	Control.LIGHT_PUNCH,
	Control.MEDIUM_PUNCH,
	Control.HEAVY_PUNCH,
	Control.LIGHT_KICK,
	Control.MEDIUM_KICK,
	Control.HEAVY_KICK,
];
const KEY_LABELS = {
	KeyW: 'W',
	KeyA: 'A',
	KeyS: 'S',
	KeyD: 'D',
	KeyQ: 'Q',
	KeyE: 'E',
	KeyR: 'R',
	KeyF: 'F',
	KeyV: 'V',
	KeyG: 'G',
	ArrowUp: 'UP',
	ArrowLeft: 'LEFT',
	ArrowDown: 'DOWN',
	ArrowRight: 'RIGHT',
	Slash: '/',
	ControlRight: 'CTRL',
	Period: '.',
	ShiftRight: 'SHIFT',
	Quote: "'",
	Enter: 'ENTER',
};
const formatKeyLabel = (code) => KEY_LABELS[code] ?? code.replace(/^Key/, '').toUpperCase();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const pointInRect = ({ x, y }, rect) =>
	x >= rect.x &&
	x <= rect.x + rect.width &&
	y >= rect.y &&
	y <= rect.y + rect.height;

export class StartScene {
	roster = getRedisRoster();
	time = 0;
	activePlayer = 0;

	playerPanels = [
		{ x: 12, y: 32, width: 173, height: 32 },
		{ x: 197, y: 32, width: 173, height: 32 },
	];

	buttons = {
		flushall: { x: 12, y: 160, width: 110, height: 12 },
		deploy: { x: 260, y: 160, width: 110, height: 12 },
	};

	footerPanels = [
		{ x: 12, y: 176, width: 174, height: 42 },
		{ x: 196, y: 176, width: 174, height: 42 },
	];

	constructor(changeScene) {
		this.changeScene = changeScene;
		this.selectedFighters = [...(gameState.selectedFighters ?? DEFAULT_SELECTED_FIGHTERS)];
		this.cursorIndexByPlayer = this.selectedFighters.map((fighterId) =>
			Math.max(0, REDIS_ROSTER_ORDER.indexOf(fighterId))
		);

		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('click', this.handleClick);
	}

	dispose = () => {
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('click', this.handleClick);
	};

	resetSelections = () => {
		this.selectedFighters = [...DEFAULT_SELECTED_FIGHTERS];
		this.cursorIndexByPlayer = this.selectedFighters.map((fighterId) =>
			Math.max(0, REDIS_ROSTER_ORDER.indexOf(fighterId))
		);
		this.activePlayer = 0;
	};

	startBattle = () => {
		setSelectedFighters(this.selectedFighters);
		this.changeScene(BattleScene);
	};

	getCursorProfile = (playerId) => this.roster[this.cursorIndexByPlayer[playerId]];

	moveCursor = (playerId, dx, dy) => {
		const currentIndex = this.cursorIndexByPlayer[playerId];
		const currentRow = Math.floor(currentIndex / GRID_COLUMNS);
		const currentColumn = currentIndex % GRID_COLUMNS;

		let nextRow = clamp(
			currentRow + dy,
			0,
			Math.floor((this.roster.length - 1) / GRID_COLUMNS)
		);
		let nextColumn = clamp(currentColumn + dx, 0, GRID_COLUMNS - 1);
		let nextIndex = nextRow * GRID_COLUMNS + nextColumn;

		while (nextIndex >= this.roster.length && nextColumn > 0) {
			nextColumn -= 1;
			nextIndex = nextRow * GRID_COLUMNS + nextColumn;
		}

		this.cursorIndexByPlayer[playerId] = clamp(
			nextIndex,
			0,
			this.roster.length - 1
		);
		this.activePlayer = playerId;
	};

	assignSelection = (playerId, rosterIndex = this.cursorIndexByPlayer[playerId]) => {
		const fighter = this.roster[rosterIndex];
		if (!fighter) return;

		this.cursorIndexByPlayer[playerId] = rosterIndex;
		this.selectedFighters[playerId] = fighter.id;
		this.activePlayer = 1 - playerId;
	};

	handlePlayerKey = (playerId, event) => {
		const code = event.code;
		const keyboard = controls[playerId].keyboard;

		if (code === keyboard[Control.UP]) return this.moveCursor(playerId, 0, -1);
		if (code === keyboard[Control.DOWN]) return this.moveCursor(playerId, 0, 1);
		if (code === keyboard[Control.LEFT]) return this.moveCursor(playerId, -1, 0);
		if (code === keyboard[Control.RIGHT]) return this.moveCursor(playerId, 1, 0);
		if (ATTACK_CONTROL_IDS.some((controlId) => keyboard[controlId] === code)) {
			return this.assignSelection(playerId);
		}
	};

	handleKeyDown = (event) => {
		if (event.repeat) return;

		if (event.code === 'Space') {
			event.preventDefault();
			this.startBattle();
			return;
		}

		if (event.code === 'Escape' || event.code === 'Backspace') {
			event.preventDefault();
			this.resetSelections();
			return;
		}

		this.handlePlayerKey(0, event);
		this.handlePlayerKey(1, event);
	};

	getCardRect = (index) => {
		const row = Math.floor(index / GRID_COLUMNS);
		const column = index % GRID_COLUMNS;

		return {
			x: GRID_ORIGIN.x + column * (CARD_WIDTH + CARD_GAP),
			y: GRID_ORIGIN.y + row * (CARD_HEIGHT + CARD_GAP),
			width: CARD_WIDTH,
			height: CARD_HEIGHT,
		};
	};

	handleClick = (event) => {
		const point = getCanvasCoordinates(event);

		if (pointInRect(point, this.buttons.flushall)) {
			this.resetSelections();
			return;
		}

		if (pointInRect(point, this.buttons.deploy)) {
			this.startBattle();
			return;
		}

		for (const [playerId, rect] of this.playerPanels.entries()) {
			if (pointInRect(point, rect)) {
				this.activePlayer = playerId;
				return;
			}
		}

		for (const [index] of this.roster.entries()) {
			const rect = this.getCardRect(index);
			if (!pointInRect(point, rect)) continue;
			this.assignSelection(this.activePlayer, index);
			return;
		}
	};

	update = (time) => {
		this.time = time.previous;
	};

	drawBackground = (context) => {
		const gradient = context.createLinearGradient(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
		gradient.addColorStop(0, '#05080f');
		gradient.addColorStop(1, '#111a28');
		context.fillStyle = gradient;
		context.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

		context.fillStyle = 'rgba(88, 199, 255, 0.08)';
		for (let x = 0; x < SCENE_WIDTH + 30; x += 22) {
			context.fillRect(
				x + ((this.time / 70) % 22),
				0,
				1,
				SCENE_HEIGHT
			);
		}

		context.fillStyle = 'rgba(255, 255, 255, 0.04)';
		for (let y = 20; y < SCENE_HEIGHT; y += 18) {
			context.fillRect(0, y, SCENE_WIDTH, 1);
		}

		context.fillStyle = 'rgba(255, 214, 102, 0.12)';
		context.fillRect(0, 24, SCENE_WIDTH, 1);
	};

	drawTitle = (context) => {
		context.fillStyle = '#f7fbff';
		context.font = 'bold 22px monospace';
		context.fillText('REDIS FIGHTER', 12, 22);

		context.fillStyle = '#9fb3c8';
		context.font = '8px monospace';
		context.fillText('Hardcore combat intact. Redis meaning layered on top.', 12, 31);
	};

	drawPlayerPanel = (context, playerId, rect) => {
		const fighter = this.roster.find(
			(profile) => profile.id === this.selectedFighters[playerId]
		);
		const isActive = this.activePlayer === playerId;

		context.fillStyle = fighter.colors.panel;
		context.fillRect(rect.x, rect.y, rect.width, rect.height);

		context.strokeStyle = isActive ? fighter.colors.primary : '#263142';
		context.lineWidth = 1;
		context.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);

		context.fillStyle = fighter.colors.primary;
		context.fillRect(rect.x + 6, rect.y + 6, 18, 18);
		context.fillStyle = '#07111c';
		context.font = 'bold 8px monospace';
		context.fillText(fighter.icon, rect.x + 8, rect.y + 18);

		context.fillStyle = '#f8fbff';
		context.font = 'bold 9px monospace';
		context.fillText(
			`P${playerId + 1} ${fighter.hudName}`,
			rect.x + 30,
			rect.y + 13
		);

		context.fillStyle = fighter.colors.muted;
		context.font = '7px monospace';
		context.fillText(
			`${fighter.commandLegend.lightPunch.displayCommand} ${fighter.commandLegend.mediumPunch.displayCommand} ${fighter.commandLegend.heavyKick.displayCommand}`,
			rect.x + 30,
			rect.y + 24
		);
	};

	drawRosterCard = (context, fighter, rect, index) => {
		const selectedBy = this.selectedFighters
			.map((fighterId, playerId) =>
				fighterId === fighter.id ? `P${playerId + 1}` : null
			)
			.filter(Boolean);

		const hoveredByActivePlayer = this.cursorIndexByPlayer[this.activePlayer] === index;
		const outlinedByPlayerOne = this.cursorIndexByPlayer[0] === index;
		const outlinedByPlayerTwo = this.cursorIndexByPlayer[1] === index;

		context.fillStyle = 'rgba(7, 12, 20, 0.82)';
		context.fillRect(rect.x, rect.y, rect.width, rect.height);

		context.strokeStyle = hoveredByActivePlayer
			? fighter.colors.primary
			: outlinedByPlayerOne && outlinedByPlayerTwo
				? '#f0f4ff'
				: outlinedByPlayerOne
					? '#58c7ff'
					: outlinedByPlayerTwo
						? '#ff8fcb'
						: '#243244';
		context.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);

		context.fillStyle = fighter.colors.primary;
		context.fillRect(rect.x + 5, rect.y + 5, 14, 14);
		context.fillStyle = '#06101a';
		context.font = 'bold 6px monospace';
		context.fillText(fighter.icon, rect.x + 7, rect.y + 14);

		context.fillStyle = '#f8fbff';
		context.font = 'bold 7px monospace';
		context.fillText(fighter.hudName, rect.x + 24, rect.y + 11);

		context.fillStyle = fighter.colors.muted;
		context.font = '6px monospace';
		context.fillText(fighter.baseTemplate.label, rect.x + 24, rect.y + 19);

		selectedBy.forEach((label, chipIndex) => {
			const chipX = rect.x + rect.width - 18 - chipIndex * 18;
			context.fillStyle = label === 'P1' ? '#58c7ff' : '#ff8fcb';
			context.fillRect(chipX, rect.y + 4, 14, 8);
			context.fillStyle = '#05111a';
			context.fillText(label, chipX + 2, rect.y + 10);
		});
	};

	drawRoster = (context) => {
		for (const [index, fighter] of this.roster.entries()) {
			this.drawRosterCard(context, fighter, this.getCardRect(index), index);
		}
	};

	drawButton = (context, label, rect, color, textColor = '#05111a') => {
		context.fillStyle = color;
		context.fillRect(rect.x, rect.y, rect.width, rect.height);
		context.strokeStyle = 'rgba(255, 255, 255, 0.18)';
		context.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);

		context.fillStyle = textColor;
		context.font = 'bold 6px monospace';
		context.fillText(label, rect.x + 8, rect.y + 8);
	};

	getControlRows = (playerId) => {
		const keyboard = controls[playerId].keyboard;
		const moveKeys = [
			keyboard[Control.UP],
			keyboard[Control.LEFT],
			keyboard[Control.DOWN],
			keyboard[Control.RIGHT],
		].map(formatKeyLabel);

		return [
			`MOVE      ${moveKeys[0]} ${moveKeys[1]}`,
			`          ${moveKeys[2]} ${moveKeys[3]}`,
			`LP/MP/HP  ${[
				keyboard[Control.LIGHT_PUNCH],
				keyboard[Control.MEDIUM_PUNCH],
				keyboard[Control.HEAVY_PUNCH],
			]
				.map(formatKeyLabel)
				.join(' ')}`,
			`LK/MK/HK  ${[
				keyboard[Control.LIGHT_KICK],
				keyboard[Control.MEDIUM_KICK],
				keyboard[Control.HEAVY_KICK],
			]
				.map(formatKeyLabel)
				.join(' ')}`,
			'LOCK      ANY ATTACK',
		];
	};

	drawControlPanel = (context, playerId, rect) => {
		const fighter = this.roster.find(
			(profile) => profile.id === this.selectedFighters[playerId]
		);
		const isActive = this.activePlayer === playerId;

		context.fillStyle = fighter.colors.panel;
		context.fillRect(rect.x, rect.y, rect.width, rect.height);

		context.strokeStyle = isActive ? fighter.colors.primary : '#263142';
		context.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);

		context.fillStyle = fighter.colors.primary;
		context.font = 'bold 7px monospace';
		context.fillText(`P${playerId + 1} KEYS`, rect.x + 8, rect.y + 9);

		context.fillStyle = '#d9e6f2';
		context.font = '6px monospace';
		this.getControlRows(playerId).forEach((row, index) => {
			context.fillText(row, rect.x + 8, rect.y + 17 + index * 6);
		});
	};

	drawFooter = (context) => {
		this.drawButton(context, 'ESC / BACK RESET', this.buttons.flushall, '#ff6b6b');
		this.drawButton(context, 'SPACE START MATCH', this.buttons.deploy, '#69efb7');
		this.drawControlPanel(context, 0, this.footerPanels[0]);
		this.drawControlPanel(context, 1, this.footerPanels[1]);
	};

	draw = (context) => {
		this.drawBackground(context);
		this.drawTitle(context);
		this.drawPlayerPanel(context, 0, this.playerPanels[0]);
		this.drawPlayerPanel(context, 1, this.playerPanels[1]);
		this.drawRoster(context);
		this.drawFooter(context);
	};
}
