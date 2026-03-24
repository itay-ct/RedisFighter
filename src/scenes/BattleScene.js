import {
	SCENE_WIDTH,
	STAGE_MID_POINT,
	STAGE_PADDING,
} from '../constants/Stage.js';
import {
	FighterAttackBaseData,
	FighterAttackStrength,
	FighterId,
	FighterState,
	FighterStruckDelay,
} from '../constants/fighter.js';
import { FRAME_TIME, GAME_SPEED } from '../constants/game.js';
import { RedisDocsUrl } from '../config/redisRoster.js';
import { Camera } from '../engine/Camera.js';
import { EntityList } from '../engine/EntityList.js';
import { Ken, Ryu } from '../entitites/fighters/index.js';
import {
	FloatingCommandText,
	HeavyHitSplash,
	LightHitSplash,
	MediumHitSplash,
	Shadow,
} from '../entitites/fighters/shared/index.js';
import { Fireball } from '../entitites/fighters/special/Fireball.js';
import { CommandFeedOverlay } from '../entitites/overlays/CommandFeedOverlay.js';
import { FpsCounter } from '../entitites/overlays/FpsCounter.js';
import { StatusBar } from '../entitites/overlays/StatusBar.js';
import { KenStage } from '../entitites/stage/KenStage.js';
import { gameState, resetGameState, setLastWinner } from '../states/gameState.js';
import { getCanvasCoordinates } from '../utils/context.js';
import { StartScene } from './StartScene.js';

export class BattleScene {
	image = document.getElementById('Winner');
	fighters = [];
	camera = undefined;
	shadows = [];
	FighterDrawOrder = [0, 1];
	hurtTimer = 0;
	battleEnded = false;
	winnerId = undefined;
	battleEndTimer = 0;
	resultCardVisible = false;
	commandFeed = undefined;

	resultButtons = {
		docs: { x: 26, y: 192, width: 100, height: 16 },
		playAgain: { x: 138, y: 192, width: 104, height: 16 },
		chooseFighter: { x: 254, y: 192, width: 102, height: 16 },
	};

	constructor(changeScene) {
		this.changeScene = changeScene;
		this.stage = new KenStage();
		this.entities = new EntityList();
		this.commandFeed = new CommandFeedOverlay();
		this.overlays = [new StatusBar(this.fighters, this.onTimeEnd), this.commandFeed, new FpsCounter()];
		resetGameState();
		this.startRound();
		window.addEventListener('click', this.handleClick);
	}

	dispose = () => {
		window.removeEventListener('click', this.handleClick);
	};

	getFighterClass = (baseId) => {
		switch (baseId) {
			case FighterId.KEN:
				return Ken;
			case FighterId.RYU:
				return Ryu;
			default:
				return new Error('Invalid Fighter Id');
		}
	};

	getFighterEntitiy = ({ profile }, index) => {
		const FighterClass = this.getFighterClass(profile.baseId);
		const fighter = new FighterClass(index, this.handleAttackHit, this.entities);
		fighter.attachRedisProfile(profile, this.handleCommandStart);
		return fighter;
	};

	getFighterEntities = () => {
		const fighterEntities = gameState.fighters.map((fighterState, index) => {
			const fighterEntity = this.getFighterEntitiy(fighterState, index);
			gameState.fighters[index].instance = fighterEntity;
			return fighterEntity;
		});

		fighterEntities[0].opponent = fighterEntities[1];
		fighterEntities[1].opponent = fighterEntities[0];

		return fighterEntities;
	};

	handleCommandStart = (time, playerId, state, profile) => {
		const command = profile.commandsByState[state];
		if (!command) return;
		this.commandFeed.push(playerId, profile, command);
	};

	updateFighters = (time, context) => {
		this.fighters.map((fighter) => {
			if (this.hurtTimer > time.previous) {
				fighter.updateHurtShake(time, this.hurtTimer);
			} else fighter.update(time, this.camera);
		});
	};

	getHitSplashClass = (strength) => {
		switch (strength) {
			case FighterAttackStrength.LIGHT:
				return LightHitSplash;
			case FighterAttackStrength.MEDIUM:
				return MediumHitSplash;
			case FighterAttackStrength.HEAVY:
				return HeavyHitSplash;
			default:
				return new Error('Invalid Strength Splash requested');
		}
	};

