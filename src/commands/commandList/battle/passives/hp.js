/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in hp*/

module.exports = class HealthPoint extends PassiveInterface {
	init() {
		this.id = 3;
		this.name = 'Health Point';
		this.basicDesc = 'Increases your Health Points';
		this.emojis = [
			'<:chp:535290421467807755>',
			'<:uhp:535290422721904640>',
			'<:rhp:535290422709321748>',
			'<:ehp:535290421740568577>',
			'<:mhp:535290421769928716>',
			'<:lhp:535290422147153930>',
			'<:fhp:535290422306799616>',
		];
		this.statDesc = 'Increases your <:hp:531620120410456064>HP by **?%**';
		this.qualityList = [[5, 20]];
	}

	alterStats(stats) {
		let bonus = stats.hp[1] * (this.stats[0] / 100);
		stats.hp[3] += bonus;
	}
};
