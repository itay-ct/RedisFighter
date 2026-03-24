import {
	DEFAULT_SELECTED_FIGHTERS,
	getRedisFighter,
} from '../config/redisRoster.js';
import { createDefaultFighterState } from './fighterState.js';

const createGameState = (selectedFighters = DEFAULT_SELECTED_FIGHTERS) => ({
	selectedFighters: [...selectedFighters],
	fighters: selectedFighters.map((id) => createDefaultFighterState(id)),
	lastWinnerId: undefined,
});

export var gameState = {
	...createGameState(),
};

export const resetGameState = () => {
	gameState = createGameState(gameState.selectedFighters);
};

export const setSelectedFighters = (selectedFighters) => {
	gameState = createGameState(selectedFighters);
};

export const setLastWinner = (fighterId) => {
	gameState.lastWinnerId = fighterId;
};

export const getSelectedProfiles = () =>
	gameState.selectedFighters.map((id) => getRedisFighter(id));
