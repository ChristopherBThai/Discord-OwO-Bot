/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const poutineEmoji = '<:poutine:641879181684244494>';
const owner = '146273323339218944';
const words = [
	'Bon appétit!',
	'Yum!',
	'Delicious!',
	'*Drools...*',
	'Lucky!!',
	':0',
	'Yummy!',
	'Gimme gimme!',
];

module.exports = new CommandInterface({
	alias: ['poutine'],

	args: '{@user}',

	desc: 'Give a poutine to someone! You can only gain poutine if you receive it! This command was created by Mr.Poutine',

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
				p.errorMsg(', You cannot give dishes of poutine to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('poutine', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(poutineEmoji, ', You currently have **' + count + '** dish(es) of poutine to give!');
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('poutine', p.msg.author.id, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.incr('poutine', p.msg.author.id, 1);
			p.errorMsg(', you do not have any poutine! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.incr('poutine', user.id, 2);
	p.replyMsg(
		poutineEmoji,
		', you gave two dishes of poutine to **' +
			user.username +
			'**! ' +
			words[Math.floor(Math.random() * words.length)]
	);
}
