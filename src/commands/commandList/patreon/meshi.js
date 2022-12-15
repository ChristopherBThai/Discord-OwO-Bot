/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const meatEmoji = '🍖';
const luffyEmoji = '<:luffy:770092774627213313>';
const owner = '403989717483257877';

module.exports = new CommandInterface({
	alias: ['meshi'],

	args: '{@user}',

	desc: 'Give some meshi to someone! Collect 6 to combine them into badges! You can only gain meshi if you receive it! This command was created by ?403989717483257877?',

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
				p.errorMsg(', You cannot give meshi to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.hget('data_' + p.msg.author.id, 'meshi');
	if (!count) count = 0;

	p.replyMsg(
		meatEmoji,
		', You currently have ' +
			(count % 6) +
			' meshi to feed Luffy! You now have ' +
			Math.floor(count / 6) +
			' badge(s) of ' +
			luffyEmoji
	);
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.hincrby('data_' + p.msg.author.id, 'meshi', -1);

		// Error checking
		const refund = +result < 0 || (+result + 1) % 6 <= 0;
		if (result == null || refund) {
			if (refund) p.redis.hincrby('data_' + p.msg.author.id, 'meshi', 1);
			p.errorMsg(', you do not have any meshi! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	let result = await p.redis.hincrby('data_' + user.id, 'meshi', 2);
	let text = ', you gave two meshi to **' + user.username + '**!';
	if ((result % 6) - 2 < 0) {
		text +=
			'\n' +
			p.config.emoji.blank +
			' **|** Wow! You have enough meshi to feed Luffy! ' +
			luffyEmoji;
	}
	p.replyMsg(meatEmoji, text);
}
