/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Calcifer extends Collectible {
	constructor() {
		super();

		this.key = 'calcifer';
		this.alias = ['calcifer', 'cal'];
		this.emoji = '<a:c_happy:1099443730781577226>';
		this.owners = ['665648471340220430', '665648471340220430'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.giveAmount = 1;
		this.description = ``;
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? Calcifer?plural?**';
		this.brokeMsg = ', you do not have any Calcifers! >:c';
		this.giveMsg = '';

		this.dailyOnly = true;
		this.dailyReceiveOnly = true;

		this.init();
	}

	async give(p, user, dataOverride) {
		const data = dataOverride || this.data;
		if (!this.owners.includes(p.msg.author.id)) {
			if (this.dailyOnly && !(await this.checkDaily(p, user))) {
				return;
			}
			if (this.dailyReceiveOnly && !(await this.checkReceiveDaily(p, user))) {
				return;
			}
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

		let rand = Math.random();
		rand = 0.8;
		let result, msgOverride;
		let count = (await p.redis.hget(`data_${p.msg.author.id}`, this.data)) || 0;
		if (rand < 0.6) {
			result = await p.redis.hincrby(`data_${user.id}`, data, 1);
			msgOverride =
				'?emoji? **| ?receiver?**, you  have received **1 Calcifer**! “I’m a scary and powerful fire demon!”' +
				`\n?blank? **| ?giver?**, you have ${count} Calcifer(s)! “A heart is a heavy burden.”`;
		} else if (rand < 0.8) {
			result = await p.redis.hincrby(`data_${user.id}`, data, 2);
			msgOverride =
				' <a:c_happy2:1099443728806068387> **| ?receiver?**, you have received **2 Calcifer**! “As if moving the castle wasn’t hard enough….!”' +
				`\n?blank? **| ?giver?**, you have ${count} Calcifer(s)! “You like my SPARK!”`;
		} else {
			result = await p.redis.hincrby(`data_${p.msg.author.id}`, data, -1);
			msgOverride =
				'<a:c_sad:1099443725677113424> **| ?giver?**, Oh no! You have lost Calcifer! “Here’s another curse for you…May all your bacon burn!”' +
				`\n?blank? **| You have ${count} Calcifer(s)! “They say the best blaze burns brightest when circumstances are at their worst!”`;
		}

		const msg = await this.getGiveMsg(p, result, user, msgOverride, dataOverride);
		p.send(msg);
	}
}

module.exports = new Calcifer();
