/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Curly extends Collectible {
	constructor() {
		super();

		this.key = 'curly';
		this.emoji = '<:curly:1098851508033962015>';
		this.owners = ['384202884553768961', '778204442411008021'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Jerome Lester Horwitz, better known by his stage name Curly Howard, was an American comedian and actor.\nHe was well known for his high-pitched voice and vocal expressions ("nyuk-nyuk-nyuk!", "woob-woob-woob!", "soitenly!", "I'm a victim of soikemstance", and barking like a dog.\nHe was the younger brother of Stooges Moe Howard and Shemp Howard.\nFilm critics have cited Curly as the most popular member of the team.  His childlike mannerisms and natural comedic charm made him a hit with audiences, particularly children and women.\n(Combine with moe, shemp, and larry, to make a 3stooges.  Use the command:  owo curly nyuk.)`;
		this.pluralName = 'Curlies';
		this.singleName = 'Curly';
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? ?pluralName?**';
		this.brokeMsg = ', you do not have any Curlies! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **1 Curly** from **?giver?**';

		this.hasManualMerge = true;
		this.manualMergeCommands = ['nyuk'];
		this.mergeNeeded = 1;
		this.mergeEmoji = '<:nyuk:1098851509099302962>';
		this.mergeMsg =
			'?emoji? **|** ?user?! `moe`, `shemp`, `larry`, and `curly` combined into **3stooges**!';
		this.manualMergeData = 'nyuk';
		this.mergeDisplayMsg =
			'?displayMsg?\n?mergeEmoji? **|** You also have **?mergeCount? 3stooges**!';

		this.init();
	}

	async manualMerge(p, msgOverride) {
		let result1 = await p.redis.hincrby(
			`data_${p.msg.author.id}`,
			this.data,
			-1 * this.mergeNeeded
		);
		let result2 = await p.redis.hincrby(`data_${p.msg.author.id}`, 'larry', -1 * this.mergeNeeded);
		let result3 = await p.redis.hincrby(`data_${p.msg.author.id}`, 'shemp', -1 * this.mergeNeeded);
		let result4 = await p.redis.hincrby(`data_${p.msg.author.id}`, 'moe', -1 * this.mergeNeeded);
		if (result1 < 0 || result2 < 0 || result3 < 0 || result4 < 0) {
			p.redis.hincrby(`data_${p.msg.author.id}`, this.data, this.mergeNeeded);
			p.redis.hincrby(`data_${p.msg.author.id}`, 'larry', this.mergeNeeded);
			p.redis.hincrby(`data_${p.msg.author.id}`, 'shemp', this.mergeNeeded);
			p.redis.hincrby(`data_${p.msg.author.id}`, 'moe', this.mergeNeeded);
			p.errorMsg(', you do not have have enough to merge! >:c', 3000);
			p.setCooldown(5);
			return;
		}

		const result5 = await p.redis.hincrby(`data_${p.msg.author.id}`, this.manualMergeData, 1);
		let selectedGiveMsg = this.giveMsg;
		if (Array.isArray(this.giveMsg)) {
			selectedGiveMsg = this.giveMsg[Math.floor(Math.random() * this.giveMsg.length)];
		}
		const msg = (msgOverride || this.mergeMsg)
			.replaceAll('?giveMsg?', selectedGiveMsg)
			.replaceAll('?user?', p.msg.author.username)
			.replaceAll('?emoji?', this.emoji)
			.replaceAll('?blank?', p.config.emoji.blank)
			.replaceAll('?mergeCount?', result5)
			.replaceAll('?mergePlural?', result1 > 1 ? 's' : '')
			.replaceAll('?mergeEmoji?', this.mergeEmoji);
		p.send(msg);
	}
}

module.exports = new Curly();
