/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emoji = '<a:magic:975267257477394432>';
const owners = ['145541256779530240'];
const data = 'magic';
const ownerOnly = false;
const dailyOnly = false;
const giveAmount = 2;
const desc = 'Give some Black Magic to a friend!';
const displayMsg = `, you currently have ?count? ${emoji} Black Magic`;
const brokeMsg = ', you do not have any Black Magic to give! >:c';
const giveMsg = `, you have been given 2 <a:sparkle1:975266751312965643> <a:sparkle2:975266751573020694> ${emoji} <a:sparkle1:975266751312965643> <a:sparkle2:975266751573020694> it fizzles and sparkles in your hand, these originated from the Black Magic Gang owo clan, trade these with other users to further spread the black magic upon these lands, GO! GO! BEFORE THEY CATCH YOU!`;

let ownersString = `?${owners[owners.length - 1]}?`;
if (owners.slice(0, -1).length) {
	ownersString = `?${owners.slice(0, -1).join('?, ?')}?, and ${ownersString}`;
}

module.exports = new CommandInterface({
	alias: [data],

	args: '{@user}',

	desc: `${desc}\n\nThis command was created by ${ownersString}`,

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 15000,

	execute: async function () {
		if (!this.args.length) {
			display.bind(this)(this);
			this.setCooldown(5);
		} else {
			let user = this.getMention(this.args[0]);
			if (!user) {
				user = await this.fetch.getMember(this.msg.channel.guild, this.args[0]);
				if (!user) {
					this.errorMsg(', Invalid syntax! Please tag a user!', 3000);
					this.setCooldown(5);
					return;
				}
			}
			if (!ownerOnly && user.id === this.msg.author.id) {
				this.errorMsg(', You cannot give this item to yourself!', 3000);
				this.setCooldown(5);
				return;
			}
			if (ownerOnly && !owners.includes(this.msg.author.id)) {
				this.errorMsg(', only the owner of this command can give items!', 3000);
				this.setCooldown(5);
				return;
			}
			give.bind(this)(user);
		}
	},
});

async function display() {
	let count = await this.redis.hget('data_' + this.msg.author.id, data);
	const msg = displayMsg.replace('?count?', count || 0).replace('?plural?', count > 1 ? 's' : '');
	this.replyMsg(emoji, msg);
}

async function give(user) {
	if (!owners.includes(this.msg.author.id)) {
		if (dailyOnly && !(await checkDaily.bind(this)())) {
			return;
		}
		let result = await this.redis.hincrby('data_' + this.msg.author.id, data, -1);
		// Error checking
		if (result == null || result < 0) {
			if (result < 0) this.redis.hincrby('data_' + this.msg.author.id, data, 1);
			this.errorMsg(brokeMsg, 3000);
			this.setCooldown(5);
			return;
		}
	}

	await this.redis.hincrby('data_' + user.id, data, giveAmount);
	this.send(`${emoji} **| ${user.username}**${giveMsg}`);
}

async function checkDaily() {
	let reset = await this.redis.hget('data_' + this.msg.author.id, data + '_reset');
	let afterMid = this.dateUtil.afterMidnight(reset);
	if (!afterMid.after) {
		this.errorMsg(', you can only send this item once per day.', 3000);
		return false;
	}
	await this.redis.hset('data_' + this.msg.author.id, data + '_reset', afterMid.now);
	return true;
}
