/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const BuffInterface = require('../BuffInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class AttackUp extends BuffInterface {
	init() {
		this.id = 8;
		this.name = 'Attack Up++';
		this.debuff = false;
		this.emoji = '<:attuppp:619405867548147712>';
		this.statDesc = 'Increases all damage by **?%**. Cannot stack with other Attack Up++ buffs';
		this.qualityList = [[40, 50]];
	}

	// Override
	bind(animal, duration, tags) {
		for (let i in animal.buffs) {
			if (animal.buffs[i].id == this.id) {
				animal.buffs[i].duration += duration;
				this.justCreated = true;
				return;
			}
		}

		super.bind(animal, duration, tags);
	}

	attack(animal, attackee, damage, _type, _last) {
		if (this.markedForDeath) return;

		let logs = new Logs();

		let bonus = damage[0] * (this.stats[0] / 100);
		damage[1] += bonus;

		logs.push(`[ATTUP++] ${animal.nickname} dealt ${Math.round(bonus)} bonus damage`);
		return logs;
	}
};
