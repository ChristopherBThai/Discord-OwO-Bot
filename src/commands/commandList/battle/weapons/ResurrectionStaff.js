/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class ResurrectionStaff extends WeaponInterface {
	init() {
		this.id = 14;
		this.name = 'Resurrection Staff';
		this.basicDesc = '';
		this.emojis = [
			'<:crstaff:618001309265690654>',
			'<:urstaff:618001309513023518>',
			'<:rrstaff:618001309307633685>',
			'<:erstaff:618001309085466665>',
			'<:mrstaff:618001309362290691>',
			'<:lrstaff:618001309756555275>',
			'<:frstaff:618001309307633665>',
		];
		this.pristineEmojis = [
			'<:pcrstaff:1132227954521423913>',
			'<:purstaff:1132229531500019873>',
			'<:prrstaff:1132229385487921154>',
			'<:perstaff:1132228203621134417>',
			'<:pmrstaff:1132229033850048522>',
			'<:plrstaff:1132228935422328933>',
			'<:pfrstaff:1132228363159883786>',
		];
		this.defaultEmoji = '<:rstaff:618001309483925504>';
		this.statDesc =
			'Revive a dead ally and heal them for **?%** of your ' + WeaponInterface.magEmoji + 'MAG';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[50, 80]];
		this.manaRange = [400, 300];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		let logs = new Logs();

		/* Grab lowest wp */
		let dead = WeaponInterface.getDead(team);
		if (!dead) return this.attackPhysical(me, team, enemy);

		/* Calculate heal */
		let heal = WeaponInterface.getDamage(me.stats.mag, this.stats[0] / 100);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[RSTAFF] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* revive ally */
		dead.stats.hp[0] = 0;
		heal = WeaponInterface.heal(dead, heal, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		
		/* remove debuffs */
		for (const i in dead.buffs) {
			if (dead.buffs[i].debuff) {
				dead.buffs.splice(i, 1);
			}
		}
		
		logs.push(`[RSTAFF] ${me.nickname} revived ${dead.nickname} with ${heal.amount} HP`, heal.logs);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
