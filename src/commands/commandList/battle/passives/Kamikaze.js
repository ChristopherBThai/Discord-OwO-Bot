/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

/* +[10~25%] thorns*/

module.exports = class Kamikaze extends PassiveInterface {
	init() {
		this.id = 14;
		this.name = 'Kamikaze';
		this.basicDesc = '';
		this.emojis = [
			'<:ckkaze:619835003664072711>',
			'<:ukkaze:619834825486106624>',
			'<:rkkaze:619834825330655242>',
			'<:ekkaze:619834825293168650>',
			'<:mkkaze:619834825309814786>',
			'<:lkkaze:619834825699754004>',
			'<:fkkaze:619834825217671168>',
		];
		this.statDesc = `When the animal dies, deal **?%** of its max ${WeaponInterface.hpEmoji}HP as ${WeaponInterface.magEmoji}MAG dmg to the attacker`;
		this.qualityList = [[50, 75]];
	}

	postAttacked(animal, attacker, damage, type, tags) {
		if (tags.has('kamikaze', animal)) return;
		// Ignore if this doesnt kill the animal
		let totalDamage = damage.reduce((a, b) => a + b, 0);
		if (totalDamage < animal.stats.hp[0]) return;

		let logs = new Log();

		let dmg = ((animal.stats.hp[1] + animal.stats.hp[3]) * this.stats[0]) / 100;
		tags.add('kamikaze', animal);
		dmg = WeaponInterface.inflictDamage(animal, attacker, dmg, WeaponInterface.MAGICAL, tags);

		logs.push(
			`[KKAZE] ${animal.nickname} died and damaged ${attacker.nickname} for ${dmg.amount} HP`,
			dmg.logs
		);

		return logs;
	}
};
