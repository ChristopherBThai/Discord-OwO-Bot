/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

class Collectible {
	constructor() {
		// Name of collectible
		this.key;
		// Command alias
		this.alias = [];
		// Override database key
		this.dataOverride;
		// Emoji for collectible
		this.emoji;
		// Description of collectible
		this.description;
		// Array of owners
		this.owners = [];
		// Has full admin control of collectible
		this.fullControl = false;
		// Only owners can give
		this.ownerOnly = false;

		// How many items to give
		this.giveAmount = 2;
		// How many items are taken
		this.costAmount = 1;
		// If user can only give daily
		this.dailyOnly = false;
		// If user can only receive daily
		this.dailyReceiveOnly = false;

		// Display collectible message
		this.displayMsg;
		// User cannot give message
		this.brokeMsg;
		// Give message (can be an array for random)
		this.giveMsg;
		// Error message for when owner only error
		this.ownerOnlyErrorMsg;
		// Error message when trying to give to self
		this.selfErrorMsg;
		// Message when there is no items
		this.displayNoneMsg;
		// Message when user hits daily limit
		this.dailyLimitMsg;

		// If collectible can merge
		this.hasMerge = false;
		// How many items needed to merge
		this.mergeNeeded = 3;
		// Merge emoji
		this.mergeEmoji;
		// Message when merging
		this.mergeMsg;
		// Display msg for when user has merged items
		this.mergeDisplayMsg;
		// Plural noun for merge
		this.mergePluralName;
		// Singular noun for merge
		this.mergeSingleName;

		// User can manual merge
		this.hasManualMerge = false;
		// Array of sub commands for manual merge
		this.manualMergeCommands = [];
		// Key for merge data
		this.manualMergeData;

		// Plural noun  for collectible name
		this.pluralName;
		// Singular noun for collectible name
		this.singleName;

		// Precent chance to fail giving item
		this.failChance;
		// Message when fails
		this.failMsg;

		// Track when items are given
		this.trackDate = false;

		this.init();
	}

	init() {
		this.data = this.dataOverride || this.key;
		this.ownersString = `?${this.owners[this.owners.length - 1]}?`;
		if (this.owners.slice(0, -1).length) {
			this.ownersString = `?${this.owners.slice(0, -1).join('?, ?')}?, and ${this.ownersString}`;
		}
	}

	async display(p) {
		let count = await p.redis.hget(`data_${p.msg.author.id}`, this.data);
		let receiveDate = await p.redis.hget(`data_${p.msg.author.id}`, `${this.data}_time`);
		receiveDate = receiveDate ? new Date(+receiveDate).toLocaleDateString() : 'never';

		let mergeCount = 0;
		if (this.hasMerge) {
			mergeCount = Math.floor(count / this.mergeNeeded);
			count = count % this.mergeNeeded;
		}
		if (this.hasManualMerge) {
			mergeCount = await p.redis.hget(`data_${p.msg.author.id}`, this.manualMergeData);
		}

		let msg = await this.getDisplayMsg(p, { count, mergeCount, receiveDate });
		p.send(msg);
	}

