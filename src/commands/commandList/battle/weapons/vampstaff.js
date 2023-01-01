/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class VampStaff extends WeaponInterface {
	init() {
		this.id = 7;
		this.name = 'Vampiric Staff';
		this.basicDesc = '';
		this.emojis = [
			'<:cvampstaff:562175259797880839>',
			'<:uvampstaff:562175261374677002>',
			'<:rvampstaff:562175261500506122>',
			'<:evampstaff:562175261215293440>',
			'<:mvampstaff:562175261509156864>',
			'<:lvampstaff:562175261496442880>',
			'<:fvampstaff:562175261173612555>',
		];
		this.defaultEmoji = '<:vampstaff:562175262075387904>';
		this.statDesc =
			'Deal **?%** of your ' +
			WeaponInterface.magEmoji +
			'MAG to ALL enemies and heal ALL allies by the damage dealt';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[25, 45]];
		this.manaRange = [200, 100];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		let logs = new Logs();

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.mag, this.stats[0] / 100);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[VSTAFF] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Deal damage to all opponents*/
		let dealt = 0;
		let logText = `[VSTAFF] ${me.nickname} damaged `;
		let subLogs = new Logs();
		for (let i = 0; i < enemy.length; i++) {
			if (enemy[i].stats.hp[0] > 0) {
				let dmg = WeaponInterface.inflictDamage(me, enemy[i], damage, WeaponInterface.MAGICAL, {
					me,
					allies: team,
					enemies: enemy,
				});
				dealt += dmg.amount;
				logText += `${enemy[i].nickname} -${dmg.amount} | `;
				subLogs.push(dmg.logs);
			}
		}
		logText = logText.slice(0, -2) + 'HP';
		logs.push(logText, subLogs);

		/* Heal all allies */
		let alive = WeaponInterface.getAlive(team);
		alive = alive.length > 1 ? alive.length : 1;
		let heal = dealt / alive;
		logText = `[VSTAFF] ${me.nickname} healed `;
		subLogs = new Logs();
		for (let i = 0; i < team.length; i++) {
			if (team[i].stats.hp[0] > 0) {
				let hl = WeaponInterface.heal(team[i], heal, me, {
					me,
					allies: team,
					enemies: enemy,
				});
				logText += `${team[i].nickname} ${hl.amount} | `;
				subLogs.push(hl.logs);
			}
		}
		logText = logText.slice(0, -2) + 'HP';
		let healLogs = new Logs();
		healLogs.push(logText, subLogs);
		logs.addSubLogs(healLogs);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
