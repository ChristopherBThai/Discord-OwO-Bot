/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in physical resistance*/

module.exports = class PhysicalResistance extends PassiveInterface {
	init() {
		this.id = 5;
		this.name = 'Physical Resistance';
		this.basicDesc = 'Increases your Physical Resistance';
		this.emojis = [
			'<:cpr:535290422730162177>',
			'<:upr:535290423023763461>',
			'<:rpr:535290422902390789>',
			'<:epr:535290422738681884>',
			'<:mpr:535290422910779411>',
			'<:lpr:535290422554001410>',
			'<:fpr:535290422793338880>',
		];
		this.statDesc = 'Increases your <:pr:531616156222488606>PR by **?%**';
		this.qualityList = [[15, 35]];
	}

	alterStats(stats) {
		let bonus = stats.pr[0] * (this.stats[0] / 100);
		stats.pr[1] += bonus;
	}
};
