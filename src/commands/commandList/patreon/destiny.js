/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const config = require('../../../data/config.json');

const emoji = '<a:crystal:976030431428354048>';
const owners = ['460987842961866762'];
const data = 'destiny';
const ownerOnly = true;
const dailyOnly = false;
const giveAmount = 1;

const desc =
	"Destined to cross paths but never to meet.\nIn this lifetime, I loved your soul before I could touch you. Unable to change this time line, where we're not destined to complete our love story.\nIn this lifetime, this destiny, you're my last love, my one and only love.\nBut these promises are just sweet lies therefore, I owe you and will love you onto the next life to complete our story.";
const brokeMsg = `, you do not have any Destiny! >:c`;
const giveMsg = `, you have been given 1 Destined to love.`;

const hasMerge = false;
const mergeNeeded = 3;
const mergeEmoji = '';
const mergeMsg = ``;

function getDisplay(count, mergeCount) {
	return `, you currently have ?count? ${emoji} Destiny?plural?!`;
}

let ownersString = `?${owners[owners.length - 1]}?`;
if (owners.slice(0, -1).length) {
	ownersString = `?${owners.slice(0, -1).join('?, ?')}?, and ${ownersString}`;
}

module.exports = new CommandInterface({
	alias: [data, 'dtn'],

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
	let mergeCount = 0;
	if (hasMerge) {
		mergeCount = Math.floor(count / mergeNeeded);
		count = count % mergeNeeded;
	}
	const displayMsg = getDisplay(count, mergeCount);
	const msg = displayMsg
		.replace('?count?', count || 0)
		.replace('?mergeCount?', mergeCount || 0)
		.replace('?plural?', count > 1 ? 's' : '')
		.replace('?mergePlural?', mergeCount > 1 ? 's' : '');
	this.replyMsg(emoji, msg);
}

async function give(user) {
	if (!owners.includes(this.msg.author.id)) {
		if (dailyOnly && !(await checkDaily.bind(this)())) {
			return;
		}
		let result = await this.redis.hincrby(
			'data_' + this.msg.author.id,
			data,
			-1
		);
		const refund =
			+result < 0 || (hasMerge && (+result + 1) % mergeNeeded <= 0);
		if (result == null || refund) {
			if (refund) this.redis.hincrby('data_' + this.msg.author.id, data, 1);
			this.errorMsg(brokeMsg, 3000);
			this.setCooldown(5);
			return;
		}
	}

	let result = await this.redis.hincrby('data_' + user.id, data, giveAmount);
	if (hasMerge && (result % mergeNeeded) - giveAmount < 0) {
		this.send(`${emoji} **| ${user.username}**${mergeMsg}`);
	} else {
		this.send(`${emoji} **| ${user.username}**${giveMsg}`);
	}
}

async function checkDaily() {
	let reset = await this.redis.hget(
		'data_' + this.msg.author.id,
		data + '_reset'
	);
	let afterMid = this.dateUtil.afterMidnight(reset);
	if (!afterMid.after) {
		this.errorMsg(', you can only send this item once per day.', 3000);
		return false;
	}
	await this.redis.hset(
		'data_' + this.msg.author.id,
		data + '_reset',
		afterMid.now
	);
	return true;
}
