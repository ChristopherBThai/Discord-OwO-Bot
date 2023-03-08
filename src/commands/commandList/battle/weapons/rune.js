/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Rune extends WeaponInterface {
	init() {
		this.id = 4;
		this.disabled = true;
		this.name = 'Rune of the Forgotten';
		this.basicDesc =
			'This item is rewarded to those who played owo bot before the new battle update!\nThis item will increase all stats.';
		this.emojis = [
			'<:crune:543662985558884363>',
			'<:urune:543662986384900107>',
			'<:rrune:543662986565255168>',
			'<:erune:543662986393419787>',
			'<:mrune:543662986749804544>',
			'<:lrune:543662986837884928>',
			'<:frune:543662986753998874>',
		];
		this.defaultEmoji = '<:rune:543662986431037481>';
		this.statDesc =
			'Increase ALL stats by ?%, and changes your physical attacks to do 65% STR and 65% MAG as TRUE damage. This weapon does not have an active ability.';
		this.availablePassives = [];
		this.passiveCount = 0;
		this.qualityList = [[5, 15]];
		this.unsellable = true;
	}

	alterStats(stats) {
		super.alterStats(stats);
		let bonus = stats.hp[1] * (this.stats[0] / 100);
		stats.hp[3] += bonus;
		bonus = stats.att[0] * (this.stats[0] / 100);
		stats.att[1] += bonus;
		bonus = stats.pr[0] * (this.stats[0] / 100);
		stats.pr[1] += bonus;
		bonus = stats.wp[1] * (this.stats[0] / 100);
		stats.wp[3] += bonus;
		bonus = stats.mag[0] * (this.stats[0] / 100);
		stats.mag[1] += bonus;
		bonus = stats.mr[0] * (this.stats[0] / 100);
		stats.mr[1] += bonus;
	}

	attackPhysical(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(me, team, enemy);
		if (!attacking) return;

		let logs = new Logs();

		/* Calculate damage */
		let damage = WeaponInterface.getMixedDamage(me.stats.att, 0.65, me.stats.mag, 0.65);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.TRUE, {
			me,
			allies: team,
			enemies: enemy,
		});

		logs.push(
			`[RUNE] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP`,
			damage.logs
		);
		return logs;
	}
};
