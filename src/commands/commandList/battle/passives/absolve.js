/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class Absolve extends PassiveInterface {
	init() {
		this.id = 10;
		this.name = 'Absolve';
		this.basicDesc = '';
		this.emojis = [
			'<:cabsolve:562175422343938059>',
			'<:uabsolve:562175424604536843>',
			'<:rabsolve:562175425556774912>',
			'<:eabsolve:562175424969310227>',
			'<:mabsolve:562175424625639435>',
			'<:labsolve:562175424747143209>',
			'<:fabsolve:562175424965115914>',
		];
		this.statDesc = 'When healed, deal **?%** of the healed amount to a random enemy as MAG damage';
		this.qualityList = [[60, 80]];
	}

	postHealed(animal, healer, amount, tags) {
		/* Ignore if tags.thorns flag is true */
		if (tags.absolve) return;
		let totalDamage = (amount.reduce((a, b) => a + b, 0) * this.stats[0]) / 100;
		if (totalDamage < 1) return;

		let logs = new Log();

		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(animal, tags.allies, tags.enemies);
		if (!attacking) return;

		let dmg = WeaponInterface.inflictDamage(
			animal,
			attacking,
			totalDamage,
			WeaponInterface.MAGICAL,
			{ ...tags, absolve: true }
		);

		logs.push(
			`[ABSV] ${animal.nickname} damaged ${attacking.nickname} for ${dmg.amount} HP`,
			dmg.logs
		);

		return logs;
	}
};
