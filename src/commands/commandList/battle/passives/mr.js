/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in magical resistance*/

module.exports = class MagicalResistance extends PassiveInterface {
	init() {
		this.id = 6;
		this.name = 'Magical Resistance';
		this.basicDesc = 'Increases your Magical Resistance';
		this.emojis = [
			'<:cmr:535290422503800832>',
			'<:umr:535290422919036938>',
			'<:rmr:535290422810116097>',
			'<:emr:535290422226845697>',
			'<:mmr:535290422243622913>',
			'<:lmr:535290422688219146>',
			'<:fmr:535290422252273675>',
		];
		this.statDesc = 'Increases your <:mr:531616156226945024>MR by **?%**';
		this.qualityList = [[15, 35]];
	}

	alterStats(stats) {
		let bonus = stats.mr[0] * (this.stats[0] / 100);
		stats.mr[1] += bonus;
	}
};
