/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class Regeneration extends PassiveInterface {
	init() {
		this.id = 15;
		this.name = 'Regeneration';
		this.basicDesc = '';
		this.emojis = [
			'<:chgen:621558017967652875>',
			'<:uhgen:621558018420637696>',
			'<:rhgen:621558017984299019>',
			'<:ehgen:621558017791623178>',
			'<:mhgen:621558018366111744>',
			'<:lhgen:621558018265579530>',
			'<:fhgen:621558018286419979>',
		];
		this.statDesc = 'Heal **?%** of your max ' + WeaponInterface.hpEmoji + 'HP after every turn';
		this.qualityList = [[5, 10]];
	}

	postTurn(animal, ally, enemy, _action) {
		if (animal.stats.hp[0] <= 0) return;

		let logs = new Log();
		let heal = (animal.stats.hp[1] + animal.stats.hp[3]) * (this.stats[0] / 100);
		heal = WeaponInterface.heal(animal, heal, animal, {
			me: animal,
			allies: ally,
			enemies: enemy,
		});
		logs.push(`[REGEN] ${animal.nickname} heals for ${heal.amount} HP`, heal.logs);

		return logs;
	}
};
