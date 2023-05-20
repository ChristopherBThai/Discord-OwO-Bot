/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class CRune extends WeaponInterface {
	init() {
		this.id = 18;
		this.disabled = true;
		this.name = 'Rune of Celebration';
		this.basicDesc =
			"This item was available to find on OwO Bot's 3 million server event.\nThis item will restore teammate's health and mana over time.";
		this.emojis = [
			'<:ccrune:1080441103129509899>',
			'<:ucrune:1080441115922153513>',
			'<:rcrune:1080441114030510130>',
			'<:ecrune:1080441106992463872>',
			'<:mcrune:1080441112533139477>',
			'<:lcrune:1080441110876397568>',
			'<:fcrune:1080441108775059456>',
		];
		this.defaultEmoji = '<:crune:1080441105117614142>';
		this.statDesc = 'Apply **Celebration** to an ally with the lowest health for 3 turns.';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [];
		this.manaRange = [200, 100];
		this.buffList = [10];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		let logs = new Logs();

		/* Grab lowest hp without buff*/
		let lowest = WeaponInterface.getLowestHp(team, { noBuff: this.buffList[0] });
		if (!lowest || WeaponInterface.isMaxHp(lowest)) return this.attackPhysical(me, team, enemy);

		/* Grab buff and bind it to our animal */
		let buff = this.getBuffs(me)[0];
		let buffLogs = buff.bind(lowest, 3, {
			me: me,
			allies: team,
			enemies: enemy,
		});
		logs.push(`[CRUNE] ${me.nickname} applied Celebration to ${lowest.nickname}`);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[CRUNE] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		logs.addSubLogs(buffLogs);
		logs.addSubLogs(manaLogs);
		return logs;
	}
};
