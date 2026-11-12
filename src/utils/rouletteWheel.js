/*
 * Roulette wheel rendering (European wheel, single 0).
 *
 * Pockets are placed clockwise in the real wheel order, pocket 0 (the zero) at the top.
 * Used for the result image (ball resting in the winning pocket) and by
 * generateWheelFrames.js to produce the ball animation frames.
 */

const { createCanvas } = require('canvas');
const table = require('./rouletteTable.js');

// Numbers in the order they are placed on a European wheel (clockwise)
const WHEEL_ORDER = [
	0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
	31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const POCKETS = WHEEL_ORDER.length;
const STEP = (Math.PI * 2) / POCKETS;

const SIZE = 512;
const C = SIZE / 2;

// Radii (px)
const R = {
	outer: 250,
	gold: 243,
	track: 237,
	pocketOuter: 212,
	pocketInner: 150,
	cone: 150,
	digits: 172,
	hub: 36,
};

// Distance of the ball from the center
const BALL_RADIUS = {
	track: 225, // rolling on the outer track, above the pockets
	pocket: 200, // moving over the pockets, passing over the numbers
	rest: 192, // resting inside the pocket
};

const POCKET_COLORS = { red: '#c0281c', black: '#161616', green: '#1f8a4c' };

/** Angle (radians) of the center of the pocket at `position` (0 = the zero pocket, at the top) */
function pocketAngle(position) {
	return -Math.PI / 2 + position * STEP;
}

/** Position on the wheel of a number */
function positionOf(number) {
	return WHEEL_ORDER.indexOf(number);
}

function sectorPath(ctx, a0, a1, r0, r1) {
	ctx.beginPath();
	ctx.arc(C, C, r1, a0, a1);
	ctx.arc(C, C, r0, a1, a0, true);
	ctx.closePath();
}

function radial(ctx, r0, r1, stops) {
	const gradient = ctx.createRadialGradient(C, C, r0, C, C, r1);
	stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
	return gradient;
}

function drawBall(ctx, angle, radius) {
	const x = C + Math.cos(angle) * radius;
	const y = C + Math.sin(angle) * radius;
	const r = 9;

	ctx.save();
	ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
	ctx.shadowBlur = 6;
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 3;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = '#f4f4f4';
	ctx.fill();
	ctx.restore();

	const gradient = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, r);
	gradient.addColorStop(0, '#ffffff');
	gradient.addColorStop(0.55, '#e3e3e3');
	gradient.addColorStop(1, '#9a9a9a');
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = gradient;
	ctx.fill();
}

/**
 * Draws the wheel.
 * @param {Object} [opt]
 * @param {number} [opt.ballAngle] ball angle in radians (0 = right, -PI/2 = top, clockwise)
 * @param {number} [opt.ballRadius] ball distance from the center, see BALL_RADIUS
 * @param {number} [opt.highlight] number whose pocket is highlighted
 * @param {number} [opt.hub] number to show in the middle of the wheel
 * @returns {Buffer} png buffer (transparent background)
 */
