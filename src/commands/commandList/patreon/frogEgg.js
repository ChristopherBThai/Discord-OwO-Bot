/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emoji = '<a:egg:828419544787845180>';
const owner = '575555630312456193';
const data = 'frog_egg';
const data2 = 'frog_ball';
const plural = 'frog eggs';

module.exports = new CommandInterface({
	alias: ['frogegg'],

	args: '{@user | trade}',

	desc:
		'Give a frog egg to someone! Once you collect 6, they will be changed into a silver ball. This command was created by ?' +
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
			if (p.args[0] == 'trade') {
				await trade(p);
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
		}
	},
});

async function display(p) {
	const count = (await p.redis.hget('data_' + p.msg.author.id, data)) || 0;
	const count2 = (await p.redis.hget('data_' + p.msg.author.id, data2)) || 0;

	if (count2) {
		await p.replyMsg(emoji, `, you currently have ${count} ${plural} and ${count2} ball(s)!`);
	} else {
		await p.replyMsg(emoji, `, you currently have ${count} ${plural}!`);
	}
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.hincrby('data_' + p.msg.author.id, data, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.hincrby('data_' + p.msg.author.id, data, 1);
			p.errorMsg(', you do not have any ' + plural + ' to give! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.hincrby('data_' + user.id, data, 2);
	await p.send(
		`${emoji} **| ${user.username}**, **${p.msg.author.username}** gave you 2 frogeggs! Save 6 to trade for a silverball!`
	);
}

async function trade(p) {
	const count = (await p.redis.hget('data_' + p.msg.author.id, data)) || 0;

	if (count >= 6) {
		await p.redis.hincrby('data_' + p.msg.author.id, data, -5);
		await p.redis.hincrby('data_' + p.msg.author.id, data2, 1);
		await p.replyMsg(
			emoji,
			', you received a shiny silver ball! Save that ball to gift to baby yoda!'
		);
	} else {
		await p.errorMsg(', you need at least 6 frog eggs to convert them into silver balls!');
	}
}
