/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const dishEmoji = '<a:dish:704921204473069588>';
const owner = '176046069954641921';

module.exports = new CommandInterface({
	alias: ['dish'],

	args: '{@user}',

	desc: 'Give a dish to someone! You can only gain one if you receive it! This command was created by 👑𝕮𝖗𝖔𝖜𝖓👑',

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
	let count = await p.redis.hget('data_' + p.msg.author.id, 'dish');
	if (!count) count = 0;

	p.replyMsg(
		dishEmoji,
		', you currently have ' + count + " dish(es) of iskender to enjoy! Eat while it's hot!"
	);
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.hincrby('data_' + p.msg.author.id, 'dish', -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.hincrby('data_' + p.msg.author.id, 'dish', 1);
			p.errorMsg(', you do not have any dishes to give! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.hincrby('data_' + user.id, 'dish', 2);
	p.send(
		`${dishEmoji} **| ${user.username}**, you received two dishes of iskender from ${p.msg.author.username}! Afiyet olsun!`
	);
}