	handleAttackHit = (time, playerId, opponentId, position, strength) => {
		this.FighterDrawOrder = [opponentId, playerId];
		gameState.fighters[playerId].score += FighterAttackBaseData[strength].score;

		gameState.fighters[opponentId].hitPoints -=
			FighterAttackBaseData[strength].damage;
		this.commandFeed.confirmLatest(playerId);

		const HitSplashClass = this.getHitSplashClass(strength);
		const attackingProfile = gameState.fighters[playerId].profile;
		const command =
			attackingProfile.commandsByState[this.fighters[playerId].currentState];
		const impactPosition = position ?? {
			x: (this.fighters[playerId].position.x + this.fighters[opponentId].position.x) / 2,
			y: this.fighters[opponentId].position.y - 68,
		};

		if (gameState.fighters[opponentId].hitPoints <= 0) {
			this.fighters[opponentId].changeState(FighterState.KO, time);
		}

		this.fighters[opponentId].direction =
			this.fighters[playerId].direction * -1;

		impactPosition &&
			this.entities.add(HitSplashClass, impactPosition.x, impactPosition.y, playerId);
		command &&
			this.entities.add(
				FloatingCommandText,
				impactPosition.x,
				impactPosition.y - 8,
				command.displayCommand,
				attackingProfile.colors.primary
			);

		this.hurtTimer = time.previous + FighterStruckDelay * FRAME_TIME;
	};

	updateShadows = (time) => {
		this.shadows.map((shadow) => shadow.update(time));
	};

	startRound = () => {
		this.fighters = this.getFighterEntities();
		this.camera = new Camera(
			STAGE_PADDING + STAGE_MID_POINT - SCENE_WIDTH / 2,
			16,
			this.fighters
		);

		this.shadows = this.fighters.map((fighter) => new Shadow(fighter));
	};

	drawWinnerText = (context, id) => {
		context.drawImage(this.image, 0, 11 * id, 70, 9, 120, 60, 140, 30);
	};

	finishBattle = (time, winnerId) => {
		if (this.battleEnded) return;
		this.winnerId = winnerId;
		this.battleEnded = true;
		this.battleEndTimer = time.previous;
		setLastWinner(gameState.fighters[winnerId].id);
	};

	onTimeEnd = (time) => {
		if (gameState.fighters[0].hitPoints >= gameState.fighters[1].hitPoints) {
			this.fighters[0].victory = true;
			this.fighters[1].changeState(FighterState.KO, time);
			this.finishBattle(time, 0);
		} else {
			this.fighters[1].victory = true;
			this.fighters[0].changeState(FighterState.KO, time);
			this.finishBattle(time, 1);
		}
	};

	updateOverlays = (time) => {
		this.overlays.map((overlay) => overlay.update(time));
	};

	updateFighterHP = (time) => {
		gameState.fighters.map((fighter, index) => {
			if (fighter.hitPoints <= 0 && !this.battleEnded) {
				this.fighters[index].opponent.victory = true;
				this.finishBattle(time, 1 - index);
			}
		});
	};

	getWinnerProfile = () =>
		this.winnerId === undefined ? undefined : gameState.fighters[this.winnerId].profile;

	handleClick = (event) => {
		if (!this.resultCardVisible) return;

		const point = getCanvasCoordinates(event);
		const winnerProfile = this.getWinnerProfile();

		if (!winnerProfile) return;

		if (this.pointInRect(point, this.resultButtons.docs)) {
			window.open(
				winnerProfile.docsUrl ?? RedisDocsUrl.FALLBACK,
				'_blank',
				'noopener,noreferrer'
			);
			return;
		}

		if (this.pointInRect(point, this.resultButtons.playAgain)) {
			this.changeScene(BattleScene);
			return;
		}

		if (this.pointInRect(point, this.resultButtons.chooseFighter)) {
			this.changeScene(StartScene);
		}
	};

	pointInRect = (point, rect) =>
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height;

	drawActionButton = (context, rect, label, fill) => {
		context.fillStyle = fill;
		context.fillRect(rect.x, rect.y, rect.width, rect.height);
		context.strokeStyle = 'rgba(255, 255, 255, 0.22)';
		context.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
		context.fillStyle = '#07111c';
		context.font = 'bold 8px monospace';
		context.fillText(label, rect.x + 7, rect.y + 12);
	};

	getWrappedTextLines = (context, text, maxWidth) => {
		const words = text.split(' ');
		const lines = [];
		let line = '';

		for (const word of words) {
			const nextLine = line ? `${line} ${word}` : word;
			if (context.measureText(nextLine).width > maxWidth && line) {
				lines.push(line);
				line = word;
				continue;
			}
			line = nextLine;
		}

		if (line) lines.push(line);
		return lines;
	};

	drawWrappedText = (context, lines, x, y, lineHeight) => {
		lines.forEach((line, index) => {
			context.fillText(line, x, y + index * lineHeight);
		});
		return lines.length;
	};

