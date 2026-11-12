/*
 * Roulette logic and table rendering (European roulette: a single 0)
 */

const { createCanvas } = require('canvas');

// Chip denominations, in the order they are shown to the player
const CHIPS = [1, 5, 25, 50, 100, 500, 1000, 5000];

const CHIP_STYLES = {
	1: { color: '#ecf0f1', ring: '#bdc3c7', text: '#2c3e50' },
	5: { color: '#d9291c', ring: '#8e1a11', text: '#ffffff' },
	25: { color: '#27ae60', ring: '#176a39', text: '#ffffff' },
	50: { color: '#2980b9', ring: '#1b567b', text: '#ffffff' },
	100: { color: '#222222', ring: '#000000', text: '#ffffff' },
	500: { color: '#8e44ad', ring: '#5b2c6f', text: '#ffffff' },
	1000: { color: '#f1c40f', ring: '#b7950b', text: '#2c3e50' },
	5000: { color: '#e67e22', ring: '#a04000', text: '#ffffff' },
};

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const OUTSIDE_BETS = {
	d1: { label: '1-12', multiplier: 3, win: (n) => n >= 1 && n <= 12 },
	d2: { label: '13-24', multiplier: 3, win: (n) => n >= 13 && n <= 24 },
	d3: { label: '25-36', multiplier: 3, win: (n) => n >= 25 },
	c1: { label: '1st', multiplier: 3, win: (n) => n >= 1 && n % 3 === 1 },
	c2: { label: '2nd', multiplier: 3, win: (n) => n >= 1 && n % 3 === 2 },
	c3: { label: '3rd', multiplier: 3, win: (n) => n >= 1 && n % 3 === 0 },
	even: { label: 'Even', multiplier: 2, win: (n) => n >= 1 && n % 2 === 0 },
	red: { label: 'Red', multiplier: 2, win: (n) => RED_NUMBERS.has(n) },
	black: { label: 'Black', multiplier: 2, win: (n) => n >= 1 && !RED_NUMBERS.has(n) },
	odd: { label: 'Odd', multiplier: 2, win: (n) => n >= 1 && n % 2 === 1 },
};

// Bet key of the straight bet on zero
const ZERO_KEY = 'n:0';
const ZERO_MULTIPLIER = 36;

function isValidBetKey(key) {
	return key === ZERO_KEY || !!OUTSIDE_BETS[key];
}

function numberLabel(index) {
	return String(index);
}

function numberColor(index) {
	if (index === 0) return 'green';
	return RED_NUMBERS.has(index) ? 'red' : 'black';
}

function numberEmoji(index) {
	return { green: '🟢', red: '🔴', black: '⚫' }[numberColor(index)];
}

function betLabel(key) {
	return key === ZERO_KEY ? '0' : OUTSIDE_BETS[key].label;
}

/**
 * Returns the total amount returned to the player (stake included) for one bet.
 * 0 if the bet lost.
 */
function betReturn(key, amount, winningIndex) {
	if (key === ZERO_KEY) return winningIndex === 0 ? amount * ZERO_MULTIPLIER : 0;
	const bet = OUTSIDE_BETS[key];
	return bet.win(winningIndex) ? amount * bet.multiplier : 0;
}

/* ------------------------------ Rendering ------------------------------ */

const CELL_W = 64;
const CELL_H = 64;
const MARGIN = 16;
const ZERO_W = 64;
const ROW_SMALL_H = 56;
const HEADER_H = 40;
const TRAY_H = 84;

const GRID_X = MARGIN + ZERO_W;
const GRID_Y = MARGIN + HEADER_H;
const WIDTH = MARGIN * 2 + ZERO_W + CELL_W * 13;
const BASE_HEIGHT = GRID_Y + CELL_H * 3 + ROW_SMALL_H * 2 + MARGIN;

const COLORS = {
	felt: '#1b6b3a',
	feltDark: '#14502b',
	line: '#f2f2f2',
	red: '#d9291c',
	black: '#111111',
	green: '#2e8b4f',
	gold: '#ffd24a',
	text: '#ffffff',
};

