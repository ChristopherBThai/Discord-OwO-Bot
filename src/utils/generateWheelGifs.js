/*
 * Builds roulette spin GIFs from the frames in "resim" (run generateWheelFrames.js first).
 *
 *   node src/utils/generateWheelGifs.js
 *
 * Output (resim/gif):
 *   spin_<n>.gif     "Spinning..." banner + the ball circles the track fast, drops onto the
 *                    numbers, slows down and stops on <n> (0..36). Loops forever, so it never
 *                    looks frozen (the bot deletes the message when the spin is over).
 *   emoji_cark.gif   tiny looping wheel (max 256 KB) used as an animated application emoji
 *   cark_donus.gif   larger looping wheel
 *   gif_bilgi.json   duration of every spin GIF in ms (the bot waits this long)
 *
 * Requires ffmpeg in PATH. The source PNG frames are not modified.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { createCanvas, loadImage } = require('canvas');
const wheel = require('./rouletteWheel.js');

const root = path.join(__dirname, '../../resim');
const outDir = path.join(root, 'gif');
const SUB_STEPS = 4;
const FRAMES = wheel.POCKETS * SUB_STEPS;
const SIZE = 360;
const BANNER = 50;

// Phase A: fast laps on the outer track. [frame step, delay ms] per GIF frame
const PHASE_A = Array.from({ length: 36 }, () => [6, 40]);
// Phase B: over the numbers, slowing down
const PHASE_B = [
	...Array.from({ length: 10 }, () => [4, 50]),
	...Array.from({ length: 8 }, () => [3, 70]),
	...Array.from({ length: 8 }, () => [2, 100]),
	...Array.from({ length: 8 }, () => [1, 140]),
	...Array.from({ length: 4 }, () => [1, 220]),
	...Array.from({ length: 2 }, () => [1, 350]),
];
const FINAL_HOLD = 2500;

const pad = (n) => String(n).padStart(3, '0');
const mod = (n) => ((n % FRAMES) + FRAMES) % FRAMES;
const pist = (k) => path.join(root, 'pist', `pist_${pad(mod(k))}.png`);
const hareket = (k) => path.join(root, 'hareket', `hareket_${pad(mod(k))}.png`);

/** Returns [{ file, ms, final }] for a spin that ends on `number` */
function buildSequence(number) {
	const target = wheel.positionOf(number) * SUB_STEPS;
	const totalB = PHASE_B.reduce((sum, [step]) => sum + step, 0);
	const startB = mod(target - totalB);

	const seq = [];
	let k = startB - PHASE_A.reduce((sum, [step]) => sum + step, 0);
	for (const [step, ms] of PHASE_A) {
		seq.push({ file: pist(k), ms });
		k += step;
	}
	k = startB;
	for (const [step, ms] of PHASE_B) {
		seq.push({ file: hareket(k), ms });
		k += step;
	}
	seq.push({ file: path.join(root, 'sonuc', `sonuc_${number}.png`), ms: FINAL_HOLD, final: true });
	return seq;
}

function roundRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

/** Wheel frame + text banner underneath, as a PNG buffer */
async function composeFrame(item, index, number) {
	const canvas = createCanvas(SIZE, SIZE + BANNER);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingQuality = 'high';
	// Same felt colors as the roulette table image
	ctx.fillStyle = '#14502b';
	ctx.fillRect(0, 0, SIZE, SIZE + BANNER);
	ctx.fillStyle = '#1b6b3a';
	ctx.fillRect(4, 4, SIZE - 8, SIZE + BANNER - 8);
	ctx.drawImage(await loadImage(item.file), 0, 0, SIZE, SIZE);

	const bx = 30;
	const bw = SIZE - 60;
	const by = SIZE + 6;
	const bh = BANNER - 10;
	roundRect(ctx, bx, by, bw, bh, 14);
	ctx.fillStyle = '#1e1f22';
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = item.final ? '#2ecc71' : '#f1c40f';
	ctx.stroke();

	ctx.font = 'bold 22px sans-serif';
	ctx.textBaseline = 'middle';
	if (item.final) {
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.fillText(`Ball landed on ${number}!`, SIZE / 2, by + bh / 2 + 1);
	} else {
		const full = 'Spinning...';
		const dots = Math.floor(index / 3) % 4; // 0..3 dots
		const shown = 'Spinning' + '.'.repeat(dots);
		ctx.fillStyle = '#f1c40f';
		ctx.textAlign = 'left';
		ctx.fillText(shown, (SIZE - ctx.measureText(full).width) / 2, by + bh / 2 + 1);
	}
	return canvas.toBuffer('image/png');
}

