/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class LuckRune extends WeaponInterface {
	init() {
		this.id = 22;
		this.disabled = true;
		this.name = 'Rune of Luck';
		this.basicDesc = '';
		this.emojis = [
			'<:clrune:1223813020824899624>',
			'<:ulrune:1223813100457693184>',
			'<:rlrune:1223813099044212836>',
			'<:elrune:1223813022288445460>',
			'<:mlrune:1223813027309162526>',
			'<:llrune:1223813024847102012>',
			'<:flrune:1223813023613849703>',
		];
		this.pristineEmojis = [
			'<:pclrune:1223813019503562772>',
			'<:pulrune:1223813097438052383>',
			'<:prlrune:1223813095793754222>',
			'<:pelrune:1223813102139871273>',
			'<:pmlrune:1223813094502039652>',
			'<:pllrune:1223813093121855610>',
			'<:pflrune:1223813091712569426>',
		];
		this.defaultEmoji = '<:lrune:1223813026004598795>';
		this.statDesc =
			'Punches a random enemy 5 times. Each punch randomly deals either a percentage of your ' +
			WeaponInterface.strEmoji +
			'STR or ' +
			WeaponInterface.magEmoji +
			'MAG. Punches deals: **?%**, **?%**, **?%**, **?%**, **?%**';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [
			[1, 40],
			[1, 40],
			[1, 40],
			[1, 40],
			[1, 40],
		];
		this.manaRange = [200, 100];
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
		manaLogs.push(`[LRUNE] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		let damageLogs = new Logs();
		let physDamage = 0;
		let magDamage = 0;
		for (let i = 0; i < 5; i++) {
			let damage;
			if (Math.random() < 0.5) {
				/* Calculate damage */
				damage = WeaponInterface.getDamage(me.stats.att, this.stats[i] / 100);
				/* Deal damage */
				damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
					me,
					allies: team,
					enemies: enemy,
				});
				physDamage += damage.amount;
			} else {
				/* Calculate damage */
				damage = WeaponInterface.getDamage(me.stats.mag, this.stats[i] / 100);
				/* Deal damage */
				damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.MAGICAL, {
					me,
					allies: team,
					enemies: enemy,
				});
				magDamage += damage.amount;
			}
			damageLogs.push(damage.logs);
		}

		logs.push(
			`[LRUNE] ${me.nickname} damaged ${attacking.nickname} for a total of ${physDamage} physical and ${magDamage} magical damage.`,
			damageLogs
		);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
