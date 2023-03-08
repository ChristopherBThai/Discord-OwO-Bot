/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in strength */

module.exports = class Strength extends PassiveInterface {
	init() {
		this.id = 1;
		this.name = 'Strength';
		this.basicDesc = 'Increases your Strength';
		this.emojis = [
			'<:catt:535290412143738880>',
			'<:uatt:535290420822016010>',
			'<:ratt:535290420255522855>',
			'<:eatt:535290419722977280>',
			'<:matt:535290420150665216>',
			'<:latt:535290420029030400>',
			'<:fatt:535290419903463436>',
		];
		this.statDesc = 'Increases your <:att:531616155450998794>STR by **?%**';
		this.qualityList = [[5, 20]];
	}

	alterStats(stats) {
		let bonus = stats.att[0] * (this.stats[0] / 100);
		stats.att[1] += bonus;
	}
};
