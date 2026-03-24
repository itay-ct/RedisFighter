import { HEALTH_MAX_HIT_POINTS } from '../constants/battle.js';
import { getRedisFighter } from '../config/redisRoster.js';

export const createDefaultFighterState = (id) => {
	return {
		instance: undefined,
		id,
		profile: getRedisFighter(id),
		score: 1,
		battles: 0,
		hitPoints: HEALTH_MAX_HIT_POINTS,
	};
};
