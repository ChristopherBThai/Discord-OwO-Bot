/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const rumEmoji = '<:rum:678515332411031552>';
const owner = '334470442406379521';

module.exports = new CommandInterface({
	alias: ['rum'],

	args: '{@user}',

	desc: 'Give a tankards of rum to someone! You can only gain one if you receive it! This command was created by Healoholic',

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
	let count = await p.redis.zscore('rum', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(
		rumEmoji,
		', You currently have **' + count + '** tankards of rum in your stash to give!'
	);
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('rum', p.msg.author.id, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.incr('rum', p.msg.author.id, 1);
			p.errorMsg(', you do not have any rum! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.incr('rum', user.id, 2);
	p.send(
		`${rumEmoji} **| ${user.username}**, you have received two tankards of rum from ${p.msg.author.username}! Yarrrr!`
	);
}
