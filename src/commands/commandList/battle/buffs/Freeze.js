/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const BuffInterface = require('../BuffInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Freeze extends BuffInterface {
	init() {
		this.id = 5;
		this.name = 'Freeze';
		this.debuff = true;
		this.emoji = '<:freeze:618621661486514176>';
		this.statDesc = 'Freeze an enemy. They can not attack next turn.';
		this.qualityList = [];
	}

	canAttack(me, ally, enemy, action, result) {
		// Freeze only works next turn
		if (this.justCreated) return;

		result.result = false;
		super.postTurn(me, ally, enemy, action);

		let logs = new Logs();
		logs.push(`[FREEZE] ${me.nickname} is frozen and can't attack`);
		return logs;
	}

	// Skip duration decrementation, because we will do that in canAttack
	postTurn(_animal, _ally, _enemy, _action) {
		if (this.justCreated) this.justCreated = false;
	}
};
