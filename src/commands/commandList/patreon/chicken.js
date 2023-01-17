/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emoji = '<a:chicken2:878167788617871390>';
const owner = '575555630312456193';
const data = 'chicken';
const plural = 'chickens';

module.exports = new CommandInterface({
	alias: ['chicken', 'jester'],

	args: '{@user}',

	desc:
		'Give two chickens to someone! You can only gain one if you receive it! This command was created by ?' +
		owner +
		'? and ?428249367577755690?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 30000,
	half: 80,
	six: 400,
	bot: true,

	execute: async function (p) {
		if (p.command == 'jester') {
			displayJester(p);
			p.setCooldown(5);
		} else if (p.args.length == 0) {
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
				p.errorMsg(', You cannot give it to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = (await p.redis.hget('data_' + p.msg.author.id, data)) || 0;
	p.replyMsg(emoji, ', you currently have ' + count + ' ' + plural + '!');
}

async function displayJester(p) {
	let count = (await p.redis.hget('data_custom', 'chicken')) || 0;
	p.send(
		'<a:jester1:878170294462853130> **|** ꒪꒳꒪! <a:jester3:878172050336927784> The OwO-Jester has stolen in total ' +
			count +
			' chickens from their OwO-Community! <a:jester4:878172050617942036>'
	);
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

	let friendCount = await p.redis.hincrby('data_' + user.id, data, 2);

	let msg = `<a:chicken1:878167788529795073> **| W!NNER, WiNNER! CH!CKEN DiNNER! **${user.username}, you have received 2 chickies! <a:chicken2:878167788617871390> Keep collecting,...`;

	if (friendCount >= 7 && Math.random() <= 0.2) {
		await p.redis.hincrby('data_' + user.id, data, -3);
		await p.redis.hincrby('data_custom', 'chicken', 3);
		msg +=
			'\n<a:jester1:878170294462853130> **|** ꒪꒳꒪psieee!  The OwO-Jester has stolen 3 chickens out of your inventory! <a:jester2:878170294756470795>';
	}

	p.send(msg);
}