	fitWrappedText = (
		context,
		text,
		maxWidth,
		maxHeight,
		fontOptions = ['8px monospace', '7px monospace', '6px monospace'],
		lineHeightMultiplier = 1.35
	) => {
		for (const font of fontOptions) {
			context.font = font;
			const fontSize = Number.parseInt(font, 10);
			const lineHeight = Math.ceil(fontSize * lineHeightMultiplier);
			const lines = this.getWrappedTextLines(context, text, maxWidth);

			if (lines.length * lineHeight <= maxHeight) {
				return { font, lines, lineHeight };
			}
		}

		const fallbackFont = fontOptions[fontOptions.length - 1];
		context.font = fallbackFont;
		return {
			font: fallbackFont,
			lines: this.getWrappedTextLines(context, text, maxWidth),
			lineHeight: Math.ceil(Number.parseInt(fallbackFont, 10) * lineHeightMultiplier),
		};
	};

	drawWinnerPortrait = (context, profile) => {
		const portraitImage = document.getElementById(profile.baseTemplate.imageId);
		const [sourceX, sourceY, sourceWidth, sourceHeight] = profile.baseTemplate.portrait;

		context.drawImage(
			portraitImage,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			34,
			58,
			48,
			70
		);
		context.save();
		context.globalCompositeOperation = 'source-atop';
		context.globalAlpha = 0.22;
		context.fillStyle = profile.colors.tint;
		context.fillRect(34, 58, 48, 70);
		context.restore();
	};

	drawResultCard = (context) => {
		const profile = this.getWinnerProfile();
		if (!profile) return;

		context.fillStyle = 'rgba(0, 0, 0, 0.65)';
		context.fillRect(0, 0, 382, 224);

		context.fillStyle = 'rgba(5, 10, 18, 0.94)';
		context.fillRect(18, 28, 346, 186);
		context.strokeStyle = profile.colors.primary;
		context.strokeRect(18.5, 28.5, 345, 185);

		context.fillStyle = profile.colors.primary;
		context.fillRect(18, 28, 346, 16);
		context.fillStyle = '#07111c';
		context.font = 'bold 9px monospace';
		context.fillText('DID YOU KNOW?', 28, 39);

		this.drawWinnerPortrait(context, profile);

		context.fillStyle = '#f6fbff';
		context.font = 'bold 12px monospace';
		context.fillText(profile.hudName, 94, 70);
		context.fillStyle = profile.colors.muted;
		context.font = '8px monospace';
		context.fillText(profile.subtitle, 94, 82);

		const descriptionLayout = this.fitWrappedText(
			context,
			profile.description,
			252,
			42,
			['8px monospace', '7px monospace', '6px monospace'],
			1.3
		);

		context.fillStyle = '#d6e0ea';
		context.font = descriptionLayout.font;
		this.drawWrappedText(
			context,
			descriptionLayout.lines,
			94,
			95,
			descriptionLayout.lineHeight
		);

		context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		context.beginPath();
		context.moveTo(28, 136.5);
		context.lineTo(354, 136.5);
		context.stroke();

		context.fillStyle = profile.colors.primary;
		context.font = 'bold 8px monospace';
		context.fillText('Fact:', 28, 151);

		const factLayout = this.fitWrappedText(
			context,
			profile.didYouKnow,
			320,
			24,
			['8px monospace', '7px monospace', '6px monospace'],
			1.3
		);

		context.fillStyle = '#f6fbff';
		context.font = factLayout.font;
		this.drawWrappedText(
			context,
			factLayout.lines,
			28,
			163,
			factLayout.lineHeight
		);

		this.drawActionButton(context, this.resultButtons.docs, 'OPEN DOCS', profile.colors.primary);
		this.drawActionButton(
			context,
			this.resultButtons.playAgain,
			'PLAY AGAIN',
			'#69efb7'
		);
		this.drawActionButton(
			context,
			this.resultButtons.chooseFighter,
			'CHOOSE FIGHTER',
			'#ffcb5b'
		);
	};

	update = (time) => {
		this.updateFighters(time);
		this.updateShadows(time);
		this.stage.update(time);
		this.entities.update(time, this.camera);
		this.camera.update(time);
		this.updateOverlays(time);
		this.updateFighterHP(time);
		if (
			this.battleEnded &&
			!this.resultCardVisible &&
			time.previous > this.battleEndTimer + 60 * FRAME_TIME
		) {
			this.resultCardVisible = true;
		}
	};

	drawFighters(context) {
		this.FighterDrawOrder.map((id) =>
			this.fighters[id].draw(context, this.camera)
		);
	}

	drawShadows(context) {
		this.shadows.map((shadow) => shadow.draw(context, this.camera));
	}

	drawOverlays(context) {
		this.overlays.map((overlay) => overlay.draw(context, this.camera));
		if (this.winnerId !== undefined && !this.resultCardVisible) {
			this.drawWinnerText(context, this.winnerId);
		}
		if (this.resultCardVisible) this.drawResultCard(context);
	}

	draw = (context) => {
		this.stage.drawBackground(context, this.camera);
		this.drawShadows(context);
		this.drawFighters(context);
		this.entities.draw(context, this.camera);
		this.stage.drawForeground(context, this.camera);
		this.drawOverlays(context);
	};
}
