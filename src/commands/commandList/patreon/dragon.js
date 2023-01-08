/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emoji = '<:dragon:955410217322053662>';
const owner = '460987842961866762';
const owner2 = '692146302284202134';
const data = 'dragon3';

module.exports = new CommandInterface({
	alias: ['dragon', 'dgn'],

	args: '{@user}',

	desc:
		'These collectables are only given out by ?' +
		owner +
		'? and ?' +
		owner2 +
		'?. This command was created by ?' +
		owner +
		'? and ?' +
		owner2 +
		'?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 15000,

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
			if (p.msg.author.id != owner && p.msg.author.id != owner2) {
				p.errorMsg(', only the owners of this command can give items!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.hget('data_' + p.msg.author.id, data);
	if (!count) count = 0;

	p.replyMsg(
		emoji,
		', you currently have ' + count + ' ' + emoji + ' **Dragon(s)**!'
	);
}

async function give(p, user) {
	await p.redis.hincrby('data_' + user.id, data, 1);
	p.send(`${emoji} **| ${user.username}**, you have been given 1 **Dragon**.`);
}
