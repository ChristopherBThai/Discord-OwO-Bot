/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in magic*/

module.exports = class Magic extends PassiveInterface {
	init() {
		this.id = 2;
		this.name = 'Magic';
		this.basicDesc = 'Increases your Magic';
		this.emojis = [
			'<:cmag:535290422340222987>',
			'<:umag:535290422969499668>',
			'<:rmag:535290422973562920>',
			'<:emag:535290422940139520>',
			'<:mmag:535290422923231247>',
			'<:lmag:535290422893871114>',
			'<:fmag:535290422852059138>',
		];
		this.statDesc = 'Increases your <:mag:531616156231139338>MAG by **?%**';
		this.qualityList = [[5, 20]];
	}

	alterStats(stats) {
		let bonus = stats.mag[0] * (this.stats[0] / 100);
		stats.mag[1] += bonus;
	}
};
