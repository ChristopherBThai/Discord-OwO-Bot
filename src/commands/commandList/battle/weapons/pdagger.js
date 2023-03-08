/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class PDagger extends WeaponInterface {
	init() {
		this.id = 8;
		this.name = 'Poison Dagger';
		this.basicDesc = '';
		this.emojis = [
			'<:cpdagger:572285295177891843>',
			'<:updagger:572285295769157632>',
			'<:rpdagger:572285295781871616>',
			'<:epdagger:572285295773351966>',
			'<:mpdagger:572285295761031171>',
			'<:lpdagger:572285296188850176>',
			'<:fpdagger:572285296184393738>',
		];
		this.defaultEmoji = '<:pdagger:572285296272736256>';
		this.statDesc =
			'Deals **?%** of your ' +
			WeaponInterface.strEmoji +
			' STR to a random enemy and applies **poison** for 3 turns';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[70, 100]];
		this.manaRange = [200, 100];
		this.buffList = [2];
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
		manaLogs.push(`[PDAG] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att, this.stats[0] / 100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
			me,
			allies: team,
			enemies: enemy,
		});
		let buff = this.getBuffs(me)[0];
		buff.bind(attacking, 3, { me, allies: team, enemies: enemy });
		logs.push(
			`[PDAG] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP and applied poison`,
			damage.logs
		);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
