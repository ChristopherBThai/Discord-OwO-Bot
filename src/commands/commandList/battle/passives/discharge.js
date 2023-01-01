/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class Discharge extends PassiveInterface {
	init() {
		this.id = 13;
		this.name = 'Discharge';
		this.basicDesc = '';
		this.emojis = [
			'<:cdischarge:572285186864185344>',
			'<:udischarge:572285186897739777>',
			'<:rdischarge:572285186599944204>',
			'<:edischarge:572285187044671489>',
			'<:mdischarge:572285187048734722>',
			'<:ldischarge:572285187023699988>',
			'<:fdischarge:572285187002466364>',
		];
		this.statDesc =
			'When WP is replenished, deal **?%** of the replenished amount to a random enemy as MAG damage';
		this.qualityList = [[100, 140]];
	}

	postReplenished(animal, from, amount, tags) {
		/* Ignore if tags.thorns flag is true */
		if (tags.discharge) return;
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
			{ ...tags, discharge: true }
		);

		logs.push(
			`[DISCH] ${animal.nickname} damaged ${attacking.nickname} for ${dmg.amount} HP`,
			dmg.logs
		);

		return logs;
	}
};
