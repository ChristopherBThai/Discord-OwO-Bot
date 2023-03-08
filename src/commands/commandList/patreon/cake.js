/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const cakeEmoji = '🍰';
const cupcakeEmoji = '<:cupcake:641879181680181248>';
const sliceEmoji = '🎂';
const owner = '520399213683671074';
const words = ['Yum!', 'Delicious!', '*Drools...*', 'Lucky!!', ':0', 'Yummy!', 'Gimme gimme!'];

module.exports = new CommandInterface({
	alias: ['cake'],

	args: '{@user}',

	desc: 'Give some cake to a friend! You can only gain cake if you receive it! This command was created by [911]Lord',

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
				p.errorMsg(', You cannot give cake to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('cake', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(cakeEmoji, ', You currently have **' + count + '** slice(s) of cake to give!');
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('cake', p.msg.author.id, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.incr('cake', p.msg.author.id, 1);
			p.errorMsg(', you do not have any cake! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	let rand = Math.random();
	if (rand <= 1 / 3) {
		await p.redis.incr('cake', user.id, 1);
		p.replyMsg(
			cupcakeEmoji,
			', you gave one slice of cake to **' +
				user.username +
				'**! ' +
				words[Math.floor(Math.random() * words.length)]
		);
	} else if (rand <= 2 / 3) {
		await p.redis.incr('cake', user.id, 2);
		p.replyMsg(
			sliceEmoji,
			', you gave two slices of cake to **' +
				user.username +
				'**! ' +
				words[Math.floor(Math.random() * words.length)]
		);
	} else {
		await p.redis.incr('cake', user.id, 3);
		p.replyMsg(
			cakeEmoji,
			', you gave three slices of cake to **' +
				user.username +
				'**! ' +
				words[Math.floor(Math.random() * words.length)]
		);
	}
}
