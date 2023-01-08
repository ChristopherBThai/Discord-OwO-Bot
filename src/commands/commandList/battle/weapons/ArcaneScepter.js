/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class ArcaneScepter extends WeaponInterface {
	init() {
		this.id = 13;
		this.name = 'Arcane Scepter';
		this.basicDesc = '';
		this.emojis = [
			'<:cascept:618001308343074826>',
			'<:uascept:618001309005512734>',
			'<:rascept:618001308691202059>',
			'<:eascept:618001307994685441>',
			'<:mascept:618001309399777281>',
			'<:lascept:618001309773201409>',
			'<:fascept:618001309156769793>',
		];
		this.defaultEmoji = '<:ascept:618001305692274698>';
		this.statDesc =
			'Replenish **?%** of your ' +
			WeaponInterface.magEmoji +
			'MAG as ' +
			WeaponInterface.wpEmoji +
			'WP to an ally with the lowest ' +
			WeaponInterface.wpEmoji +
			'WP';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[40, 70]];
		this.manaRange = [200, 125];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		let logs = new Logs();

		/* Grab lowest wp */
		let lowest = undefined;
		for (let i = 0; i < team.length; i++) {
			if (team[i].stats.hp[0] > 0 && team[i] != me) {
				if (
					!lowest ||
					lowest.stats.wp[0] / (lowest.stats.wp[1] + lowest.stats.wp[3]) >
						team[i].stats.wp[0] / (team[i].stats.wp[1] + team[i].stats.wp[3])
				)
					lowest = team[i];
			}
		}
		if (!lowest || WeaponInterface.isMaxWp(lowest)) return this.attackPhysical(me, team, enemy);

		/* Calculate replenish */
		let replenish = WeaponInterface.getDamage(me.stats.mag, this.stats[0] / 100);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[ASCEPT] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* replenish ally */
		replenish = WeaponInterface.replenish(lowest, replenish, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		logs.push(
			`[ASCEPT] ${me.nickname} replenished ${replenish.amount} WP to ${lowest.nickname}`,
			replenish.logs
		);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
