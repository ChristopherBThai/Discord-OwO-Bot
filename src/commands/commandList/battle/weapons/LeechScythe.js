/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class LeechingScythe extends WeaponInterface {
	init() {
		this.id = 20;
		this.name = 'Leeching Scythe';
		this.basicDesc = '';
		this.emojis = [
			'<:clsyth:1107927029787131985>',
			'<:ulsyth:1107927041761882192>',
			'<:rlsyth:1107927039769591828>',
			'<:elsyth:1107927031150301204>',
			'<:mlsyth:1107927038574202930>',
			'<:llsyth:1107927034308612097>',
			'<:flsyth:1107927033222279268>',
		];
		this.pristineEmojis = [
			'<:pclsyth:1132227949060427867>',
			'<:pulsyth:1132229459370586222>',
			'<:prlsyth:1132229246912315413>',
			'<:pelsyth:1132228199548456990>',
			'<:pmlsyth:1132229029756407818>',
			'<:pllsyth:1132228605439647885>',
			'<:pflsyth:1132228357728239717>',
		];
		this.defaultEmoji = '<:lsyth:1107927037190090804>';
		this.statDesc = `Deal **?%** of your ${WeaponInterface.strEmoji}STR to a random enemy and apply **Leech** for 3 turns. If the **Leech** debuff is already on the target, deal **+?%** more damage.`;
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [
			[50, 80],
			[40, 60],
		];
		this.manaRange = [230, 130];
		this.buffList = [11];
	}

	attackWeapon(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;
		/* No mana */
		if (me.stats.wp[0] < this.manaCost) return this.attackPhysical(me, team, enemy);

		let logs = new Logs();

		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(me, team, enemy);
		if (!attacking) return;

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me, this.manaCost, me, {
			me,
			allies: team,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[LSYTH] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		let damagePercent = this.stats[0];
		let appliedLeech = false;
		let buffLogs;
		if (attacking.buffs.findIndex((buff) => buff.id === this.buffList[0]) < 0) {
			appliedLeech = true;
			let buff = this.getBuffs(me)[0];
			buffLogs = buff.attemptBind(attacking, 3, {
				me,
				allies: team,
				enemies: enemy,
			});
		} else {
			damagePercent += this.stats[1];
		}

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att, damagePercent / 100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
			me,
			allies: team,
			enemies: enemy,
		});

		logs.push(
			`[LSYTH] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP${
				appliedLeech ? ' and applied Leech' : ''
			}`,
			damage.logs
		);
		logs.addSubLogs(buffLogs);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
