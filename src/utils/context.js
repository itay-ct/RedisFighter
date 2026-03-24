import { SCENE_HEIGHT, SCENE_WIDTH } from '../constants/Stage.js';

let renderScale = 1;

export const drawFrame = (context, image, dimensions, x, y, direction = 1) => {
	const [sourceX, sourceY, sourceWidth, sourceHeight] = dimensions;

	context.save();
	context.scale(direction, 1);
	context.drawImage(
		image,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		x * direction,
		y,
		sourceWidth,
		sourceHeight
	);
	context.restore();
};

export const getCanvas = () => document.querySelector('canvas');

export const getRenderScale = () => renderScale;

export const resizeCanvasDisplay = () => {
	const canvasEL = getCanvas();
	const viewportWidth = window.innerWidth ?? SCENE_WIDTH + 24;
	const viewportHeight = window.innerHeight ?? SCENE_HEIGHT + 24;
	const horizontalScale = (viewportWidth - 24) / SCENE_WIDTH;
	const verticalScale = (viewportHeight - 24) / SCENE_HEIGHT;
	const fitScale = Math.min(horizontalScale, verticalScale);
	const displayScale =
		fitScale >= 1 ? Math.max(1, Math.floor(fitScale)) : Math.max(0.75, fitScale);
	const deviceScale = window.devicePixelRatio ?? 1;

	renderScale = Math.min(
		6,
		Math.max(2, Math.ceil(displayScale * deviceScale))
	);

	canvasEL.style.width = `${Math.floor(SCENE_WIDTH * displayScale)}px`;
	canvasEL.style.height = `${Math.floor(SCENE_HEIGHT * displayScale)}px`;
	canvasEL.width = SCENE_WIDTH * renderScale;
	canvasEL.height = SCENE_HEIGHT * renderScale;

	const context = canvasEL.getContext('2d');
	context.imageSmoothingEnabled = false;
};

export const getContext = () => {
	const canvasEL = getCanvas();
	const context = canvasEL.getContext('2d');
	context.imageSmoothingEnabled = false;
	return context;
};

export const prepareContext = (context) => {
	context.setTransform(renderScale, 0, 0, renderScale, 0, 0);
	context.imageSmoothingEnabled = false;
};

export const getCanvasCoordinates = (event) => {
	const canvasEL = getCanvas();
	const bounds = canvasEL.getBoundingClientRect();

	return {
		x: ((event.clientX - bounds.left) * SCENE_WIDTH) / bounds.width,
		y: ((event.clientY - bounds.top) * SCENE_HEIGHT) / bounds.height,
	};
};