	async getDisplayMsg(p, { count, mergeCount, receiveDate }, msgOverride) {
		let selectedDisplayMsg = this.displayMsg;
		if (Array.isArray(this.displayMsg)) {
			selectedDisplayMsg = this.displayMsg[Math.floor(Math.random() * this.displayMsg.length)];
		}
		if (msgOverride) {
			return msgOverride
				.replaceAll('?displayMsg?', selectedDisplayMsg)
				.replaceAll('?count?', count || 0)
				.replaceAll('?mergeCount?', mergeCount || 0)
				.replaceAll('?mergeEmoji?', this.mergeEmoji)
				.replaceAll('?plural?', count > 1 ? 's' : '')
				.replaceAll('?pluralName?', count > 1 ? this.pluralName : this.singleName)
				.replaceAll(
					'?mergePluralName?',
					mergeCount > 1 ? this.mergePluralName : this.mergeSingleName
				)
				.replaceAll('?mergePlural?', mergeCount > 1 ? 's' : '')
				.replaceAll('?emoji?', this.emoji)
				.replaceAll('?blank?', p.config.emoji.blank)
				.replaceAll('?user?', p.msg.author.username);
		} else if (!mergeCount) {
			if (!count && this.displayNoneMsg) {
				return this.displayNoneMsg
					.replaceAll('?count?', count || 0)
					.replaceAll('?plural?', count > 1 ? 's' : '')
					.replaceAll('?pluralName?', count > 1 ? this.pluralName : this.singleName)
					.replaceAll(
						'?mergePluralName?',
						mergeCount > 1 ? this.mergePluralName : this.mergeSingleName
					)
					.replaceAll('?emoji?', this.emoji)
					.replaceAll('?mergeCount?', mergeCount || 0)
					.replaceAll('?mergeEmoji?', this.mergeEmoji)
					.replaceAll('?date?', receiveDate)
					.replaceAll('?blank?', p.config.emoji.blank)
					.replaceAll('?user?', p.msg.author.username);
			} else {
				return selectedDisplayMsg
					.replaceAll('?count?', count || 0)
					.replaceAll('?plural?', count > 1 ? 's' : '')
					.replaceAll('?pluralName?', count > 1 ? this.pluralName : this.singleName)
					.replaceAll(
						'?mergePluralName?',
						mergeCount > 1 ? this.mergePluralName : this.mergeSingleName
					)
					.replaceAll('?emoji?', this.emoji)
					.replaceAll('?mergeCount?', mergeCount || 0)
					.replaceAll('?mergeEmoji?', this.mergeEmoji)
					.replaceAll('?date?', receiveDate)
					.replaceAll('?blank?', p.config.emoji.blank)
					.replaceAll('?user?', p.msg.author.username);
			}
		} else {
			return (this.mergeDisplayMsg || selectedDisplayMsg)
				.replaceAll('?displayMsg?', selectedDisplayMsg)
				.replaceAll('?count?', count || 0)
				.replaceAll('?mergeCount?', mergeCount || 0)
				.replaceAll('?plural?', count > 1 ? 's' : '')
				.replaceAll('?pluralName?', count > 1 ? this.pluralName : this.singleName)
				.replaceAll(
					'?mergePluralName?',
					mergeCount > 1 ? this.mergePluralName : this.mergeSingleName
				)
				.replaceAll('?mergePlural?', mergeCount > 1 ? 's' : '')
				.replaceAll('?emoji?', this.emoji)
				.replaceAll('?blank?', p.config.emoji.blank)
				.replaceAll('?mergeEmoji?', this.mergeEmoji)
				.replaceAll('?user?', p.msg.author.username);
		}
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

		if (await this.checkFailed(p, user)) return;

		let result = await p.redis.hincrby(`data_${user.id}`, data, this.giveAmount);
		if (this.trackDate) {
			await p.redis.hset(`data_${user.id}`, `${data}_time`, Date.now());
		}

		const msg = await this.getGiveMsg(p, result, user, null, dataOverride);
		p.send(msg);
	}

	async getGiveMsg(p, result, user, msgOverride, _dataOverride) {
		let selectedGiveMsg = this.giveMsg;
		if (Array.isArray(this.giveMsg)) {
			selectedGiveMsg = this.giveMsg[Math.floor(Math.random() * this.giveMsg.length)];
		}
		if (msgOverride) {
			return msgOverride
				.replaceAll('?giveMsg?', selectedGiveMsg)
				.replaceAll('?giver?', p.msg.author.username)
				.replaceAll('?receiver?', user.username)
				.replaceAll('?emoji?', this.emoji)
				.replaceAll('?blank?', p.config.emoji.blank)
				.replaceAll('?count?', result)
				.replaceAll('?plural?', result > 1 ? 's' : '')
				.replaceAll('?mergeEmoji?', this.mergeEmoji);
		} else if (this.hasMerge && (result % this.mergeNeeded) - this.giveAmount < 0) {
			return this.mergeMsg
				.replaceAll('?giveMsg?', selectedGiveMsg)
				.replaceAll('?giver?', p.msg.author.username)
				.replaceAll('?receiver?', user.username)
				.replaceAll('?emoji?', this.emoji)
				.replaceAll('?blank?', p.config.emoji.blank)
				.replaceAll('?mergeEmoji?', this.mergeEmoji);
		} else {
			return selectedGiveMsg
				.replaceAll('?giver?', p.msg.author.username)
				.replaceAll('?receiver?', user.username)
				.replaceAll('?blank?', p.config.emoji.blank)
				.replaceAll('?count?', result)
				.replaceAll('?plural?', result > 1 ? 's' : '')
				.replaceAll('?emoji?', this.emoji);
		}
	}

	async checkDaily(p, user) {
		const { redis, msg, config } = p;
		let reset = await redis.hget(`data_${msg.author.id}`, `${this.data}_give_reset`);
		let afterMid = p.dateUtil.afterMidnight(reset);
		if (!afterMid.after) {
			if (!this.dailyLimitMsg) {
				p.errorMsg(', you can only send this item once per day.', 3000);
			} else {
				const msg = this.dailyLimitMsg
					.replaceAll('?user?', msg.author.username)
					.replaceAll('?giver?', user.username)
					.replaceAll('?emoji?', this.emoji)
					.replaceAll('?blank?', config.emoji.blank)
					.replaceAll('?error?', config.emoji.error);
				p.send(msg);
			}
			return false;
		}
		await redis.hset(`data_${msg.author.id}`, `${this.data}_give_reset`, afterMid.now);
		return true;
	}

