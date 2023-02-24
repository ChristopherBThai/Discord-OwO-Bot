/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const collectibles = require('./utils/collectibles.json');

function getOwnerString(owners) {
	let ownersString = `?${owners[owners.length - 1]}?`;
	if (owners.slice(0, -1).length) {
		ownersString = `?${owners.slice(0, -1).join('?, ?')}?, and ${ownersString}`;
	}
	return ownersString;
}

const commands = [];

for (let dataName in collectibles) {
	const {
		alias,
		dataOverride,
		emoji,
		pluralName,
		singleName,
		owners,
		fullControl,
		ownerOnly,
		ownerOnlyErrorMsg,
		selfErrorMsg,
		dailyOnly,
		giveAmount,
		description,
		displayMsg,
		displayNoneMsg,
		brokeMsg,
		giveMsg,
		hasMerge,
		hasManualMerge,
		manualMergeCommands,
		mergeNeeded,
		mergeEmoji,
		mergeDisplayMsg,
		mergeMsg,
		manualMergeData,
		dailyLimitMsg,
		costAmount,
		failChance,
		failMessage,
		trackDate,
		multiGive,
	} = collectibles[dataName];
	const ownerString = getOwnerString(owners);
	const data = dataOverride || dataName;

	const display = async function () {
		let count = await this.redis.hget(`data_${this.msg.author.id}`, data);
		let receiveDate = await this.redis.hget(`data_${this.msg.author.id}`, `${data}_time`);
		receiveDate = receiveDate ? this.global.toDiscordTimestamp(receiveDate) : 'never';

		let mergeCount = 0;
		if (hasMerge) {
			mergeCount = Math.floor(count / mergeNeeded);
			count = count % mergeNeeded;
		}
		if (hasManualMerge) {
			mergeCount = await this.redis.hget('data_' + this.msg.author.id, manualMergeData);
		}
		let msg;
		if (!mergeCount) {
			if (!count && displayNoneMsg) {
				msg = displayNoneMsg
					.replaceAll('?count?', count || 0)
					.replaceAll('?plural?', count > 1 ? 's' : '')
					.replaceAll('?pluralName?', count > 1 ? pluralName : singleName)
					.replaceAll('?emoji?', emoji)
					.replaceAll('?date?', receiveDate)
					.replaceAll('?user?', this.msg.author.username);
			} else {
				msg = displayMsg
					.replaceAll('?count?', count || 0)
					.replaceAll('?plural?', count > 1 ? 's' : '')
					.replaceAll('?pluralName?', count > 1 ? pluralName : singleName)
					.replaceAll('?emoji?', emoji)
					.replaceAll('?date?', receiveDate)
					.replaceAll('?user?', this.msg.author.username);
			}
		} else {
			msg = mergeDisplayMsg
				.replaceAll('?displayMsg?', displayMsg)
				.replaceAll('?count?', count || 0)
				.replaceAll('?mergeCount?', mergeCount || 0)
				.replaceAll('?plural?', count > 1 ? 's' : '')
				.replaceAll('?pluralName?', count > 1 ? pluralName : singleName)
				.replaceAll('?mergePlural?', mergeCount > 1 ? 's' : '')
				.replaceAll('?emoji?', emoji)
				.replaceAll('?mergeEmoji?', mergeEmoji)
				.replaceAll('?user?', this.msg.author.username);
		}
		this.send(msg);
	};

	const give = async function (user) {
		if (!owners.includes(this.msg.author.id)) {
			if (dailyOnly && !(await checkDaily.bind(this)(user))) {
				return;
			}
			let take = 1;
			if (typeof costAmount === 'number') {
				take = costAmount;
			}
			if (take > 0) {
				let result = await this.redis.hincrby('data_' + this.msg.author.id, data, -1 * take);
				// TODO double check merge for costAmount greater than 1
				const refund = +result < 0 || (hasMerge && (+result + take) % mergeNeeded <= 0);
				if (result == null || refund) {
					if (refund) this.redis.hincrby('data_' + this.msg.author.id, data, take);
					this.errorMsg(brokeMsg, 3000);
					this.setCooldown(5);
					return;
				}
			}
		}

		if (checkFailed.bind(this)(user)) return;

		let selectedGiveMsg = giveMsg;
		if (Array.isArray(giveMsg)) {
			selectedGiveMsg = giveMsg[Math.floor(Math.random() * giveMsg.length)];
		}

		const users = [user];
		if (multiGive) {
			for (let i = 1; i < Math.min(25, this.args.length); i++) {
				let user = this.getMention(this.args[i]);
				if (!user) {
					user = await this.fetch.getMember(this.msg.channel.guild, this.args[i]);
					if (!user) {
						this.errorMsg(', invalid user: `' + this.args[i] + '`', 3000);
					}
				}
				if (user) {
					users.push(user);
				}
			}
		}

		let msg = '';
		for (let i in users) {
			let user = users[i];
			if (trackDate) {
				await this.redis.hset(`data_${user.id}`, `${data}_time`, Date.now());
			}
			let result = await this.redis.hincrby(`data_${user.id}`, data, giveAmount);
			if (hasMerge && (result % mergeNeeded) - giveAmount < 0) {
				msg += mergeMsg
					.replaceAll('?giveMsg?', selectedGiveMsg)
					.replaceAll('?giver?', this.msg.author.username)
					.replaceAll('?receiver?', user.username)
					.replaceAll('?emoji?', emoji)
					.replaceAll('?blank?', this.config.emoji.blank)
					.replaceAll('?mergeEmoji?', mergeEmoji);
			} else {
				msg += selectedGiveMsg
					.replaceAll('?giver?', this.msg.author.username)
					.replaceAll('?receiver?', user.username)
					.replaceAll('?emoji?', emoji);
			}
			msg += '\n';
		}
		this.send(msg);
	};

	const checkFailed = function (user) {
		if (typeof failChance !== 'number' || failChance <= 0) return false;
		if (Math.random() <= failChance) {
			const msg = failMessage
				.replaceAll('?giver?', this.msg.author.username)
				.replaceAll('?receiver?', user.username)
				.replaceAll('?emoji?', emoji);
			this.send(msg);
			return true;
		}
		return false;
	};

	const checkDaily = async function (user) {
		let reset = await this.redis.hget('data_' + this.msg.author.id, data + '_reset');
		let afterMid = this.dateUtil.afterMidnight(reset);
		if (!afterMid.after) {
			if (!dailyLimitMsg) {
				this.errorMsg(', you can only send this item once per day.', 3000);
			} else {
				const msg = dailyLimitMsg
					.replaceAll('?user?', this.msg.author.username)
					.replaceAll('?giver?', user.username)
					.replaceAll('?emoji?', emoji)
					.replaceAll('?blank?', this.config.emoji.blank)
					.replaceAll('?error?', this.config.emoji.error);
				this.send(msg);
			}
			return false;
		}
		await this.redis.hset('data_' + this.msg.author.id, data + '_reset', afterMid.now);
		return true;
	};

	const reset = async function () {
		this.setCooldown(5);
		let user = this.getMention(this.args[1]);
		if (!user) {
			user = await this.fetch.getMember(this.msg.channel.guild, this.args[1]);
			if (!user) {
				this.errorMsg(', Invalid syntax! Please tag a user!', 3000);
				return;
			}
		}

		await this.redis.hset('data_' + user.id, data, 0);
		if (manualMergeData) {
			await this.redis.hset('data_' + user.id, manualMergeData, 0);
		}

		await this.send(
			`⚙️ **| ${this.msg.author.username}**, I have reset the numbers for **${user.username}**`
		);
	};

	const manualMerge = async function () {
		let result = await this.redis.hincrby('data_' + this.msg.author.id, data, -10);
		if (result == null || result < 0) {
			if (result < 0) this.redis.hincrby('data_' + this.msg.author.id, data, 10);
			this.errorMsg(', you do not have have enough to merge! >:c', 3000);
			this.setCooldown(5);
			return;
		}

		const result2 = await this.redis.hincrby('data_' + this.msg.author.id, manualMergeData, 1);
		let selectedGiveMsg = giveMsg;
		if (Array.isArray(giveMsg)) {
			selectedGiveMsg = giveMsg[Math.floor(Math.random() * giveMsg.length)];
		}
		const msg = mergeMsg
			.replaceAll('?giveMsg?', selectedGiveMsg)
			.replaceAll('?user?', this.msg.author.username)
			.replaceAll('?emoji?', emoji)
			.replaceAll('?blank?', this.config.emoji.blank)
			.replaceAll('?mergeCount?', result2)
			.replaceAll('?mergePlural?', result > 1 ? 's' : '')
			.replaceAll('?mergeEmoji?', mergeEmoji);
		this.send(msg);
	};

	commands.push(
		new CommandInterface({
			alias: [dataName, ...alias],
			args: '{@user}',
			desc: `${description}\n\nThis command was created by ${ownerString}`,
			example: [],
			related: [],
			permissions: ['sendMessages'],
			group: ['patreon'],
			cooldown: 15000,

			execute: async function () {
				if (!this.args.length) {
					display.bind(this)();
					this.setCooldown(5);
				} else {
					if (
						fullControl &&
						['reset', 'remove'].includes(this.args[0]) &&
						owners.includes(this.msg.author.id)
					) {
						reset.bind(this)();
						return;
					}
					if (hasManualMerge && manualMergeCommands?.includes(this.args[0])) {
						manualMerge.bind(this)();
						return;
					}
					let user = this.getMention(this.args[0]);
					if (!user) {
						user = await this.fetch.getMember(this.msg.channel.guild, this.args[0]);
						if (!user) {
							this.errorMsg(', Invalid syntax! Please tag a user!', 3000);
							this.setCooldown(5);
							return;
						}
					}
					if (ownerOnly && !owners.includes(this.msg.author.id)) {
						if (ownerOnlyErrorMsg) {
							const msg = ownerOnlyErrorMsg
								.replaceAll('?user?', this.msg.author.username)
								.replaceAll('?emoji?', emoji)
								.replaceAll('?blank?', this.config.emoji.blank)
								.replaceAll('?error?', this.config.emoji.error);
							this.send(msg);
						} else {
							this.errorMsg(', only the owner of this command can give items!', 3000);
						}
						this.setCooldown(5);
						return;
					}
					if (!owners.includes(this.msg.author.id) && user.id === this.msg.author.id) {
						if (selfErrorMsg) {
							const msg = selfErrorMsg
								.replaceAll('?user?', this.msg.author.username)
								.replaceAll('?emoji?', emoji)
								.replaceAll('?blank?', this.config.emoji.blank)
								.replaceAll('?error?', this.config.emoji.error);
							this.send(msg);
						} else {
							this.errorMsg(', You cannot give this item to yourself!', 3000);
						}
						this.setCooldown(5);
						return;
					}
					give.bind(this)(user);
				}
			},
		})
	);
}

module.exports = commands;
