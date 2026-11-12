/*
 * The roulette table with the wheel next to it, as ONE png in the table's felt colors.
 * Used in the lobby (empty wheel) and in the result (wheel with the ball in the winning pocket).
 */

const { createCanvas, Image } = require('canvas');
const table = require('./rouletteTable.js');
const wheel = require('./rouletteWheel.js');

const PADDING = 12;

function toImage(buffer) {
	const image = new Image();
	image.src = buffer;
	return image;
}

/**
 * @param {Object} opt
 * @param {Object<string, number>} [opt.bets] bet key -> amount
 * @param {number} [opt.winning] winning number (0-36). Without it the wheel is empty
 * @param {boolean} [opt.tray] draw the chip tray under the table
 * @returns {Buffer} png buffer
 */
function drawBoard({ bets = {}, winning, tray = false } = {}) {
	const tableImage = toImage(table.drawTable({ bets, winning, tray }));
	const wheelImage = toImage(winning === undefined ? wheel.drawWheel({}) : wheel.drawResult(winning));

	const size = tableImage.height - PADDING * 2;
	const panelWidth = size + PADDING * 2;
	const width = tableImage.width + panelWidth;
	const height = tableImage.height;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingQuality = 'high';

	// Same felt and border as the table, so the wheel panel looks like part of it
	ctx.fillStyle = table.COLORS.feltDark;
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = table.COLORS.felt;
	ctx.fillRect(4, 4, width - 8, height - 8);

	ctx.drawImage(tableImage, 0, 0);
	ctx.drawImage(wheelImage, tableImage.width + PADDING, PADDING, size, size);
	return canvas.toBuffer('image/png');
}

module.exports = { drawBoard };
