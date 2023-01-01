/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emoji = '<a:rose:737182921076768780>';
const owner = '370709798020448257';
const data = 'rose';
const plural = 'roses';
const bouquet = '<a:bouquet:737182922263625758>';

module.exports = new CommandInterface({
	alias: ['rose', 'bouquet'],

	args: '{@user}',

	desc: 'Give a rose to someone! You can only gain one if you receive it! 5 roses will become a bouquet. This command was created by ?370709798020448257?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 3000,
	half: 80,
	six: 400,
	bot: true,

	execute: async function (p) {
		if (p.command.toLowerCase() == 'bouquet') {
			displayBouquet(p);
			p.setCooldown(5);
		} else if (p.args.length == 0) {
			displayRose(p);
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
				p.errorMsg(', You cannot give it yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function displayRose(p) {
	let count = await p.redis.hget('data_' + p.msg.author.id, data);
	if (!count) count = 0;
	count = count % 5;

	p.replyMsg(emoji, ', you currently have ' + count + ' ' + plural + '!');
}

async function displayBouquet(p) {
	let count = await p.redis.hget('data_' + p.msg.author.id, data);
	if (!count) count = 0;
	count = Math.floor(count / 5);

	p.replyMsg(bouquet, `, you currently have ${count} bouquet${count > 1 ? 's' : ''}!`);
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.hincrby('data_' + p.msg.author.id, data, -1);

		// Error checking
		const refund = +result < 0 || (+result + 1) % 5 <= 0;
		if (result == null || refund) {
			if (refund) p.redis.hincrby('data_' + p.msg.author.id, data, 1);
			p.errorMsg(', you do not have any ' + plural + ' to give! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	let result = await p.redis.hincrby('data_' + user.id, data, 2);
	let text = `${emoji} **| ${user.username}** has received a rose from ${p.msg.author.username}. How cute!`;
	if ((result % 5) - 2 < 0) {
		text +=
			'\n' +
			p.config.emoji.blank +
			' **|** your five roses combined and turned into a bouquet! ' +
			bouquet;
	}
	p.send(text);
}
