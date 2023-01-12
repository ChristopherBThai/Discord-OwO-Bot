/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const crownEmoji = '<a:crown:663613803786797056>';
const crownCat = '<a:crowncat:663613804441108480>';
const owner = '176046069954641921';

module.exports = new CommandInterface({
	alias: ['crown'],

	args: '{@user}',

	desc: 'Give a crown to someone! You can only gain crown if you receive it! This command was created by crowN',

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
				p.errorMsg(', You cannot give a crown yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('crown', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(crownEmoji, ', You currently have **' + count + '** crown(s) to give!');
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('crown', p.msg.author.id, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.incr('crown', p.msg.author.id, 1);
			p.errorMsg(', you do not have any crowns! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.incr('crown', user.id, 2);
	p.send(
		`${crownEmoji} **| ${user.username}**, See that Shiny Crown? It has your name on it! Thanks to ${p.msg.author.username}, you have received 2 of these priceless relics ${crownEmoji} ${crownCat}`
	);
}
