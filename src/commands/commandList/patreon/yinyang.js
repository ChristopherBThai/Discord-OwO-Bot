/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const yinyangEmoji = '<a:yinyang:678514299219476490>';
const ramenEmoji = '🍜';
const owner = '549876586720133120';

module.exports = new CommandInterface({
	alias: ['yinyang', 'yy'],

	args: '{@user}',

	desc: 'Give a yin and yang to someone! Collect 6 to combine them into ramen! You can only gain ying yangs if you receive it! This command was created by ! 「陰陽」 Kitsune ☯',

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
				p.errorMsg(', You cannot give energy to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let count = await p.redis.zscore('yinyang', p.msg.author.id);
	if (!count) count = 0;

	p.replyMsg(
		yinyangEmoji,
		', You currently have ' +
			(count % 6) +
			' energy of Yin and Yang to bless! You can also enjoy ' +
			Math.floor(count / 6) +
			' cup(s) of ' +
			ramenEmoji
	);
}

async function give(p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr('yinyang', p.msg.author.id, -1);

		// Error checking
		const refund = +result < 0 || (+result + 1) % 6 <= 0;
		if (result == null || refund) {
			if (refund) p.redis.incr('yinyang', p.msg.author.id, 1);
			p.errorMsg(', you do not have any energy! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	let result = await p.redis.incr('yinyang', user.id, 2);
	let text =
		', you gave two dual energy of Yin and Yang to **' +
		user.username +
		'**! The blessing has empowered your botting spirit!!';
	if ((result % 6) - 2 < 0) {
		text +=
			'\n' +
			p.config.emoji.blank +
			' **|** Wow! Yin and Yang fused and became a steaming hot ramen! ' +
			ramenEmoji;
	}
	p.replyMsg(yinyangEmoji, text);
}
