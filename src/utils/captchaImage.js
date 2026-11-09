/*
 * OwO Bot for Discord
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WIDTH = 400;
const HEIGHT = 150;
const COLORS = ['#f5f5f5', '#ffd166', '#06d6a0', '#8ecae6', '#ff9aa2'];

function random(min, max) {
	return min + Math.random() * (max - min);
}

function pick(list) {
	return list[Math.floor(Math.random() * list.length)];
}

/**
 * Draws the word as a distorted PNG so it is readable by humans only.
 */
exports.generate = function (word) {
	const { createCanvas } = require('canvas');
	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#23272a';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	for (let i = 0; i < 8; i++) {
		ctx.strokeStyle = pick(COLORS);
		ctx.globalAlpha = 0.5;
		ctx.lineWidth = random(1, 3);
		ctx.beginPath();
		ctx.moveTo(random(0, WIDTH), random(0, HEIGHT));
		ctx.bezierCurveTo(
			random(0, WIDTH),
			random(0, HEIGHT),
			random(0, WIDTH),
			random(0, HEIGHT),
			random(0, WIDTH),
			random(0, HEIGHT)
		);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;

	const letters = String(word).split('');
	const size = Math.min(80, Math.floor((WIDTH - 40) / Math.max(letters.length, 1)) * 1.4);
	ctx.font = `bold ${Math.floor(size)}px sans-serif`;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';
	const step = (WIDTH - 40) / letters.length;

	letters.forEach((letter, i) => {
		ctx.save();
		ctx.translate(20 + step * (i + 0.5), HEIGHT / 2 + random(-15, 15));
		ctx.rotate(random(-0.4, 0.4));
		ctx.fillStyle = pick(COLORS);
		ctx.fillText(letter, 0, 0);
		ctx.restore();
	});

	for (let i = 0; i < 120; i++) {
		ctx.fillStyle = pick(COLORS);
		ctx.globalAlpha = 0.6;
		ctx.fillRect(random(0, WIDTH), random(0, HEIGHT), 2, 2);
	}

	return canvas.toBuffer('image/png');
};
