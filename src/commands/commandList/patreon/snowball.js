/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const snowballEmoji = '<:snowball:945177831900581959>';
const snowmanEmoji = '☃️';
const owner = '611567320552439808';

module.exports = new CommandInterface({
	alias: ['snowball'],

	args: '{@user}',

	desc:
		'Give a snowball to someone! Collect 5 to combine them into a snowman! You can only gain snowballs if you receive it! This command was created by ?' +
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
				p.errorMsg(', You cannot give snowballs to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('snowball', p.msg.author.id);
	if (!count) count = 0;

	const snowballCount = count % 5;
	const snowballString = 'snowball' + (snowballCount > 1 ? 's' : '');
	const snowmanCount = Math.floor(count / 5);
	const snowmanString = snowmanCount > 1 ? 'snowman' : 'snowmen';

	p.replyMsg(
		snowballEmoji,
		`, you currently have ${snowballCount} ${snowballEmoji} ${snowballString} and ${snowmanCount} ${snowmanEmoji} ${snowmanString}!`
	);
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('snowball', p.msg.author.id, -1);

		// Error checking
		const refund = +result < 0 || (+result + 1) % 5 <= 0;
		if (result == null || refund) {
			if (refund) p.redis.incr('snowball', p.msg.author.id, 1);
			p.errorMsg(', you do not have any energy! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	let result = await p.redis.incr('snowball', user.id, 2);
	let text = ', you gave two snowballs to **' + user.username + '**!';
	if ((result % 5) - 2 < 0) {
		text +=
			'\n' +
			p.config.emoji.blank +
			' **|** Your 5 snowballs combined into a snowman ' +
			snowmanEmoji;
	}
	p.replyMsg(snowballEmoji, text);
}
