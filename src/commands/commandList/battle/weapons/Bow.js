/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Bow extends WeaponInterface {
	init() {
		this.id = 3;
		this.name = 'Bow';
		this.basicDesc = 'An accurate bow that will deal alot of damage to a single opponent';
		this.emojis = [
			'<:cbow:535283611260420096>',
			'<:ubow:535283613198188594>',
			'<:rbow:535283613374349316>',
			'<:ebow:535283614334844937>',
			'<:mbow:535283613802168323>',
			'<:lbow:535283613391126529>',
			'<:fbow:535283614099832872>',
		];
		this.defaultEmoji = '<:bow:538196864277807105>';
		this.statDesc = 'Deals **?%** of your ' + WeaponInterface.strEmoji + 'STR to a random opponent';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[110, 160]];
		this.manaRange = [220, 120];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(me, team, enemy);
		if (!attacking) return;

		let logs = new Logs();

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[BOW] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att, this.stats[0] / 100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
			me,
			allies: team,
			enemies: enemy,
		});
		logs.push(
			`[BOW] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP`,
			damage.logs
		);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
