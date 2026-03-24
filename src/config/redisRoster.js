import { FighterId, FighterState } from '../constants/fighter.js';

export const RedisDocsUrl = {
	FALLBACK: 'https://redis.io/docs/latest/develop/data-types/',
};

export const RedisFighterId = {
	STRING: 'string',
	HASH: 'hash',
	JSON: 'json',
	LIST: 'list',
	SET: 'set',
	SORTED_SET: 'sorted-set',
	STREAM: 'stream',
	GEOSPATIAL: 'geospatial',
	BITMAP: 'bitmap',
	PROBABILISTIC: 'probabilistic',
	VECTOR_SET: 'vector-set',
	TIME_SERIES: 'time-series',
};

export const REDIS_ROSTER_ORDER = [
	RedisFighterId.STRING,
	RedisFighterId.HASH,
	RedisFighterId.JSON,
	RedisFighterId.LIST,
	RedisFighterId.SET,
	RedisFighterId.SORTED_SET,
	RedisFighterId.STREAM,
	RedisFighterId.GEOSPATIAL,
	RedisFighterId.BITMAP,
	RedisFighterId.PROBABILISTIC,
	RedisFighterId.VECTOR_SET,
	RedisFighterId.TIME_SERIES,
];

export const DEFAULT_SELECTED_FIGHTERS = [
	RedisFighterId.STRING,
	RedisFighterId.STREAM,
];

export const REDIS_BASE_TEMPLATES = {
	[FighterId.RYU]: {
		id: FighterId.RYU,
		label: 'Ryu Base',
		imageId: 'RyuImage',
		portrait: [75, 14, 60, 89],
	},
	[FighterId.KEN]: {
		id: FighterId.KEN,
		label: 'Ken Base',
		imageId: 'KenImage',
		portrait: [346, 688, 60, 89],
	},
};

const createCommand = (displayCommand, shortExplanation, category, operandFlavor) => ({
	displayCommand,
	shortExplanation,
	category,
	operandFlavor,
});

const addDocs = (command, docsUrl) => ({
	...command,
	docsUrl,
});

const createProfile = ({
	id,
	name,
	subtitle,
	baseId,
	icon,
	colors,
	docsUrl,
	description,
	didYouKnow,
	commands,
}) => {
	const commandMap = {
		[FighterState.LIGHT_PUNCH]: addDocs(commands.lightPunch, docsUrl),
		[FighterState.MEDIUM_PUNCH]: addDocs(commands.mediumPunch, docsUrl),
		[FighterState.HEAVY_PUNCH]: addDocs(commands.heavyPunch, docsUrl),
		[FighterState.LIGHT_KICK]: addDocs(commands.lightKick, docsUrl),
		[FighterState.MEDIUM_KICK]: addDocs(commands.mediumKick, docsUrl),
		[FighterState.HEAVY_KICK]: addDocs(commands.heavyKick, docsUrl),
		[FighterState.SPECIAL_1_LIGHT]: addDocs(
			commands.special ?? commands.heavyKick,
			docsUrl
		),
		[FighterState.SPECIAL_1_MEDIUM]: addDocs(
			commands.special ?? commands.heavyKick,
			docsUrl
		),
		[FighterState.SPECIAL_1_HEAVY]: addDocs(
			commands.special ?? commands.heavyKick,
			docsUrl
		),
	};

	return {
		id,
		name,
		hudName: name.toUpperCase(),
		subtitle,
		baseId,
		baseTemplate: REDIS_BASE_TEMPLATES[baseId],
		icon,
		colors,
		docsUrl,
		description,
		didYouKnow,
		commandsByState: commandMap,
		commandLegend: {
			lightPunch: commandMap[FighterState.LIGHT_PUNCH],
			mediumPunch: commandMap[FighterState.MEDIUM_PUNCH],
			heavyPunch: commandMap[FighterState.HEAVY_PUNCH],
			lightKick: commandMap[FighterState.LIGHT_KICK],
			mediumKick: commandMap[FighterState.MEDIUM_KICK],
			heavyKick: commandMap[FighterState.HEAVY_KICK],
		},
		defenseCommand: addDocs(commands.defense, docsUrl),
		utilityCommand: addDocs(commands.utility, docsUrl),
	};
};

