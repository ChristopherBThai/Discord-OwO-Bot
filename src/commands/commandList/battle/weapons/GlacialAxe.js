/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class GlacialAxe extends WeaponInterface {
	init() {
		this.id = 15;
		this.name = 'Glacial Axe';
		this.basicDesc = '';
		this.emojis = [
			'<:cgaxe:618389128311996427>',
			'<:ugaxe:618389128077377547>',
			'<:rgaxe:618389128517648392>',
			'<:egaxe:618389128064794646>',
			'<:mgaxe:618389128949661716>',
			'<:lgaxe:618389129817882625>',
			'<:fgaxe:618389128396013598>',
		];
		this.defaultEmoji = '<:gaxe:618389128043692043>';
		this.statDesc =
			'Deals **?%** of your ' +
			WeaponInterface.strEmoji +
			'STR to a random opponent and apply **Freeze**';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[50, 80]];
		this.manaRange = [220, 120];
		this.buffList = [5];
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
		manaLogs.push(`[GAXE] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att, this.stats[0] / 100);

		/* Deal damage and freeze*/
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
			me,
			allies: team,
			enemies: enemy,
		});
		let buff = this.getBuffs(me)[0];
		let buffLogs = buff.bind(attacking, 1, {
			me,
			allies: team,
			enemies: enemy,
		});
		logs.push(
			`[GAXE] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP and applied freeze`,
			damage.logs
		);
		logs.addSubLogs(buffLogs);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
