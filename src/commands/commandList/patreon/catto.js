/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emojis = [
	'<a:cat1:965356299082690590>',
	'<a:cat2:965356299221078016>',
	'<a:cat3:965356298600337418>',
];
const owners = ['412812867348463636', '692146302284202134', '606142158067597332'];
const data = 'catto';
const ownerOnly = true;
const giveAmount = 1;
const desc =
	'Hopefully these fluffy cattos make your day brighter! These collectibles are only given out by ?412812867348463636?, ?692146302284202134? and ?606142158067597332?';
function sendDisplay(count) {
	const plural = count > 1 ? 's' : '';
	const msg = `, you currently have ${count} **catto${plural}**\nTake care of them or they'll run away..`;
	const emoji = emojis[Math.floor(emojis.length * Math.random())];
	this.replyMsg(emoji, msg);
}
function sendBroke() {
	const msg = ', you do not have any cattos to give! >:c';
	this.errorMsg(msg, 3000);
}
function sendGive(giver, receiver) {
	const emoji = emojis[Math.floor(emojis.length * Math.random())];
	let msg = `${emoji} **| ${receiver.username}**, you have received one catto from ${giver.username}! *meow~*\n${this.config.emoji.blank} **|** `;
	const rand = Math.random();
	if (rand < 0.333) {
		msg += "He's probably sleeping don't wake him up... <a:cat4:965356298893950977>";
	} else if (rand < 0.666) {
		msg += 'The purr-fect company for your lonely nights <a:cat5:965356298965245992>';
	} else {
		msg += "Maybe now you'll have 9 lives to waste...probably <a:cat6:965356298814238800>";
	}
	this.send(msg);
}

let ownersString = `?${owners[owners.length - 1]}?`;
if (owners.slice(0, -1).length) {
	ownersString = `?${owners.slice(0, -1).join('?, ?')}?, and ${ownersString}`;
}

module.exports = new CommandInterface({
	alias: [data, 'shifu', 'ufo'],

	args: '{@user}',

	desc: `${desc}\n\nThis command was created by ${ownersString}`,

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 15000,

	execute: async function () {
		if (['reset', 'remove'].includes(this.args[0]) && owners.includes(this.msg.author.id)) {
			reset.bind(this)();
			return;
		} else if (!this.args.length) {
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
	sendDisplay.bind(this)(count || 0);
}

async function give(user) {
	if (!owners.includes(this.msg.author.id)) {
		let result = await this.redis.hincrby('data_' + this.msg.author.id, data, -1);
		// Error checking
		if (result == null || result < 0) {
			if (result < 0) this.redis.hincrby('data_' + this.msg.author.id, data, 1);
			sendBroke.bind(this)();
			this.setCooldown(5);
			return;
		}
	}

	await this.redis.hincrby('data_' + user.id, data, giveAmount);
	sendGive.bind(this)(this.msg.author, user);
}

async function reset() {
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
	await this.send(
		`⚙️ **| ${this.msg.author.username}**, I have reset the numbers for **${user.username}**`
	);
}
