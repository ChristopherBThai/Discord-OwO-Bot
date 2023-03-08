/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const cpcEmoji1 = '<:cupcake1:678512736300433408>';
const cpcEmoji2 = '<a:cupcake2:678512736639909888>';
const owner = '336006333524344832';

module.exports = new CommandInterface({
	alias: ['cupachicake', 'cpc'],

	args: '{@user}',

	desc: 'Give a cupachicake to someone! You can only gain one if you receive it! This command was created by Beliwolfi',

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
				p.errorMsg(', You cannot give it yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('cpc', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(cpcEmoji1, ', You currently have **' + count + '** cupachicake(s) to give!');
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('cpc', p.msg.author.id, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.incr('cpc', p.msg.author.id, 1);
			p.errorMsg(', you do not have any cupachicakes! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.incr('cpc', user.id, 2);
	p.send(
		`${cpcEmoji1} **| ${user.username}**, you have received two cupachicakes from ${p.msg.author.username}!\n${p.config.emoji.blank} **|** Cupcakes are sweet and they're even sweeter when shared. So I hope this cupcake bakes your day ${cpcEmoji2}`
	);
}
