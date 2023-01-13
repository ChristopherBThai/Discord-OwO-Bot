/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class CullingScythe extends WeaponInterface {
	init() {
		this.id = 17;
		this.name = 'Culling Scythe';
		this.basicDesc = '';
		this.emojis = [
			'<:csythe:618001307181252623>',
			'<:usythe:618001307869118474>',
			'<:rsythe:618001307856404505>',
			'<:esythe:618001307562672128>',
			'<:msythe:618001308426960896>',
			'<:lsythe:618001308607184896>',
			'<:fsythe:618001308196012042>',
		];
		this.defaultEmoji = '<:sythe:618001309622337566>';
		this.statDesc =
			'Deals **?%** of your ' +
			WeaponInterface.strEmoji +
			' STR to a random enemy and applies **Mortality** for 2 turns';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[70, 100]];
		this.manaRange = [200, 100];
		this.buffList = [9];
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
		manaLogs.push(`[SCYTH] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att, this.stats[0] / 100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
			me,
			allies: team,
			enemies: enemy,
		});
		let buff = this.getBuffs(me)[0];
		let buffLogs = buff.bind(attacking, 2, {
			me,
			allies: team,
			enemies: enemy,
		});
		logs.push(
			`[SCYTH] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP and applied Mortality`,
			damage.logs
		);
		logs.addSubLogs(buffLogs);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
