/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class EnergyStaff extends WeaponInterface {
	init() {
		this.id = 11;
		this.name = 'Energy Staff';
		this.basicDesc = '';
		this.emojis = [
			'<:cestaff:572983469764902912>',
			'<:uestaff:572984069370019850>',
			'<:restaff:572984067432382485>',
			'<:eestaff:572983470360363018>',
			'<:mestaff:572984069915279380>',
			'<:lestaff:572984070007423006>',
			'<:festaff:572984069512757249>',
		];
		this.defaultEmoji = '<:estaff:572983470465220608>';
		this.statDesc =
			'Sends a wave of energy and deals **?%** of your ' +
			WeaponInterface.magEmoji +
			'MAG to all opponents';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[35, 65]];
		this.manaRange = [200, 100];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		let logs = new Logs();

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[ESTAFF] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.mag, this.stats[0] / 100);

		/* Deal damage to all opponents*/
		let logText = `[ESTAFF] ${me.nickname} damaged `;
		let subLogs = new Logs();
		for (let i = 0; i < enemy.length; i++) {
			if (enemy[i].stats.hp[0] > 0) {
				let dmg = WeaponInterface.inflictDamage(me, enemy[i], damage, WeaponInterface.MAGICAL, {
					me,
					allies: team,
					enemies: enemy,
				});
				logText += `${enemy[i].nickname} -${dmg.amount} | `;
				subLogs.push(dmg.logs);
			}
		}
		logText = logText.slice(0, -2) + 'HP';

		logs.push(logText, subLogs);
		logs.addSubLogs(manaLogs);

		return logs;
	}
};