function runFfmpeg(args) {
	execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
}

function paletteFilter(colors, scale) {
	return (
		(scale ? `scale=${scale}:${scale}:flags=lanczos,` : '') +
		`split[a][b];[a]palettegen=reserve_transparent=1:max_colors=${colors}[p];` +
		`[b][p]paletteuse=alpha_threshold=128:dither=none`
	);
}

function concatList(tmp, entries) {
	const list = path.join(tmp, 'list.txt');
	const lines = [];
	for (const { file, ms } of entries) lines.push(`file '${file}'`, `duration ${ms / 1000}`);
	// concat demuxer ignores the duration of the last entry unless it is repeated
	lines.push(`file '${entries[entries.length - 1].file}'`);
	fs.writeFileSync(list, lines.join('\n'));
	return list;
}

async function encodeSpin(number, output) {
	const seq = buildSequence(number);
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rulet-'));
	try {
		const entries = [];
		for (let i = 0; i < seq.length; i++) {
			const file = path.join(tmp, `f_${pad(i)}.png`);
			fs.writeFileSync(file, await composeFrame(seq[i], i, number));
			entries.push({ file, ms: seq[i].ms });
		}
		runFfmpeg(
			['-f', 'concat', '-safe', '0', '-i', concatList(tmp, entries)]
				.concat(['-vf', paletteFilter(128), '-loop', '0', output])
		);
	} finally {
		fs.rmSync(tmp, { recursive: true, force: true });
	}
	return seq.reduce((sum, { ms }) => sum + ms, 0);
}

/** Plain looping wheel: one lap, `every` frames apart */
function encodeLoop(output, { every, ms, colors, scale }) {
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rulet-'));
	try {
		const entries = [];
		for (let k = 0; k < FRAMES; k += every) entries.push({ file: pist(k), ms });
		runFfmpeg(
			['-f', 'concat', '-safe', '0', '-i', concatList(tmp, entries)]
				.concat(['-vf', paletteFilter(colors, scale), '-loop', '0', output])
		);
	} finally {
		fs.rmSync(tmp, { recursive: true, force: true });
	}
}

/** Animated emoji must be <= 256 KB: try smaller settings until it fits */
function buildEmoji(output) {
	const tries = [
		{ every: 4, ms: 50, colors: 64, scale: 128 },
		{ every: 4, ms: 50, colors: 48, scale: 112 },
		{ every: 6, ms: 70, colors: 32, scale: 96 },
		{ every: 8, ms: 90, colors: 32, scale: 96 },
		{ every: 8, ms: 90, colors: 24, scale: 80 },
	];
	for (const options of tries) {
		encodeLoop(output, options);
		const size = fs.statSync(output).size;
		console.log(`emoji_cark.gif ${options.scale}px -> ${Math.round(size / 1024)} KB`);
		if (size <= 250 * 1024) return;
	}
	console.warn('UYARI: emoji 256 KB altina inemedi');
}

async function main() {
	fs.mkdirSync(outDir, { recursive: true });

	const info = {};
	for (let n = 0; n <= 36; n++) {
		info[n] = await encodeSpin(n, path.join(outDir, `spin_${n}.gif`));
	}

	encodeLoop(path.join(outDir, 'cark_donus.gif'), { every: 4, ms: 40, colors: 128, scale: SIZE });
	buildEmoji(path.join(outDir, 'emoji_cark.gif'));

	fs.writeFileSync(
		path.join(outDir, 'gif_bilgi.json'),
		JSON.stringify({ boyut: `${SIZE}x${SIZE + BANNER}`, sure_ms: info }, null, '\t')
	);
	console.log(`Tamam: 37 spin gif + cark_donus.gif + emoji_cark.gif -> ${outDir}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
