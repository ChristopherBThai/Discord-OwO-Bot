/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Poison extends Collectible {
	constructor() {
		super();

		this.key = 'poison';
		this.emoji = '<a:poison:1033642058637910066>';
		this.owners = ['665417324949405706'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.dailyReceiveOnly = true;
		this.giveAmount = 2;
		this.description =
			"Love could be labeled poison and we'd drink it anyways.\n\nSubcommands: owo poison mix";
		this.displayMsg = [
			'?emoji? **| ?user?**, you currently have ?count? poison?plural? ?emoji? and ?mergeCount? poison ivy ?mergeEmoji?! Toxins are running through your veins.',
			'?emoji? **| ?user?**, you currently have ?count? poison?plural? ?emoji? and ?mergeCount? poison ivy ?mergeEmoji?! Oh you poor thing! Are you still okay?',
		];
		this.brokeMsg = ', you do not have any poison to give! >:c';
		this.giveMsg = [
			'?emoji? **| ?receiver?**, you got fooled by a poison in a pretty bottle.',
			'?emoji? **| ?giver?** poisoned **?receiver?**. There is no antidote for a person like you.',
			'?emoji? **| ?giver?**, you have given poison to **?receiver?**. "Pick your poison" they said. And I choose you.',
			"?emoji? **| ?receiver?**, you are the poison I'm addicted to.",
		];
		this.dailyLimitMsg =
			'<:poison:1079735825127964702> **| ?user?** has already been poisoned today. Have some mercy and find another target!';

		this.hasManualMerge = true;
		this.manualMergeCommands = ['mix'];
		this.mergeNeeded = 3;
		this.mergeEmoji = '<:ivy:1079729952351584306>';
		this.mergeMsg = [
			'?mergeEmoji? **|** You have collected 3 poisons and turned them into a Poison Ivy ?mergeEmoji? "Leaves of three, let it be"',
			'?mergeEmoji? **|** You have saved yourself from further intoxication. 3 of your poisons turned into a Poison Ivy ?mergeEmoji?',
			'?mergeEmoji? **|** Your bottles of poison got knocked over and it spilled all over the floor <:skull:1079730834799607888> Better luck next time.',
		];
		this.manualMergeData = 'poison_ivy';

		this.init();
	}

	async getDisplayMsg(p, data) {
		data.count *= -1;
		return super.getDisplayMsg(p, data);
	}

	async manualMerge(p) {
		let result = await p.redis.hincrby(`data_${p.msg.author.id}`, this.data, -1 * this.mergeNeeded);
		if (result == null || result < 0) {
			if (result < 0) p.redis.hincrby(`data_${p.msg.author.id}`, this.data, this.mergeNeeded);
			p.errorMsg(', you do not have have enough to merge! >:c', 3000);
			p.setCooldown(5);
			return;
		}

		const rand = Math.random();
		let msgOverride, result2;
		if (rand < 0.2) {
			result2 = await p.redis.hincrby(`data_${p.msg.author.id}`, this.manualMergeData, 1);
			msgOverride = this.mergeMsg[0];
		} else if (rand < 0.4) {
			result2 = await p.redis.hincrby(`data_${p.msg.author.id}`, this.manualMergeData, 1);
			msgOverride = this.mergeMsg[1];
		} else {
			msgOverride = this.mergeMsg[2];
		}

		const msg = msgOverride
			.replaceAll('?user?', p.msg.author.username)
			.replaceAll('?emoji?', this.emoji)
			.replaceAll('?blank?', p.config.emoji.blank)
			.replaceAll('?mergeCount?', result2)
			.replaceAll('?mergePlural?', result > 1 ? 's' : '')
			.replaceAll('?mergeEmoji?', this.mergeEmoji);
		p.send(msg);
	}
}

module.exports = new Poison();
