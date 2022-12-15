/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const loveEmoji = '<a:love:894485245448040459>';
const heartMasterEmoji = '<:heartmaster:894485245854875678>';
const owner = '557615023703195659';

module.exports = new CommandInterface({
	alias: ['love'],

	args: '{@user}',

	desc:
		'Give love to someone! Collect 5 to combine them into a heart master! You can only gain love if you receive it! This command was created by ?' +
		owner +
		'?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 30000,
	half: 80,
	six: 400,
	bot: true,

	execute: async function (p) {
		if (p.args.length == 0) {
			display(p);
			p.setCooldown(5);
		} else {
			let user = p.getMention(p.args[0]);
			if (!user) {
				user = await p.fetch.getMember(p.msg.channel.guild, p.args[0]);
				if (!user) {
					p.errorMsg(', Invalid syntax! Please tag a user!', 3000);
					p.setCooldown(5);
					return;
				}
			}
			if (user.id == p.msg.author.id) {
				p.errorMsg(', You cannot give love to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('love', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(
		loveEmoji,
		', You currently have ' +
			(count % 5) +
			' love and ' +
			Math.floor(count / 5) +
			' ' +
			heartMasterEmoji +
			' heart master(s)!'
	);
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('love', p.msg.author.id, -1);

		// Error checking
		const refund = +result < 0 || (+result + 1) % 5 <= 0;
		if (result == null || refund) {
			if (refund) p.redis.incr('love', p.msg.author.id, 1);
			p.errorMsg(', you do not have any energy! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	let result = await p.redis.incr('love', user.id, 2);
	let text = ', you gave two love to **' + user.username + '**! <3';
	if ((result % 5) - 2 < 0) {
		text +=
			'\n' +
			p.config.emoji.blank +
			' **|** Your 5 hearts fused into a heart master! ' +
			heartMasterEmoji;
	}
	p.replyMsg(loveEmoji, text);
}