function drawWheel({ ballAngle, ballRadius = BALL_RADIUS.pocket, highlight, hub } = {}) {
	const canvas = createCanvas(SIZE, SIZE);
	const ctx = canvas.getContext('2d');

	// Wooden bowl
	ctx.beginPath();
	ctx.arc(C, C, R.outer, 0, Math.PI * 2);
	ctx.fillStyle = radial(ctx, R.track, R.outer, [
		[0, '#5a2d1a'],
		[0.6, '#7a3e22'],
		[1, '#3b1c10'],
	]);
	ctx.fill();

	// Gold edge
	ctx.beginPath();
	ctx.arc(C, C, R.gold, 0, Math.PI * 2);
	ctx.lineWidth = 6;
	ctx.strokeStyle = '#d4af37';
	ctx.stroke();

	// Ball track
	ctx.beginPath();
	ctx.arc(C, C, R.track, 0, Math.PI * 2);
	ctx.fillStyle = radial(ctx, R.pocketOuter, R.track, [
		[0, '#3a210f'],
		[0.5, '#7b4b24'],
		[1, '#4a2a13'],
	]);
	ctx.fill();

	// Pockets
	WHEEL_ORDER.forEach((number, position) => {
		const a0 = pocketAngle(position) - STEP / 2;
		const a1 = pocketAngle(position) + STEP / 2;
		sectorPath(ctx, a0, a1, R.pocketInner, R.pocketOuter);
		ctx.fillStyle = POCKET_COLORS[table.numberColor(number)];
		ctx.fill();
	});

	// Dividers
	ctx.strokeStyle = '#e6d28a';
	ctx.lineWidth = 1.6;
	for (let position = 0; position < POCKETS; position++) {
		const a = pocketAngle(position) - STEP / 2;
		ctx.beginPath();
		ctx.moveTo(C + Math.cos(a) * R.pocketInner, C + Math.sin(a) * R.pocketInner);
		ctx.lineTo(C + Math.cos(a) * R.pocketOuter, C + Math.sin(a) * R.pocketOuter);
		ctx.stroke();
	}
	ctx.lineWidth = 2.5;
	ctx.beginPath();
	ctx.arc(C, C, R.pocketOuter, 0, Math.PI * 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(C, C, R.pocketInner, 0, Math.PI * 2);
	ctx.stroke();

	// Numbers
	ctx.fillStyle = '#ffffff';
	ctx.font = 'bold 17px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	WHEEL_ORDER.forEach((number, position) => {
		ctx.save();
		ctx.translate(C, C);
		ctx.rotate(pocketAngle(position) + Math.PI / 2);
		ctx.fillText(String(number), 0, -R.digits);
		ctx.restore();
	});

	// Inner cone
	ctx.beginPath();
	ctx.arc(C, C, R.cone - 1, 0, Math.PI * 2);
	ctx.fillStyle = radial(ctx, 20, R.cone, [
		[0, '#e7cf94'],
		[0.55, '#c9a45c'],
		[1, '#8f6d2f'],
	]);
	ctx.fill();
	ctx.strokeStyle = '#6e5222';
	ctx.lineWidth = 3;
	ctx.stroke();

	// Cone lines and diamonds
	ctx.strokeStyle = 'rgba(80, 55, 15, 0.35)';
	ctx.lineWidth = 1.5;
	for (let i = 0; i < 8; i++) {
		const a = (i * Math.PI) / 4 + Math.PI / 8;
		ctx.beginPath();
		ctx.moveTo(C + Math.cos(a) * 40, C + Math.sin(a) * 40);
		ctx.lineTo(C + Math.cos(a) * (R.cone - 2), C + Math.sin(a) * (R.cone - 2));
		ctx.stroke();
	}
	ctx.fillStyle = '#f3e3b0';
	for (let i = 0; i < 8; i++) {
		const a = (i * Math.PI) / 4 + Math.PI / 8;
		ctx.save();
		ctx.translate(C + Math.cos(a) * 112, C + Math.sin(a) * 112);
		ctx.rotate(a);
		ctx.fillRect(-6, -3, 12, 6);
		ctx.restore();
	}

	// Turret cross
	ctx.lineCap = 'round';
	for (let i = 0; i < 4; i++) {
		const a = (i * Math.PI) / 2;
		ctx.beginPath();
		ctx.moveTo(C, C);
		ctx.lineTo(C + Math.cos(a) * 92, C + Math.sin(a) * 92);
		ctx.lineWidth = 9;
		ctx.strokeStyle = '#8f6d2f';
		ctx.stroke();
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#f0d88a';
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(C + Math.cos(a) * 94, C + Math.sin(a) * 94, 7, 0, Math.PI * 2);
		ctx.fillStyle = radial(ctx, 0, 1, [[0, '#f0d88a']]);
		ctx.fillStyle = '#f0d88a';
		ctx.fill();
		ctx.strokeStyle = '#8f6d2f';
		ctx.lineWidth = 2;
		ctx.stroke();
	}
	ctx.lineCap = 'butt';

	// Hub
	ctx.beginPath();
	ctx.arc(C, C, R.hub, 0, Math.PI * 2);
	if (hub === undefined) {
		ctx.fillStyle = radial(ctx, 4, R.hub, [
			[0, '#fff1bd'],
			[1, '#b8902f'],
		]);
	} else {
		ctx.fillStyle = POCKET_COLORS[table.numberColor(hub)];
	}
	ctx.fill();
	ctx.lineWidth = 4;
	ctx.strokeStyle = '#d4af37';
	ctx.stroke();
	if (hub !== undefined) {
		ctx.fillStyle = '#ffffff';
		ctx.font = `bold ${String(hub).length > 1 ? 28 : 32}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(String(hub), C, C + 2);
	}

	// Highlighted pocket
	if (highlight !== undefined) {
		const position = positionOf(highlight);
		const a0 = pocketAngle(position) - STEP / 2;
		const a1 = pocketAngle(position) + STEP / 2;
		sectorPath(ctx, a0, a1, R.pocketInner, R.pocketOuter);
		ctx.lineWidth = 4;
		ctx.strokeStyle = '#ffd24a';
		ctx.stroke();
	}

	// Ball
	if (ballAngle !== undefined) drawBall(ctx, ballAngle, ballRadius);

	return canvas.toBuffer('image/png');
}

/** Wheel with the ball resting in the pocket of `number` */
function drawResult(number) {
	return drawWheel({
		ballAngle: pocketAngle(positionOf(number)),
		ballRadius: BALL_RADIUS.rest,
		highlight: number,
		hub: number,
	});
}

module.exports = {
	WHEEL_ORDER,
	POCKETS,
	STEP,
	BALL_RADIUS,
	pocketAngle,
	positionOf,
	drawWheel,
	drawResult,
};
