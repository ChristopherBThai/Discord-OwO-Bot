/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

var macro;
try {
	macro = require('../../../../../tokens/macro.js');
} catch (e) {
	console.error('Missing macro.js. Please add this file to ../tokens/macro.js\n', e);
}
const traits = {
	efficiency: { inc: 10, pow: 1.748, base: 25, upg: 1, max: 215, prefix: '/H' },
	duration: { inc: 10, pow: 1.7, base: 0.5, upg: 0.1, max: 235, prefix: 'H' },
	cost: { inc: 1000, pow: 3.4, base: 10, upg: -1, max: 5, prefix: ' cowoncy' },
	gain: { inc: 10, pow: 1.8, base: 0, upg: 25, max: 200, prefix: ' essence/H' },
	exp: { inc: 10, pow: 1.8, base: 0, upg: 35, max: 200, prefix: ' xp/H' },
	radar: {
		inc: 50,
		pow: 2.5,
		base: 0,
		upg: 0.00000004,
		max: 999,
		prefix: ' %',
	},
};
const bots = [
	'<:cbot:459996048379609098>',
	'<:ubot:459996048660889600>',
	'<:rbot:459996049361338379>',
	'<:ebot:459996050174902272>',
	'<:mbot:459996049784963073>',
	'<a:lbot:459996050883608576>',
];
//test(traits.efficiency);
//test(traits.duration);
//test(traits.cost);
//test(traits.exp);
//test(traits.gain);
//test(traits.radar);

exports.getLvl = function (xp, gain, traitName) {
	let totalxp = 0;
	let temp = {};
	let hit = false;
	let prevlvl = 0;
	const trait = traits[traitName];

	for (var i = 1; i <= trait.max + 1; i++) {
		let lvlxp = Math.trunc(trait.inc * Math.pow(i, trait.pow));
		totalxp += lvlxp;
		if (!hit && totalxp > xp) {
			prevlvl = i - 1;
			hit = true;
		}
		if (hit || i == trait.max + 1) {
			if (totalxp > xp + gain || i == trait.max + 1) {
				temp.lvl = i - 1;
				if (temp.lvl == trait.max) temp.max = true;
				temp.currentxp = xp + gain - (totalxp - lvlxp);
				temp.maxxp = lvlxp;
				if (prevlvl < temp.lvl) {
					temp.lvlup = true;
					temp.gain = trait.upg;
				}
				temp.stat = trait.base + trait.upg * temp.lvl;
				if (traitName != 'radar') temp.stat = Math.trunc(temp.stat * 10) / 10;
				else temp.stat = Math.round(temp.stat * 10000000) / 100000;
				temp.prefix = trait.prefix;
				return temp;
			}
		}
	}
};

exports.getMaxXp = function (lvl, trait) {
	return Math.trunc(traits[trait].inc * Math.pow(lvl, trait.pow));
};

/* eslint-disable-next-line */
function test(trait) {
	var total = 0;
	var result = trait.base;
	for (var i = 1; i <= trait.max; i++) {
		var xp = Math.trunc(trait.inc * Math.pow(i, trait.pow));
		total += xp;
		result += trait.upg;
		console.log(
			'[' +
				i +
				'] ' +
				total +
				' | ' +
				xp +
				'xp - ' +
				Math.round(result * 10000000) / 10000000 +
				trait.prefix
		);
	}
}

exports.captcha = async function (p, word, text) {
	let buffer = await macro.generateBuffer(word);
	p.send(text, null, { file: buffer, name: 'captcha.png' });
};

exports.getBot = function (result) {
	if (result == undefined) return bots[0];

	var rank = result.rank;
	var total = result.total;
	if (rank == undefined || total == undefined) return bots[0];
	if (rank <= 1) return bots[5];

	var percent = (rank / total) * 100;

	if (percent >= 61)
		// Common 39%
		return bots[0];
	else if (percent >= 31)
		// Uncommon 30%
		return bots[1];
	else if (percent >= 11)
		// Rare 20%
		return bots[2];
	else if (percent >= 1)
		// Epic 10%
		return bots[3];
	// Mythic 1%
	else return bots[4];
};