/** Returns the rectangle of a bet area (or a number cell, `n:<number>`) on the table */
function betRect(key) {
	if (key === ZERO_KEY) return { x: MARGIN, y: GRID_Y, w: ZERO_W, h: CELL_H * 3 };
	if (key.startsWith('n:')) {
		const n = Number(key.slice(2));
		const col = Math.floor((n - 1) / 3);
		const row = 2 - ((n - 1) % 3); // 3, 6, 9... on the top row
		return { x: GRID_X + col * CELL_W, y: GRID_Y + row * CELL_H, w: CELL_W, h: CELL_H };
	}

	const columnX = GRID_X + CELL_W * 12;
	const dozenY = GRID_Y + CELL_H * 3;
	const outsideY = dozenY + ROW_SMALL_H;
	switch (key) {
		case 'c3':
			return { x: columnX, y: GRID_Y, w: CELL_W, h: CELL_H };
		case 'c2':
			return { x: columnX, y: GRID_Y + CELL_H, w: CELL_W, h: CELL_H };
		case 'c1':
			return { x: columnX, y: GRID_Y + CELL_H * 2, w: CELL_W, h: CELL_H };
		case 'd1':
		case 'd2':
		case 'd3': {
			const i = Number(key[1]) - 1;
			return { x: GRID_X + i * CELL_W * 4, y: dozenY, w: CELL_W * 4, h: ROW_SMALL_H };
		}
		default: {
			const i = ['even', 'red', 'black', 'odd'].indexOf(key);
			return { x: GRID_X + i * CELL_W * 3, y: outsideY, w: CELL_W * 3, h: ROW_SMALL_H };
		}
	}
}

function fancyAmount(amount) {
	if (amount >= 1000000) return `${+(amount / 1000000).toFixed(1)}M`;
	if (amount >= 1000) return `${+(amount / 1000).toFixed(1)}K`;
	return String(amount);
}

function drawCell(
	ctx,
	rect,
	fill,
	label,
	{ fontSize = 26, textColor = COLORS.text, labelDy = 0 } = {}
) {
	ctx.fillStyle = fill;
	ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
	ctx.strokeStyle = COLORS.line;
	ctx.lineWidth = 2;
	ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
	if (label !== undefined) {
		ctx.fillStyle = textColor;
		ctx.font = `bold ${fontSize}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + labelDy);
	}
}

/** A single casino chip with its denomination in the middle */
function drawChip(ctx, cx, cy, radius, denomination) {
	const style = CHIP_STYLES[denomination];
	const label = String(denomination);

	// Shadow
	ctx.beginPath();
	ctx.arc(cx + 1, cy + 2, radius, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
	ctx.fill();

	// Body
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI * 2);
	ctx.fillStyle = style.color;
	ctx.fill();
	ctx.lineWidth = Math.max(1, radius * 0.08);
	ctx.strokeStyle = style.ring;
	ctx.stroke();

	// Dashed edge
	ctx.beginPath();
	ctx.arc(cx, cy, radius * 0.86, 0, Math.PI * 2);
	ctx.lineWidth = radius * 0.2;
	ctx.setLineDash([radius * 0.35, radius * 0.3]);
	ctx.strokeStyle = style.text === '#ffffff' ? '#ffffff' : style.ring;
	ctx.stroke();
	ctx.setLineDash([]);

	// Inner disc
	ctx.beginPath();
	ctx.arc(cx, cy, radius * 0.62, 0, Math.PI * 2);
	ctx.fillStyle = style.color;
	ctx.fill();
	ctx.lineWidth = Math.max(1, radius * 0.05);
	ctx.strokeStyle = style.ring;
	ctx.stroke();

	// Value
	ctx.fillStyle = style.text;
	const size = Math.round(radius * (label.length > 3 ? 0.58 : label.length > 2 ? 0.7 : 0.82));
	ctx.font = `bold ${size}px sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(label, cx, cy + 1);
}

/** Splits an amount into chips (max 4), largest first */
function toChips(amount) {
	const result = [];
	for (const denomination of [...CHIPS].reverse()) {
		while (amount >= denomination && result.length < 4) {
			result.push(denomination);
			amount -= denomination;
		}
	}
	return result;
}

/** Stack of chips with the total amount of the bet. Placed where it does not cover the cell text. */
function drawBet(ctx, rect, amount) {
	const wide = rect.w >= CELL_W * 3;
	const column = rect.w === CELL_W && rect.h === CELL_H;
	const tall = rect.h > CELL_H * 2;

	let cx = rect.x + rect.w / 2;
	let cy = rect.y + rect.h / 2 - 7;
	let radius = 15;
	let labelY = rect.y + rect.h / 2 + 12;
	if (wide) {
		cx = rect.x + rect.w * 0.88;
	} else if (column) {
		cy = rect.y + 35;
		radius = 12;
		labelY = rect.y + rect.h - 18;
	} else if (tall) {
		cy = rect.y + rect.h * 0.72;
		labelY = cy + 18;
	}

	const stack = toChips(amount);
	stack.forEach((denomination, i) => {
		drawChip(ctx, cx, cy - i * 3 + (stack.length - 1) * 1.5, radius, denomination);
	});

	const text = fancyAmount(amount);
	ctx.font = 'bold 12px sans-serif';
	const width = ctx.measureText(text).width + 10;
	ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
	ctx.fillRect(cx - width / 2, labelY, width, 16);
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, cx, labelY + 8.5);
}

/**
 * Draws the roulette table.
 * @param {Object} opt
 * @param {Object<string, number>} [opt.bets] bet key -> amount
 * @param {number} [opt.winning] winning number (0-36)
 * @param {boolean} [opt.tray] draw all the chips under the table
 * @returns {Buffer} png buffer
 */
