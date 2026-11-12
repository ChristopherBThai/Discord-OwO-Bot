/*
 * Generates the roulette wheel images into the "resim" folder at the project root.
 *
 *   node src/utils/generateWheelFrames.js
 *
 * Output:
 *   resim/cark_bos.png            empty wheel (no ball)
 *   resim/pist/pist_000.png ...   ball on the outer track, circling the wheel (148 frames)
 *   resim/hareket/hareket_000.png ball over the numbers, one number at a time (148 frames)
 *   resim/sonuc/sonuc_<n>.png     ball resting in pocket <n> (0..36), pocket highlighted
 *   resim/bilgi.json              wheel order and notes
 */

const fs = require('fs');
const path = require('path');
const wheel = require('./rouletteWheel.js');

const root = path.join(__dirname, '../../resim');
const SUB_STEPS = 4; // frames per pocket
const FRAMES = wheel.POCKETS * SUB_STEPS;

const dirs = {
	pist: path.join(root, 'pist'),
	hareket: path.join(root, 'hareket'),
	sonuc: path.join(root, 'sonuc'),
};

const pad = (n, len = 3) => String(n).padStart(len, '0');

function main() {
	for (const dir of Object.values(dirs)) fs.mkdirSync(dir, { recursive: true });

	fs.writeFileSync(path.join(root, 'cark_bos.png'), wheel.drawWheel({}));

	const frameInfo = [];
	for (let k = 0; k < FRAMES; k++) {
		// Frame k: the ball is k/SUB_STEPS pockets clockwise from the top (the 0 pocket)
		const angle = wheel.pocketAngle(0) + (k * wheel.STEP) / SUB_STEPS;
		const position = Math.round(k / SUB_STEPS) % wheel.POCKETS;

		fs.writeFileSync(
			path.join(dirs.pist, `pist_${pad(k)}.png`),
			wheel.drawWheel({ ballAngle: angle, ballRadius: wheel.BALL_RADIUS.track })
		);
		fs.writeFileSync(
			path.join(dirs.hareket, `hareket_${pad(k)}.png`),
			wheel.drawWheel({ ballAngle: angle, ballRadius: wheel.BALL_RADIUS.pocket })
		);
		frameInfo.push({ kare: k, altindaki_sayi: wheel.WHEEL_ORDER[position] });
	}

	for (let n = 0; n <= 36; n++) {
		fs.writeFileSync(path.join(dirs.sonuc, `sonuc_${n}.png`), wheel.drawResult(n));
	}

	fs.writeFileSync(
		path.join(root, 'bilgi.json'),
		JSON.stringify(
			{
				boyut: '512x512, seffaf arka plan',
				cark_sirasi: wheel.WHEEL_ORDER,
				aciklama: {
					yon: 'Toplar saat yonunde doner. 0 numarali cep en ustte.',
					kare_sayisi: FRAMES,
					cep_basina_kare: SUB_STEPS,
					pist: 'Top dis pistte (rakamlarin disinda) doner.',
					hareket: 'Top rakamlarin uzerinden tek tek gecer.',
					sonuc: 'sonuc_<sayi>.png: top o sayinin cebinde durur ve cep altin renkle vurgulanir.',
					kullanim:
						'Animasyon icin pist/hareket karelerini sirayla oynat (000 -> 147). ' +
						'Son kareler icin hedef sayinin cebine kadar ilerle, sonra sonuc_<sayi>.png goster. ' +
						'Hedef kare = cark_sirasi.indexOf(sayi) * cep_basina_kare.',
				},
				kareler: frameInfo,
			},
			null,
			'\t'
		)
	);

	console.log(`Tamam: ${FRAMES} pist + ${FRAMES} hareket + 37 sonuc + 1 bos cark -> ${root}`);
}

main();
