/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in wp*/

module.exports = class WeaponPoint extends PassiveInterface {
	init() {
		this.id = 4;
		this.name = 'Weapon Point';
		this.basicDesc = 'Increases your Weapon Points';
		this.emojis = [
			'<:cwp:535290421207629825>',
			'<:uwp:535290422151610369>',
			'<:rwp:535290422335897600>',
			'<:ewp:535290421593636874>',
			'<:mwp:535290421807415297>',
			'<:lwp:535290421887369216>',
			'<:fwp:535290421237252107>',
		];
		this.statDesc = 'Increases your <:wp:531620120976687114>WP by **?%**';
		this.qualityList = [[10, 30]];
	}

	alterStats(stats) {
		let bonus = stats.wp[1] * (this.stats[0] / 100);
		stats.wp[3] += bonus;
	}
};