	async checkReceiveDaily(p, user) {
		const { redis, msg, config } = p;
		let reset = await redis.hget(`data_${user.id}`, `${this.data}_receive_reset`);
		let afterMid = p.dateUtil.afterMidnight(reset);
		if (!afterMid.after) {
			if (!this.dailyLimitMsg) {
				p.errorMsg(', you can only receive this item once per day.', 3000);
			} else {
				const msg = this.dailyLimitMsg
					.replaceAll('?user?', msg.author.username)
					.replaceAll('?giver?', user.username)
					.replaceAll('?emoji?', this.emoji)
					.replaceAll('?blank?', config.emoji.blank)
					.replaceAll('?error?', config.emoji.error);
				p.send(msg);
			}
			return false;
		}
		await redis.hset(`data_${msg.author.id}`, `${this.data}_receive_reset`, afterMid.now);
		return true;
	}

	async checkFailed(p, user) {
		if (typeof this.failChance !== 'number' || this.failChance <= 0) return false;
		if (Math.random() <= this.failChance) {
			const msg = await this.getFailMsg(p, user);
			p.send(msg);
			return true;
		}
		return false;
	}

	async getFailMsg(p, user, msgOverride) {
		const msg = msgOverride || this.failMsg;
		return msg
			.replaceAll('?giver?', p.msg.author.username)
			.replaceAll('?receiver?', user.username)
			.replaceAll('?emoji?', this.emoji);
	}

	async reset(p) {
		p.setCooldown(5);
		let user = p.getMention(p.args[1]);
		if (!user) {
			user = await p.fetch.getMember(p.msg.channel.guild, p.args[1]);
			if (!user) {
				p.errorMsg(', Invalid syntax! Please tag a user!', 3000);
				return;
			}
		}

		await p.redis.hset(`data_${user.id}`, this.data, 0);
		if (this.manualMergeData) {
			await p.redis.hset(`data_${user.id}`, this.manualMergeData, 0);
		}

		await p.send(
			`⚙️ **| ${p.msg.author.username}**, I have reset the numbers for **${user.username}**`
		);
	}

	async manualMerge(p, msgOverride) {
		let result = await p.redis.hincrby(`data_${p.msg.author.id}`, this.data, -1 * this.mergeNeeded);
		if (result == null || result < 0) {
			if (result < 0) p.redis.hincrby(`data_${p.msg.author.id}`, this.data, this.mergeNeeded);
			p.errorMsg(', you do not have have enough to merge! >:c', 3000);
			p.setCooldown(5);
			return;
		}

		const result2 = await p.redis.hincrby(`data_${p.msg.author.id}`, this.manualMergeData, 1);
		let selectedGiveMsg = this.giveMsg;
		if (Array.isArray(this.giveMsg)) {
			selectedGiveMsg = this.giveMsg[Math.floor(Math.random() * this.giveMsg.length)];
		}
		const msg = (msgOverride || this.mergeMsg)
			.replaceAll('?giveMsg?', selectedGiveMsg)
			.replaceAll('?user?', p.msg.author.username)
			.replaceAll('?emoji?', this.emoji)
			.replaceAll('?blank?', p.config.emoji.blank)
			.replaceAll('?mergeCount?', result2)
			.replaceAll('?mergePlural?', result > 1 ? 's' : '')
			.replaceAll('?mergeEmoji?', this.mergeEmoji);
		p.send(msg);
	}

	async ownerOnlyMsg(p) {
		if (this.ownerOnlyErrorMsg) {
			const msg = this.ownerOnlyErrorMsg
				.replaceAll('?user?', p.msg.author.username)
				.replaceAll('?emoji?', this.emoji)
				.replaceAll('?blank?', p.config.emoji.blank)
				.replaceAll('?error?', p.config.emoji.error);
			p.send(msg);
		} else {
			p.errorMsg(', only the owner of this command can give items!', 3000);
		}
		p.setCooldown(5);
	}

	async selfOnlyMsg(p) {
		if (this.selfErrorMsg) {
			const msg = this.selfErrorMsg
				.replaceAll('?user?', p.msg.author.username)
				.replaceAll('?emoji?', this.emoji)
				.replaceAll('?blank?', p.config.emoji.blank)
				.replaceAll('?error?', p.config.emoji.error);
			p.send(msg);
		} else {
			p.errorMsg(', You cannot give this item to yourself!', 3000);
		}
		p.setCooldown(5);
	}
}

module.exports = Collectible;
