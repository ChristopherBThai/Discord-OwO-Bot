/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class AbsorbWand extends WeaponInterface {
	init() {
		this.id = 9;
		this.name = 'Wand of Absorption';
		this.basicDesc = '';
		this.emojis = [
			'<:cawand:572620164164747265>',
			'<:uawand:572620164495966258>',
			'<:rawand:572620164495966259>',
			'<:eawand:572620164361617408>',
			'<:mawand:572620164538040330>',
			'<:lawand:572620164655480847>',
			'<:fawand:572620164588240896>',
		];
		this.defaultEmoji = '<:awand:572620163434676265>';
		this.statDesc =
			'Deal **?%** of your ' +
			WeaponInterface.magEmoji +
			'MAG to a random enemy and transfer their ' +
			WeaponInterface.wpEmoji +
			'WP to an ally equal to **?%** of the damage done';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [
			[80, 100],
			[20, 40],
		];
		this.manaRange = [250, 150];
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
		manaLogs.push(`[AWAND] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(me, team, enemy);
		if (!attacking) return;

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.mag, this.stats[0] / 100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.MAGICAL, {
			me,
			allies: team,
			enemies: enemy,
		});

		/* Steal WP */
		let stole = (damage.amount * this.stats[1]) / 100;
		if (stole > attacking.stats.wp[0]) stole = attacking.stats.wp[0];
		attacking.stats.wp[0] -= stole;

		/* Give to lowest ally */
		let lowestWp = WeaponInterface.getLowestWp(team);
		let replenishLogs;
		if (lowestWp)
			replenishLogs = WeaponInterface.replenish(lowestWp, stole, me, {
				me,
				allies: team,
				enemies: enemy,
			});

		/* Add everything to logs */
		if (!lowestWp || !replenishLogs)
			logs.push(`[AWAND] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP`);
		else
			logs.push(
				`[AWAND] ${me.nickname} damaged ${attacking.nickname} for ${
					damage.amount
				} HP and transfered ${Math.round(stole)} WP to ${lowestWp.nickname}`
			);
		logs.addSubLogs(damage.logs);
		if (replenishLogs) logs.addSubLogs(replenishLogs.logs);
		logs.addSubLogs(manaLogs);

		return logs;
	}
};
