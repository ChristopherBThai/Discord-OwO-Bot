/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emoji = '<:fate:964988522874404864>';
const owner = '282666590565171210';
const data = 'fate';
const ownerOnly = true;
const giveAmount = 1;
const desc =
	"A fateful stone that connects People. Its glimmers can entwine their fates, just as how its glimmer links stars into the shapes of a heart's desires. No one knows where this stone comes from.";
const displayMsg = `, you currently have ?count? ${emoji} Intertwined Fate?plural?!`;
const brokeMsg = ', you do not have any Interwined Fates to give! >:c';
const giveMsg = ', you have been given an Interwined Fate.';

module.exports = new CommandInterface({
	alias: [data],

	args: '{@user}',

	desc: desc + ' This command was created by ?' + owner + '?',

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
			if (ownerOnly && this.msg.author.id !== owner) {
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
	if (this.msg.author.id != owner) {
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
