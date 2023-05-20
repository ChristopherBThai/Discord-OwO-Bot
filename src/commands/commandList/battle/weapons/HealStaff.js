/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class HealStaff extends WeaponInterface {
	init() {
		this.id = 2;
		this.name = 'Healing Staff';
		this.basicDesc = 'A staff that can heal allies!';
		this.emojis = [
			'<:chealstaff:535283616016498688>',
			'<:uhealstaff:535283616096321547>',
			'<:rhealstaff:535283616100646912>',
			'<:ehealstaff:535283615664439300>',
			'<:mhealstaff:535283616242991115>',
			'<:lhealstaff:535283616209567764>',
			'<:fhealstaff:535283617019068426>',
		];
		this.defaultEmoji = '<:healstaff:538196865410138125>';
		this.statDesc =
			'Heals **?%** of your ' + WeaponInterface.magEmoji + 'MAG to the lowest health ally';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[100, 150]];
		this.manaRange = [200, 125];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		let logs = new Logs();

		/* Grab lowest hp */
		let lowest = WeaponInterface.getLowestHp(team);
		if (!lowest || WeaponInterface.isMaxHp(lowest)) return this.attackPhysical(me, team, enemy);

		/* Calculate heal */
		let heal = WeaponInterface.getDamage(me.stats.mag, this.stats[0] / 100);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[HSTAFF] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Heal ally */
		heal = WeaponInterface.heal(lowest, heal, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		logs.push(`[HSTAFF] ${me.nickname} healed ${lowest.nickname} for ${heal.amount} HP`, heal.logs);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
