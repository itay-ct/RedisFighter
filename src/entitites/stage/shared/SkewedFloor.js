import {
	STAGE_MID_POINT,
	STAGE_PADDING,
	STAGE_WIDTH,
} from "../../../constants/Stage.js";
import { getRenderScale } from "../../../utils/context.js";

export class SkewedFloor {
	constructor(image, dimensions) {
		this.image = image;
		this.dimensions = dimensions;
	}

	draw = (context, camera, y) => {
		const [sourceX, sourceY, width, height] = this.dimensions;
		const scale = getRenderScale();

		context.save();
		context.setTransform(
			scale,
			0,
			(-5.15 - (camera.position.x - (STAGE_WIDTH + STAGE_PADDING)) / 112) * scale,
			scale,
			(32 - camera.position.x / 1.55) * scale,
			(y - camera.position.y) * scale
		);

		context.drawImage(
			this.image,
			sourceX,
			sourceY,
			width,
			height,
			0,
			0,
			width,
			height
		);

		context.restore();
	};
}
