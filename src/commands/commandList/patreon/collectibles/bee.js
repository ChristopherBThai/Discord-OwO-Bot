/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Bee extends Collectible {
	constructor() {
		super();

		this.key = 'bee';
		this.alias = ['honey'];
		this.data2 = 'bee_honey';
		this.emoji = '<:bee:1079710526982074429>';
		this.emoji2 = '<:honey:1079710528005488690>';
		this.owners = ['460987842961866762'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description =
			"A busy buzzing bee that loves flowers will bring you sweet honey.\nWill you will bee mine, I think I've found my honey.";
		this.displayMsg =
			'?emoji? **| ?user?**, your beehive currently has ?count? bee?plural? ?emoji?' +
			'\n?mergeEmoji? **|** The bees have collected ?mergeCount? honey pot ' +
			this.emoji2;
		this.brokeMsg = ', you do not have any bees! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, have this busy buzzing ?emoji? bee.';

		this.hasManualMerge = true;
		this.manualMergeData = 'honey_pot';
		this.manualMergeCommands = [];
		this.mergeNeeded = 1;
		this.mergeEmoji = '<:honey_pot:1079710524985589770>';

		this.init();
	}

	async give(p, user, _dataOverride) {
		if (Math.random() < 0.05) {
			return super.give(p, user, this.data2);
		} else {
			return super.give(p, user, this.data);
		}
	}

	async getGiveMsg(p, result, user, _msgOverride, dataOverride) {
		let msg = this.giveMsg;
		if (dataOverride === this.data2) {
			msg = `${this.emoji2} **|** Oh sugar! **?receiver?**, your bees have collected you ${this.emoji2} honey!`;
		}

		let count = (await p.redis.hget(`data_${user.id}`, this.data)) || 0;
		let count2 = (await p.redis.hget(`data_${user.id}`, this.data2)) || 0;

		if (count > 0 && count2 > 0) {
			msg += `\n?mergeEmoji? **|** You now have 1 honey pot!`;
			await p.redis.hincrby(`data_${user.id}`, this.data, -1);
			await p.redis.hincrby(`data_${user.id}`, this.data2, -1);
			await p.redis.hincrby(`data_${user.id}`, this.manualMergeData, 1);
		}

		return super.getGiveMsg(p, result, user, msg, dataOverride);
	}
}

module.exports = new Bee();
