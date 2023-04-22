/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Luv extends Collectible {
	constructor() {
		super();

		this.key = 'luv';
		this.alias = ['luv', 'lovely'];
		this.emoji = '<a:roolove:1099238718533017641>';
		this.owners = ['486604819545587723'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.giveAmount = 1;
		this.description = `everybody knows something I don't and I wonder how to keep a good thing going\n\n"there was a time I would die just to be who you liked"\n\nps: a special thank you to A I E D, xnurag, and gamer for the percentage rates ;)`;
		this.displayMsg = '?emoji? **| ?user?** you currently have ?count? luv?plural?!';
		this.displayNoneMsg = '?emoji? **| ?user?** i wuv youuu <3';
		this.brokeMsg = ', you dont have any luv to send :(';
		this.giveMsg = '';

		this.hasManualMerge = true;
		this.manualMergeData = 'luv_fire';
		this.manualMergeCommands = [];
		this.mergeNeeded = 1;
		this.mergeEmoji = '<a:roofire:1099238725621399632>';
		this.mergeMsg = '';
		this.mergeDisplayMsg =
			'?displayMsg?\nWHAT HAVE YOU DONE? WHY DO YOU HAVE ?mergeCount? ?mergeEmoji? PANDA(S) ON FIRE :(';

		this.init();
	}

	async give(p, user, dataOverride) {
		const data = dataOverride || this.data;
		if (!this.owners.includes(p.msg.author.id)) {
			let take = 1;
			if (typeof this.costAmount === 'number') {
				take = this.costAmount;
			}
			if (take > 0) {
				let result = await p.redis.hincrby(`data_${p.msg.author.id}`, this.data, -1 * take);
				// TODO double check merge for costAmount greater than 1
				const refund = +result < 0 || (this.hasMerge && (+result + take) % this.mergeNeeded <= 0);
				if (result == null || refund) {
					if (refund) p.redis.hincrby(`data_${p.msg.author.id}`, this.data, take);
					p.errorMsg(this.brokeMsg, 3000);
					p.setCooldown(5);
					return;
				}
			}
		}

		const rand = Math.random();
		let msgOverride, result;
		if (rand < 0.76) {
			result = await p.redis.hincrby(`data_${user.id}`, data, 1);
			msgOverride =
				'?emoji? **| ?giver?** luvs you very much. **?receiver?** you have been given one luv ?emoji?';
		} else if (rand < 0.79) {
			result = await p.redis.hincrby(`data_${user.id}`, data, 2);
			msgOverride =
				'?emoji? **| ?giver?** luvs you very much. **?receiver?** you have been given two luvs ?emoji?';
		} else if (rand < 0.94) {
			result = await p.redis.hincrby(`data_${p.msg.author.id.id}`, data, 1);
			const randMsg = [
				"<:roopeek:1099238720797941762> **|** what's this owo luv command you're refering too?",
				'<:roopeek:1099238720797941762> **|** owo luv? never heard of it',
				"<:roopeek:1099238720797941762> **|** owo luv huh? that's funny, try again",
			];
			msgOverride = randMsg[Math.floor(Math.random() * randMsg.length)];
		} else if (rand < 0.99) {
			msgOverride =
				"<:roosip:1099238722425335940> **| ?receiver?**, **?giver?** luvs you. hey, lovey that's not how this command works, one luv has been lost :(";
		} else {
			await p.redis.hincrby(`data_${p.msg.author.id}`, this.manualMergeData, 1);
			await p.redis.hincrby(`data_${user.id}`, this.manualMergeData, 1);
			msgOverride =
				'<a:roofire:1099238725621399632> **| ?giver?** there was a 1 in 100 chance of it happening but sometimes good things fall apart. You and ?receiver? have both recieved one panda on fire? <a:roofire:1099238725621399632>';
		}

		const msg = await this.getGiveMsg(p, result, user, msgOverride, dataOverride);
		p.send(msg);
	}
}

module.exports = new Luv();
