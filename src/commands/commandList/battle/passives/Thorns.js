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

module.exports = class Thorns extends PassiveInterface {
	init() {
		this.id = 8;
		this.name = 'Thorns';
		this.basicDesc = 'Reflect a percent of the damage dealt to you!';
		this.emojis = [
			'<:cthorns:548729308030566426>',
			'<:uthorns:548729400661639168>',
			'<:rthorns:548729400628346900>',
			'<:ethorns:548729400632410122>',
			'<:mthorns:548729400607113216>',
			'<:lthorns:548729400649187338>',
			'<:fthorns:548729400468963329>',
		];
		this.statDesc = 'Reflect **?**% of the damage dealt to you as true damage';
		this.qualityList = [[15, 35]];
	}

	postAttacked(animal, attacker, totalDamage, type, tags) {
		/* Ignore if tags.thorns flag is true */
		if (tags.has('thorns', animal)) return;
		if (animal.stats.hp[0] <= 0) return;
		let damage = (totalDamage * this.stats[0]) / 100;
		if (damage < 1) return;

		let logs = new Log();

		tags.add('thorns', animal);
		let dmg = WeaponInterface.inflictDamage(animal, attacker, damage, WeaponInterface.TRUE, tags);

		logs.push(
			`[THORNS] ${animal.nickname} damaged ${attacker.nickname} for ${dmg.amount} HP`,
			dmg.logs
		);

		return logs;
	}
};