function drawTable({ bets = {}, winning, tray = false } = {}) {
	const HEIGHT = BASE_HEIGHT + (tray ? TRAY_H : 0);
	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext('2d');

	// Felt
	ctx.fillStyle = COLORS.feltDark;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.fillStyle = COLORS.felt;
	ctx.fillRect(4, 4, WIDTH - 8, HEIGHT - 8);

	// Header
	ctx.fillStyle = COLORS.gold;
	ctx.font = 'bold 24px sans-serif';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';
	const colorNames = { green: 'GREEN', red: 'RED', black: 'BLACK' };
	ctx.fillText(
		winning === undefined
			? 'ROULETTE TABLE'
			: `WINNER: ${numberLabel(winning)}  (${colorNames[numberColor(winning)]})`,
		MARGIN,
		MARGIN + HEADER_H / 2 - 4
	);

	// Zero
	drawCell(ctx, betRect(ZERO_KEY), COLORS.green, '0', { fontSize: 34 });

	// Numbers
	for (let n = 1; n <= 36; n++) {
		drawCell(ctx, betRect(`n:${n}`), RED_NUMBERS.has(n) ? COLORS.red : COLORS.black, String(n));
	}

	// Columns, dozens and outside bets
	for (const key of ['c1', 'c2', 'c3']) {
		drawCell(ctx, betRect(key), COLORS.felt, OUTSIDE_BETS[key].label, { fontSize: 20, labelDy: -16 });
	}
	drawCell(ctx, betRect('d1'), COLORS.felt, '1 - 12');
	drawCell(ctx, betRect('d2'), COLORS.felt, '13 - 24');
	drawCell(ctx, betRect('d3'), COLORS.felt, '25 - 36');
	drawCell(ctx, betRect('even'), COLORS.felt, 'EVEN');
	drawCell(ctx, betRect('red'), COLORS.red, 'RED');
	drawCell(ctx, betRect('black'), COLORS.black, 'BLACK');
	drawCell(ctx, betRect('odd'), COLORS.felt, 'ODD');

	// Winning highlights
	if (winning !== undefined) {
		ctx.strokeStyle = COLORS.gold;
		for (const key of Object.keys(OUTSIDE_BETS)) {
			if (betReturn(key, 1, winning) > 0) {
				const r = betRect(key);
				ctx.lineWidth = 3;
				ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
			}
		}
		const r = betRect(`n:${winning}`);
		ctx.lineWidth = 6;
		ctx.strokeRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
	}

	// Bets
	for (const key in bets) {
		if (bets[key] > 0) drawBet(ctx, betRect(key), bets[key]);
	}

	// Chip tray
	if (tray) {
		const step = (WIDTH - MARGIN * 2) / CHIPS.length;
		CHIPS.forEach((denomination, i) => {
			drawChip(ctx, MARGIN + step * i + step / 2, BASE_HEIGHT + TRAY_H / 2 - 6, 26, denomination);
		});
	}

	return canvas.toBuffer('image/png');
}

/**
 * Round casino chip icon (png), meant to be uploaded as a custom emoji for the buttons.
 * @param {number} denomination one of CHIPS
 * @param {number} [size] width and height in pixels
 */
function drawChipIcon(denomination, size = 128) {
	const style = CHIP_STYLES[denomination];
	const canvas = createCanvas(size, size);
	const ctx = canvas.getContext('2d');
	const c = size / 2;
	const radius = size / 2 - 2;

	// Body
	ctx.beginPath();
	ctx.arc(c, c, radius, 0, Math.PI * 2);
	ctx.fillStyle = style.color;
	ctx.fill();
	ctx.lineWidth = size * 0.04;
	ctx.strokeStyle = style.ring;
	ctx.stroke();

	// Dashed edge
	ctx.beginPath();
	ctx.arc(c, c, radius * 0.84, 0, Math.PI * 2);
	ctx.lineWidth = radius * 0.22;
	ctx.setLineDash([radius * 0.38, radius * 0.32]);
	ctx.strokeStyle = style.text === '#ffffff' ? '#ffffff' : style.ring;
	ctx.stroke();
	ctx.setLineDash([]);

	// Inner ring
	ctx.beginPath();
	ctx.arc(c, c, radius * 0.58, 0, Math.PI * 2);
	ctx.lineWidth = size * 0.035;
	ctx.strokeStyle = style.text === '#ffffff' ? '#ffffff' : style.ring;
	ctx.stroke();

	return canvas.toBuffer('image/png');
}

module.exports = {
	COLORS,
	CHIPS,
	ZERO_KEY,
	OUTSIDE_BETS,
	isValidBetKey,
	numberLabel,
	numberColor,
	numberEmoji,
	betLabel,
	betReturn,
	drawTable,
	drawChipIcon,
};