export const REDIS_FIGHTERS = {
	[RedisFighterId.STRING]: createProfile({
		id: RedisFighterId.STRING,
		name: 'String',
		subtitle: 'The Foundation',
		baseId: FighterId.RYU,
		icon: '<>',
		colors: {
			primary: '#58c7ff',
			secondary: '#ffffff',
			panel: 'rgba(10, 20, 34, 0.82)',
			muted: '#c0d7e8',
			tint: '#58c7ff',
		},
		docsUrl: 'https://redis.io/docs/latest/develop/data-types/strings/',
		description:
			'Redis strings are the simplest value type, so they are perfect for caches, counters, and everyday key-value data.',
		didYouKnow:
			'Redis strings also support counters, ranges, and bit-level operations inside the same value type.',
		commands: {
			lightPunch: createCommand('SET', 'create or update value', 'create'),
			mediumPunch: createCommand('GET', 'read stored value', 'read'),
			heavyPunch: createCommand('DEL', 'delete the key', 'delete'),
			lightKick: createCommand('EXPIRE', 'add time pressure', 'mutate'),
			mediumKick: createCommand('STRLEN', 'inspect value length', 'query'),
			heavyKick: createCommand('INCR', 'raise a counter', 'signature'),
			defense: createCommand('EXISTS', 'check if key exists', 'defense'),
			utility: createCommand('GETRANGE', 'peek part of a value', 'utility'),
		},
	}),
	[RedisFighterId.HASH]: createProfile({
		id: RedisFighterId.HASH,
		name: 'Hash',
		subtitle: 'The Structurer',
		baseId: FighterId.RYU,
		icon: '#',
		colors: {
			primary: '#49d5b7',
			secondary: '#f4fff8',
			panel: 'rgba(7, 28, 24, 0.84)',
			muted: '#b7e8de',
			tint: '#49d5b7',
		},
		docsUrl: 'https://redis.io/docs/latest/develop/data-types/hashes/',
		description:
			'Redis hashes keep related fields together, making them a strong fit for user profiles, objects, and compact structured records.',
		didYouKnow:
			'Hashes let you update one field at a time without rewriting the whole object.',
		commands: {
			lightPunch: createCommand('HSET', 'set one field', 'create'),
			mediumPunch: createCommand('HGET', 'read one field', 'read'),
			heavyPunch: createCommand('HDEL', 'remove a field', 'delete'),
			lightKick: createCommand('HEXPIRE', 'age one field out', 'mutate'),
			mediumKick: createCommand('HGETALL', 'inspect every field', 'query'),
			heavyKick: createCommand('HINCRBY', 'increment a field', 'signature'),
			defense: createCommand('HEXISTS', 'check field presence', 'defense'),
			utility: createCommand('HKEYS', 'peek field names', 'utility'),
		},
	}),
	[RedisFighterId.JSON]: createProfile({
		id: RedisFighterId.JSON,
		name: 'JSON',
		subtitle: 'The Deep Schema',
		baseId: FighterId.RYU,
		icon: '{}',
		colors: {
			primary: '#ffcb5b',
			secondary: '#fff8e3',
			panel: 'rgba(34, 23, 8, 0.84)',
			muted: '#ead7a2',
			tint: '#ffcb5b',
		},
		docsUrl: 'https://redis.io/docs/latest/develop/data-types/json/',
		description:
			'Redis JSON is built for nested application data, so you can store and update complex documents without flattening them first.',
		didYouKnow:
			'JSON paths let you update or inspect deep nested values without replacing the entire document.',
		commands: {
			lightPunch: createCommand('JSON.SET', 'write nested path', 'create'),
			mediumPunch: createCommand('JSON.GET', 'read nested data', 'read'),
			heavyPunch: createCommand('JSON.DEL', 'delete path data', 'delete'),
			lightKick: createCommand(
				'JSON.ARRAPPEND',
				'grow an array path',
				'mutate'
			),
			mediumKick: createCommand('JSON.TYPE', 'inspect value kind', 'query'),
			heavyKick: createCommand(
				'JSON.NUMINCRBY',
				'increment nested number',
				'signature'
			),
			defense: createCommand('JSON.TYPE', 'verify path type', 'defense'),
			utility: createCommand('JSON.OBJKEYS', 'peek object keys', 'utility'),
		},
	}),
	[RedisFighterId.LIST]: createProfile({
		id: RedisFighterId.LIST,
		name: 'List',
		subtitle: 'The Flow Master',
		baseId: FighterId.KEN,
		icon: '[]',
		colors: {
			primary: '#ff9642',
			secondary: '#fff3ea',
			panel: 'rgba(40, 18, 6, 0.84)',
			muted: '#efc3a1',
			tint: '#ff9642',
		},
		docsUrl: 'https://redis.io/docs/latest/develop/data-types/lists/',
		description:
			'Redis lists are ordered sequences that shine when you need queue, stack, and work-buffer style behavior.',
		didYouKnow:
			'Lists support push and pop operations from both ends, so one structure can model both queues and stacks.',
		commands: {
			lightPunch: createCommand('LPUSH', 'push from the left', 'create'),
			mediumPunch: createCommand('LRANGE', 'inspect ordered slice', 'read'),
			heavyPunch: createCommand('LPOP', 'pop from the left', 'delete'),
			lightKick: createCommand('RPUSH', 'push from the right', 'mutate'),
			mediumKick: createCommand('LLEN', 'count queued items', 'query'),
			heavyKick: createCommand('BLPOP', 'wait and pop', 'signature'),
			defense: createCommand('LINDEX', 'peek a safe position', 'defense'),
			utility: createCommand('LINDEX', 'peek one item', 'utility'),
		},
	}),
	[RedisFighterId.SET]: createProfile({
		id: RedisFighterId.SET,
		name: 'Set',
		subtitle: 'The Unique One',
		baseId: FighterId.RYU,
		icon: '()',
		colors: {
			primary: '#87e66f',
			secondary: '#f3ffe8',
			panel: 'rgba(13, 29, 8, 0.84)',
			muted: '#c4e7b0',
			tint: '#87e66f',
		},
		docsUrl: 'https://redis.io/docs/latest/develop/data-types/sets/',
		description:
			'Redis sets are built around uniqueness, which makes them great for membership checks, tags, and deduplication.',
		didYouKnow:
			'Because sets store only unique members, they are a natural fit for “has this been seen?” style checks.',
		commands: {
			lightPunch: createCommand('SADD', 'add unique member', 'create'),
			mediumPunch: createCommand('SMEMBERS', 'read full set', 'read'),
			heavyPunch: createCommand('SREM', 'remove one member', 'delete'),
			lightKick: createCommand(
				'SISMEMBER',
				'test set membership',
				'mutate'
			),
			mediumKick: createCommand('SCARD', 'count unique members', 'query'),
			heavyKick: createCommand('SINTER', 'intersect memberships', 'signature'),
			defense: createCommand('SISMEMBER', 'verify membership', 'defense'),
			utility: createCommand('SRANDMEMBER', 'peek one member', 'utility'),
		},
	}),
	[RedisFighterId.SORTED_SET]: createProfile({
		id: RedisFighterId.SORTED_SET,
		name: 'Sorted Set',
		subtitle: 'The Ranker',
		baseId: FighterId.KEN,
		icon: '#^',
		colors: {
			primary: '#ffd166',
			secondary: '#fff8e4',
			panel: 'rgba(40, 29, 6, 0.84)',
			muted: '#f0d6a2',
			tint: '#ffd166',
		},
		docsUrl:
			'https://redis.io/docs/latest/develop/data-types/sorted-sets/',
		description:
			'Redis sorted sets pair each unique member with a score, which makes them ideal for ranks, leaderboards, and ordered indexes.',
		didYouKnow:
			'Sorted sets power leaderboards because the same structure supports ranking by score and reading by position.',
		commands: {
			lightPunch: createCommand('ZADD', 'add scored member', 'create'),
			mediumPunch: createCommand('ZRANGE', 'read ranked slice', 'read'),
			heavyPunch: createCommand('ZREM', 'remove ranked member', 'delete'),
			lightKick: createCommand('ZCARD', 'count ranked members', 'mutate'),
			mediumKick: createCommand('ZRANK', 'inspect member rank', 'query'),
			heavyKick: createCommand('ZREVRANGE', 'read top ranks', 'signature'),
			defense: createCommand('ZSCORE', 'check current score', 'defense'),
			utility: createCommand('ZSCORE', 'peek one score', 'utility'),
		},
	}),
	[RedisFighterId.STREAM]: createProfile({
		id: RedisFighterId.STREAM,
		name: 'Stream',
		subtitle: 'The Event Engine',
		baseId: FighterId.KEN,
		icon: '~>',
		colors: {
			primary: '#ff6b6b',
			secondary: '#fff0f0',
			panel: 'rgba(38, 10, 10, 0.84)',
			muted: '#f0b1b1',
			tint: '#ff6b6b',
		},
		docsUrl: 'https://redis.io/docs/latest/develop/data-types/streams/',
		description:
			'Redis streams model append-only event flow, which is useful for activity feeds, event pipelines, and distributed consumers.',
		didYouKnow:
			'Streams support consumer groups, so multiple readers can coordinate work without processing the same entry twice.',
		commands: {
			lightPunch: createCommand('XADD', 'append event entry', 'create'),
			mediumPunch: createCommand('XRANGE', 'inspect event span', 'read'),
			heavyPunch: createCommand('XDEL', 'delete one entry', 'delete'),
			lightKick: createCommand('XTRIM', 'trim older events', 'mutate'),
			mediumKick: createCommand('XREAD', 'read fresh entries', 'query'),
			heavyKick: createCommand(
				'XREADGROUP',
				'coordinate consumers',
				'signature'
			),
			defense: createCommand('XINFO', 'inspect stream state', 'defense'),
			utility: createCommand('XLEN', 'count event entries', 'utility'),
		},
	}),
	[RedisFighterId.GEOSPATIAL]: createProfile({
		id: RedisFighterId.GEOSPATIAL,
		name: 'Geospatial',
		subtitle: 'The Tracker',
		baseId: FighterId.KEN,
		icon: '@',
		colors: {
			primary: '#ff7f50',
			secondary: '#fff0e8',
			panel: 'rgba(42, 16, 9, 0.84)',
			muted: '#edb8a2',
			tint: '#ff7f50',
		},
		docsUrl:
			'https://redis.io/docs/latest/develop/data-types/geospatial/',
		description:
			'Redis geospatial indexes help you store coordinates and answer distance or nearby-search questions fast.',
		didYouKnow:
			'Geospatial commands can answer “what is nearby?” without you manually calculating the radius math.',
		commands: {
			lightPunch: createCommand('GEOADD', 'place a coordinate', 'create'),
			mediumPunch: createCommand(
				'GEOSEARCH',
				'query nearby points',
				'read'
			),
			heavyPunch: createCommand('ZREM', 'remove saved location', 'delete'),
			lightKick: createCommand(
				'GEOHASH',
				'inspect hashed location',
				'mutate'
			),
			mediumKick: createCommand('GEODIST', 'measure proximity', 'query'),
			heavyKick: createCommand(
				'GEOSEARCHSTORE',
				'persist search result',
				'signature'
			),
			defense: createCommand('GEOPOS', 'verify saved position', 'defense'),
			utility: createCommand('GEOPOS', 'peek coordinates', 'utility'),
		},
	}),
	[RedisFighterId.BITMAP]: createProfile({
		id: RedisFighterId.BITMAP,
		name: 'Bitmap',
		subtitle: 'The Flag Keeper',
		baseId: FighterId.RYU,
		icon: '01',
		colors: {
			primary: '#b4ff5f',
			secondary: '#f7ffe8',
			panel: 'rgba(18, 31, 7, 0.84)',
			muted: '#d8efaf',
			tint: '#b4ff5f',
		},
		docsUrl: 'https://redis.io/docs/latest/develop/data-types/bitmaps/',
		description:
			'Redis bitmaps pack huge numbers of on/off flags into compact memory, which is handy for occupancy, activity, and feature flags.',
		didYouKnow:
			'One bitmap can track millions of positions while still using bit-level storage instead of one full value per flag.',
		commands: {
			lightPunch: createCommand('SETBIT', 'toggle one flag', 'create'),
			mediumPunch: createCommand('GETBIT', 'read one flag', 'read'),
			heavyPunch: createCommand('BITOP', 'combine bitmaps', 'delete'),
			lightKick: createCommand('BITCOUNT', 'count enabled bits', 'mutate'),
			mediumKick: createCommand('BITPOS', 'find first set bit', 'query'),
			heavyKick: createCommand('BITOP XOR', 'diff flag patterns', 'signature'),
			defense: createCommand('GETBIT', 'verify a flag state', 'defense'),
			utility: createCommand('BITCOUNT', 'measure occupancy', 'utility'),
		},
	}),
	[RedisFighterId.PROBABILISTIC]: createProfile({
		id: RedisFighterId.PROBABILISTIC,
		name: 'Probabilistic',
		subtitle: 'The Estimator',
		baseId: FighterId.KEN,
		icon: '~?',
		colors: {
			primary: '#ff8fcb',
			secondary: '#fff0f7',
			panel: 'rgba(42, 8, 25, 0.84)',
			muted: '#f0b6d5',
			tint: '#ff8fcb',
		},
		docsUrl:
			'https://redis.io/docs/latest/develop/data-types/probabilistic/',
		description:
			'Redis probabilistic structures trade exactness for massive scale, which is powerful when tiny memory and fast estimates matter.',
		didYouKnow:
			'Probabilistic structures can answer huge-scale questions with far less memory than exact data structures would need.',
		commands: {
			lightPunch: createCommand('PFADD', 'add estimate sample', 'create'),
			mediumPunch: createCommand(
				'PFCOUNT',
				'read approximate count',
				'read'
			),
			heavyPunch: createCommand(
				'PFMERGE',
				'merge estimate sets',
				'delete'
			),
			lightKick: createCommand('BF.ADD', 'insert into filter', 'mutate'),
			mediumKick: createCommand(
				'BF.EXISTS',
				'test approximate membership',
				'query'
			),
			heavyKick: createCommand(
				'TOPK.ADD',
				'track heavy hitters',
				'signature'
			),
			defense: createCommand(
				'BF.EXISTS',
				'check likely membership',
				'defense'
			),
			utility: createCommand('CMS.INCRBY', 'update sketch counts', 'utility'),
		},
	}),
	[RedisFighterId.VECTOR_SET]: createProfile({
		id: RedisFighterId.VECTOR_SET,
		name: 'Vector Set',
		subtitle: 'The Similarity Hunter',
		baseId: FighterId.KEN,
		icon: 'V*',
		colors: {
			primary: '#32ecff',
			secondary: '#ebffff',
			panel: 'rgba(4, 32, 36, 0.84)',
			muted: '#a9e8ef',
			tint: '#32ecff',
		},
		docsUrl:
			'https://redis.io/docs/latest/develop/data-types/vector-sets/',
		description:
			'Redis vector sets are built for similarity search, which makes them a natural fit for embeddings, recommendations, and semantic lookup.',
		didYouKnow:
			'Vector search works by comparing how close embeddings are in high-dimensional space rather than by exact text matches.',
		commands: {
			lightPunch: createCommand('VADD', 'insert embedding', 'create'),
			mediumPunch: createCommand('VSIM', 'query similar vectors', 'read'),
			heavyPunch: createCommand('VREM', 'remove embedding', 'delete'),
			lightKick: createCommand('VDIM', 'inspect dimensions', 'mutate'),
			mediumKick: createCommand('VINFO', 'inspect index metadata', 'query'),
			heavyKick: createCommand('KNN', 'find nearest neighbors', 'signature'),
			defense: createCommand('VINFO', 'verify vector metadata', 'defense'),
			utility: createCommand('VSIM', 'peek closest matches', 'utility'),
		},
	}),
	[RedisFighterId.TIME_SERIES]: createProfile({
		id: RedisFighterId.TIME_SERIES,
		name: 'Time Series',
		subtitle: 'The Signal Reader',
		baseId: FighterId.KEN,
		icon: 'TS',
		colors: {
			primary: '#69efb7',
			secondary: '#edfff8',
			panel: 'rgba(5, 34, 24, 0.84)',
			muted: '#b6eed7',
			tint: '#69efb7',
		},
		docsUrl:
			'https://redis.io/docs/latest/develop/data-types/timeseries/',
		description:
			'Redis time series stores timestamped metrics efficiently, which is useful for telemetry, monitoring, and trend-heavy dashboards.',
		didYouKnow:
			'Time series queries can read windows of samples and compare multiple streams without reshaping the raw data first.',
		commands: {
			lightPunch: createCommand('TS.ADD', 'add one sample', 'create'),
			mediumPunch: createCommand('TS.RANGE', 'read sample window', 'read'),
			heavyPunch: createCommand('TS.DEL', 'delete sample range', 'delete'),
			lightKick: createCommand('TS.INCRBY', 'raise current metric', 'mutate'),
			mediumKick: createCommand('TS.GET', 'read latest sample', 'query'),
			heavyKick: createCommand('TS.MRANGE', 'scan multiple series', 'signature'),
			defense: createCommand('TS.GET', 'verify latest value', 'defense'),
			utility: createCommand('TS.INFO', 'inspect series metadata', 'utility'),
		},
	}),
};

export const getRedisFighter = (id) => REDIS_FIGHTERS[id];

export const getRedisRoster = () =>
	REDIS_ROSTER_ORDER.map((id) => REDIS_FIGHTERS[id]);

export const getRedisCommandByState = (fighterId, state) =>
	REDIS_FIGHTERS[fighterId]?.commandsByState[state];
