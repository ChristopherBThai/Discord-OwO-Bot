/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emoji = '<a:genie:965002839598436433>';
const owners = ['863101441697775616', '667180052592721941'];
const data = 'genie';
const ownerOnly = true;
const giveAmount = 1;
const desc = 'This custom item can only be given by the owner of this command.';
const displayMsg = `, you currently have ?count? ${emoji} Genie!`;
const brokeMsg = `, you do not have any Genies to give! >:c`;
const giveMsg = `, you have been given 1 ${emoji} Genie.`;

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
	const msg = displayMsg
		.replace('?count?', count || 0)
		.replace('?plural?', count > 1 ? 's' : '');
	this.replyMsg(emoji, msg);
}

async function give(user) {
	if (!owners.includes(this.msg.author.id)) {
		let result = await this.redis.hincrby(
			'data_' + this.msg.author.id,
			data,
			-1
		);
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
