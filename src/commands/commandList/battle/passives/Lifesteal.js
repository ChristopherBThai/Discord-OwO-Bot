/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

/* +[10~25%] lifesteal*/

module.exports = class Lifesteal extends PassiveInterface {
	init() {
		this.id = 7;
		this.name = 'Lifesteal';
		this.basicDesc = 'All attacks heal you!';
		this.emojis = [
			'<:clifesteal:548729308038955018>',
			'<:ulifesteal:548729400477089793>',
			'<:rlifesteal:548729400493867018>',
			'<:elifesteal:548729398644178944>',
			'<:mlifesteal:548729400078893057>',
			'<:llifesteal:548729400447729664>',
			'<:flifesteal:548729400473026560>',
		];
		this.statDesc = 'All damage you deal heals you for **?%** of the damage dealt!';
		this.qualityList = [[15, 35]];
	}

	postAttack(animal, attackee, totalDamage, type, tags) {
		if (tags.has('lifesteal', animal) || tags.has('kamikaze', animal) || animal.stats.hp[0] <= 0)
			return;

		let logs = new Log();
		let heal = (totalDamage * this.stats[0]) / 100;
		const tagsCopy = tags.copyAdd('lifesteal', animal);
		heal = WeaponInterface.heal(animal, heal, animal, tagsCopy);

		logs.push(`[LIFESTEAL] ${animal.nickname} heals for ${heal.amount} HP`, heal.logs);
		return logs;
	}
};
