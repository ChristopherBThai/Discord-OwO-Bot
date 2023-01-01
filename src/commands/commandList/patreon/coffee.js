/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const coffeeEmoji = '<a:coffee:663951575848452117>';
const coffeeEmoji2 = '<a:coffee2:664316331121967126>';
const owner = '310206001875910658';

module.exports = new CommandInterface({
	alias: ['coffee', 'java'],

	args: '{@user}',

	desc: 'Give a coffee to someone! You can only gain coffee if you receive it! This command was created by ❄chocσ˚ℓαtte❄',

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
				p.errorMsg(', You cannot give coffee yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('coffee', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(coffeeEmoji, ', You currently have **' + count + '** cups of coffee to give!');
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('coffee', p.msg.author.id, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.incr('coffee', p.msg.author.id, 1);
			p.errorMsg(', you do not have any cups of coffee! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.incr('coffee', user.id, 2);
	p.send(
		`${coffeeEmoji} **| ${user.username}**, you received two steamy cups of coffee from ${p.msg.author.username}. Time to relax and enjoy~ ${coffeeEmoji2}`
	);
}
