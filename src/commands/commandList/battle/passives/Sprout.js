/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class Sprout extends PassiveInterface {
	init() {
		this.id = 17;
		this.name = 'Sprout';
		this.basicDesc = '';
		this.emojis = [
			'<:csprout:621558018492071936>',
			'<:usprout:621558018643066910>',
			'<:rsprout:621558018496004097>',
			'<:esprout:621558018378825729>',
			'<:msprout:621558018626289664>',
			'<:lsprout:621558018546335754>',
			'<:fsprout:621558018424832022>',
		];
		this.statDesc = 'Increase all incoming healing by **?%**';
		this.qualityList = [[20, 40]];
	}

	healed(animal, healer, amount, _tag) {
		let logs = new Log();

		// Bonus heals
		let bonus = amount[0] * (this.stats[0] / 100);
		amount[1] += bonus;

		logs.push(`[SPRT] ${animal.nickname} gained an additional ${Math.round(bonus)} HP`);

		return logs;
	}
};
