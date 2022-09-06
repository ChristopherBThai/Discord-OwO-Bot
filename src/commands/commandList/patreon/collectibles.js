/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');
const collectibles = require('./utils/collectibles.json');

function getOwnerString (owners) {
	let ownersString = `?${owners[owners.length - 1]}?`;
	if (owners.slice(0, -1).length) {
		ownersString = `?${owners.slice(0, -1).join('?, ?')}?, and ${ownersString}`;
	}
	return ownersString;
}

const commands = [];

for (let data in collectibles) {
	const {
		alias,
    emoji,
    pluralName,
    singleName,
    owners,
    fullControl,
    ownerOnly,
    dailyOnly,
    giveAmount,
    description,
    displayMsg,
    brokeMsg,
    giveMsg,
    hasMerge,
		hasManualMerge,
		manualMergeCommands,
    mergeNeeded,
    mergeEmoji,
    mergeDisplayMsg,
    mergeMsg,
		manualMergeData
	} = collectibles[data];
	const ownerString = getOwnerString(owners);
	
	const display = async function () {
		let count = await this.redis.hget("data_" + this.msg.author.id, data);
		let mergeCount = 0;
		if (hasMerge) {
			mergeCount = Math.floor(count / mergeNeeded); 
			count = count % mergeNeeded;
		}
		if (hasManualMerge) {
			mergeCount = await this.redis.hget("data_" + this.msg.author.id, manualMergeData);
		}
		let msg;
		if (!mergeCount) {
			msg = displayMsg
				.replaceAll('?count?', count || 0)
				.replaceAll('?plural?', count > 1 ? 's' : '')
				.replaceAll('?pluralName?', count > 1 ? pluralName : singleName)
				.replaceAll('?emoji?', emoji)
				.replaceAll('?user?', this.msg.author.username);
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
	}

	const give = async function (user) {
		if (!owners.includes(this.msg.author.id)) {
			if (dailyOnly && !(await checkDaily.bind(this)())) {
				return;
			}
			let result = await this.redis.hincrby("data_" + this.msg.author.id, data, -1);
			const refund = +result < 0 || (hasMerge && ((+result+1) % mergeNeeded) <= 0);
			if (result == null || refund) {
				if (refund) this.redis.hincrby("data_" + this.msg.author.id, data, 1);
				this.errorMsg(brokeMsg, 3000);
				this.setCooldown(5);
				return;
			}
		}

		let result = await this.redis.hincrby("data_" + user.id, data, giveAmount);
		if (hasMerge && ((result % mergeNeeded) - giveAmount < 0) ) {
			const msg = mergeMsg
				.replaceAll('?giveMsg?', giveMsg)
				.replaceAll('?giver?', this.msg.author.username)
				.replaceAll('?receiver?', user.username)
				.replaceAll('?emoji?', emoji)
				.replaceAll('?blank?', this.config.emoji.blank)
				.replaceAll('?mergeEmoji?', mergeEmoji);
			this.send(msg)
		} else {
			const msg = giveMsg
				.replaceAll('?giver?', this.msg.author.username)
				.replaceAll('?receiver?', user.username)
				.replaceAll('?emoji?', emoji);
			this.send(msg)
		}
	}

	const checkDaily = async function () {
		let reset = await this.redis.hget("data_" + this.msg.author.id, data + '_reset');
		let afterMid = this.dateUtil.afterMidnight(reset);
		if (!afterMid.after) {
			this.errorMsg(", you can only send this item once per day.", 3000);
			return false;
		}
		await this.redis.hset("data_"+this.msg.author.id, data + '_reset', afterMid.now);
		return true;
	}

	const reset = async function () {
		this.setCooldown(5);
		let user = this.getMention(this.args[1]);
		if (!user) {
			user = await this.fetch.getMember(this.msg.channel.guild, this.args[1]);
			if (!user) {
				this.errorMsg(", Invalid syntax! Please tag a user!", 3000);
				return;
			}
		}

		await this.redis.hset("data_" + user.id, data, 0);
		if (manualMergeData) {
			await this.redis.hset("data_" + user.id, manualMergeData, 0);
		}

		await this.send(`⚙️ **| ${this.msg.author.username}**, I have reset the numbers for **${user.username}**`);
	}

	const manualMerge = async function () {
		let result = await this.redis.hincrby("data_" + this.msg.author.id, data, -10);
		if (result == null || result < 0) {
			if (result < 0) this.redis.hincrby("data_" + this.msg.author.id, data, 10);
			this.errorMsg(", you do not have have enough to merge! >:c", 3000);
			this.setCooldown(5);
			return;
		}

		const result2 = await this.redis.hincrby("data_" + this.msg.author.id, manualMergeData, 1);
		const msg = mergeMsg
			.replaceAll('?giveMsg?', giveMsg)
			.replaceAll('?user?', this.msg.author.username)
			.replaceAll('?emoji?', emoji)
			.replaceAll('?blank?', this.config.emoji.blank)
			.replaceAll('?mergeCount?', result2)
			.replaceAll('?mergePlural?', result > 1 ? 's' : '')
			.replaceAll('?mergeEmoji?', mergeEmoji);
		this.send(msg)
	}

	commands.push(new CommandInterface({
		alias: [data, ...alias],
		args: "{@user}",
		desc: `${description}\n\nThis command was created by ${ownerString}`,
		example:[],
		related:[],
		permissions:["sendMessages"],
		group:["patreon"],
		cooldown:15000,

		execute: async function () {
			if (!this.args.length) {
				display.bind(this)();
				this.setCooldown(5);
			} else {
				if (fullControl && ['reset', 'remove'].includes(this.args[0]) && owners.includes(this.msg.author.id)) {
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
						this.errorMsg(", Invalid syntax! Please tag a user!", 3000);
						this.setCooldown(5);
						return;
					}
				}
				if (!owners.includes(this.msg.author.id) && user.id === this.msg.author.id) {
					this.errorMsg(", You cannot give this item to yourself!", 3000);
					this.setCooldown(5);
					return;
				}
				if (ownerOnly && !owners.includes(this.msg.author.id)) {
					this.errorMsg(", only the owner of this command can give items!", 3000);
					this.setCooldown(5);
					return;
				}
				give.bind(this)(user);
			}
		}
	}));
}

module.exports = commands;
