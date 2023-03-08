/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class Safeguard extends PassiveInterface {
	init() {
		this.id = 11;
		this.name = 'Safeguard';
		this.basicDesc = '';
		this.emojis = [
			'<:csafeguard:562175426026405913>',
			'<:usafeguard:562175424852000788>',
			'<:rsafeguard:562175425112178688>',
			'<:esafeguard:562175424701136917>',
			'<:msafeguard:562175425112047626>',
			'<:lsafeguard:562175425061715978>',
			'<:fsafeguard:562175424793411586>',
		];
		this.statDesc = 'Negate **?**% of the damage dealt to you with WP';
		this.qualityList = [[20, 40]];
	}

	attacked(animal, attacker, damage, type, tags) {
		if (tags.safeguard) return;

		let negate = (damage[0] * this.stats[0]) / 100;

		/* check if we have enough mana */
		if (animal.stats.wp[0] < negate) negate = animal.stats.wp[0];
		if (negate <= 0) return;

		let logs = new Log();

		let mana = WeaponInterface.useMana(animal, negate, animal, {
			...tags,
			safeguard: true,
		});
		damage[1] -= mana.amount;

		logs.push(`[SGUARD] ${animal.nickname} used mana to negate ${mana.amount} damage`, mana.logs);

		return logs;
	}
};
