/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class LoveNote extends Collectible {
	constructor() {
		super();

		this.key = 'lovenote';
		this.dataOverride = 'lovenote1';
		this.data2 = 'lovenote2';
		this.alias = ['ln'];
		this.emoji = '<:purple_letter:1056420951006396466>';
		this.owners = ['692146302284202134', '160095846703038466'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = 'Receive both halves of the two love notes to complete your love letter.';
		this.displayMsg =
			'?emoji? **|** ?count? purple love notes <:purple_heart:1056420949911666778>' +
			'\n<:pink_letter:1056420948842135572> **|** ?count2? pink love notes <:pink_heart:1056420947789357086>' +
			'\n<:love_letter:1056420946434592870> **|** ?mergeCount? love letters <:love_heart:1056420945193095219>';
		this.brokeMsg = ', you do not have any letters to give! >:c';
		this.giveMsg =
			'?emoji? **| ?receiver?**, take this **1** love note **<3**' +
			'\n<:purple_heart:1056420949911666778> **|** I cherish you <:purple_heart:1056420949911666778>';

		this.hasManualMerge = true;
		this.manualMergeData = 'lovenote3';
		this.manualMergeCommands = ['merge'];
		this.mergeNeeded = 1;
		this.mergeEmoji = '<:love_letter:1056420946434592870>';
		this.mergeMsg =
			'?mergeEmoji? | ?user?, your love notes turned into a love letter! I **<3** you';

		this.init();
	}

	async getDisplayMsg(p, args) {
		let count2 = await p.redis.hget(`data_${p.msg.author.id}`, this.data2);
		const msgOverride = this.displayMsg.replaceAll('?count2?', count2 || 0);
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
			const giveMsg =
				'<:pink_letter:1056420948842135572> **| ?receiver?**, this **1** <:pink_letter:1056420948842135572> love note is for you **<3**' +
				'\n<:pink_heart:1056420947789357086> **|** I cherish you <:pink_heart:1056420947789357086>';
			return super.getGiveMsg(p, result, user, giveMsg);
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
			p.send(
				'<a:warning:1056420952054960168> **| Seems like you don’t have enough love notes :c**',
				3000
			);
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

module.exports = new LoveNote();
