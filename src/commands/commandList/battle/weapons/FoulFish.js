/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class FoulFish extends WeaponInterface {
	init() {
		this.id = 21;
		this.name = 'Foul Fish';
		this.basicDesc = '';
		this.emojis = [
			'<:cffish:1154635938270564403>',
			'<:uffish:1154635970637987841>',
			'<:rffish:1154635969518129172>',
			'<:effish:1154635940535472198>',
			'<:mffish:1154635947984552076>',
			'<:lffish:1154635946571079770>',
			'<:fffish:1154635942397747211>',
		];
		this.pristineEmojis = [
			'<:pcffish:1154635949305778196>',
			'<:puffish:1154635967907495946>',
			'<:prffish:1154635966007496784>',
			'<:peffish:1154635951386153040>',
			'<:pmffish:1154635964577234974>',
			'<:plffish:1154635961284710410>',
			'<:pfffish:1154635953051287642>',
		];
		this.defaultEmoji = '<:ffish:1154635943685394433>';
		this.statDesc = `Deal **?%** of your ${WeaponInterface.strEmoji}STR to a random enemy and apply **Stinky** for 2 turns.`;
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [[50, 80]];
		this.manaRange = [280, 180];
		this.buffList = [12];
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
		manaLogs.push(`[FFISH] ${me.nickname} used ${mana.amount} WP`, mana.logs);

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att, this.stats[0] / 100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
			me,
			allies: team,
			enemies: enemy,
		});
		let buff = this.getBuffs(me)[0];
		let buffLogs = buff.attemptBind(attacking, 2, {
			me,
			allies: team,
			enemies: enemy,
		});

		logs.push(
			`[FFISH] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP and applied Stinky`,
			damage.logs
		);
		logs.addSubLogs(buffLogs);

		logs.addSubLogs(manaLogs);

		return logs;
	}
};
