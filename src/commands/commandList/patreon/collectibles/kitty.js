/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Kitty extends Collectible {
	constructor() {
		super();

		this.key = 'kitty';
		this.dataOverride = 'kitty1';
		this.data2 = 'kitty2';
		this.emoji = '<:skitty:1056483633784963102>';
		this.owners = ['460987842961866762', '777641801212493826'];
		this.pluralName = 'kitties';
		this.singleName = 'kitty';
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description =
			'A litte sweet cuddly fur ball to snuggle up with.' +
			'\nCollect the pair of kitties for a surprise.' +
			'\nHermes & Estees pair of troublemakers.';
		this.displayMsg =
			'?emoji? **|** ?count? Estee ?pluralName?' +
			'\n<:hkitty:1056483630790230076> **|** ?count2? Hermes ?pluralName2?' +
			'\n<:hnekitty:1056483632144990249> **|** ?mergeCount? Hermestee ?mergePluralName?';
		this.brokeMsg = ', you do not have any kitties to give! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, You have been given one kitty, meow';

		this.hasManualMerge = true;
		this.manualMergeData = 'kitty_hne';
		this.manualMergeCommands = ['merge'];
		this.mergePluralName = 'kitties';
		this.mergeSingleName = 'kitty';
		this.mergeNeeded = 1;
		this.mergeEmoji = '<:hnekitty:1056483632144990249>';
		this.mergeMsg =
			'?mergeEmoji? | ?user?, your Estee and Hermes kitty merged to make an Hermestee kitty!';

		this.init();
	}

	async getDisplayMsg(p, args) {
		let count2 = await p.redis.hget(`data_${p.msg.author.id}`, this.data2);
		const msgOverride = this.displayMsg
			.replaceAll('?count2?', count2 || 0)
			.replaceAll('?pluralName2?', count2 > 1 ? this.pluralName : this.singleName);
		return super.getDisplayMsg(p, args, msgOverride);
	}

	async give(p, user, _dataOverride) {
		if (p.msg.author.id === this.owners[0]) {
			return super.give(p, user, this.data);
		} else if (p.msg.author.id === this.owners[1]) {
			return super.give(p, user, this.data2);
		}
		return super.give(p, user);
	}

	async getGiveMsg(p, result, user, _msgOverride) {
		if (p.msg.author.id === this.owners[0]) {
			return super.getGiveMsg(p, result, user, this.giveMsg);
		} else if (p.msg.author.id === this.owners[1]) {
			return super.getGiveMsg(
				p,
				result,
				user,
				this.giveMsg.replaceAll('?emoji?', '<:hkitty:1056483630790230076>')
			);
		}
		return super.getGiveMsg(p, result, user);
	}

	async manualMerge(p) {
		let result1 = await p.redis.hincrby(
			`data_${p.msg.author.id}`,
			this.data,
			-1 * this.mergeNeeded
		);
		let result2 = await p.redis.hincrby(
			`data_${p.msg.author.id}`,
			this.data2,
			-1 * this.mergeNeeded
		);
		if (result1 == null || result1 < 0 || result2 == null || result2 < 0) {
			p.redis.hincrby(`data_${p.msg.author.id}`, this.data, this.mergeNeeded);
			p.redis.hincrby(`data_${p.msg.author.id}`, this.data2, this.mergeNeeded);
			p.errorMsg(', you do not have enough kitties!', 3000);
			p.setCooldown(5);
			return;
		}

		const result3 = await p.redis.hincrby(`data_${p.msg.author.id}`, this.manualMergeData, 1);
		let selectedGiveMsg = this.giveMsg;
		if (Array.isArray(this.giveMsg)) {
			selectedGiveMsg = this.giveMsg[Math.floor(Math.random() * this.giveMsg.length)];
		}
		const msg = this.mergeMsg
			.replaceAll('?giveMsg?', selectedGiveMsg)
			.replaceAll('?user?', p.msg.author.username)
			.replaceAll('?emoji?', this.emoji)
			.replaceAll('?blank?', p.config.emoji.blank)
			.replaceAll('?mergeCount?', result3)
			.replaceAll('?mergePlural?', result1 > 1 ? 's' : '')
			.replaceAll('?mergeEmoji?', this.mergeEmoji);
		p.send(msg);
	}
}

module.exports = new Kitty();
