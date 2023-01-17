/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const dateUtil = require('../../../utils/dateUtil.js');
const gif1 =
	'https://cdn.discordapp.com/attachments/719300418055962694/825092690026168320/image0.gif';
const gif2 =
	'https://cdn.discordapp.com/attachments/719300418055962694/825092690621628446/image1.gif';
const gif3 =
	'https://cdn.discordapp.com/attachments/719300418055962694/825092691246317638/image2.gif';
const gif4 =
	'https://cdn.discordapp.com/attachments/719300418055962694/825092691809140816/image3.gif';

const table = 'babyyoda';
const ball = 'frog_ball';
const cdFeed = table;
const cdBall = table + '_ball';

module.exports = new CommandInterface({
	alias: ['babyyoda'],

	args: '[feed | silverball]',

	desc: 'Feed baby yoda daily! Give him a silver ball if he throws a fit!\n\nThis command was created by ?575555630312456193?',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['patreon'],

	cooldown: 10000,
	half: 80,
	six: 400,

	execute: async function (p) {
		if (p.args[0] === 'feed') {
			const last = await p.redis.hget('cd_' + p.msg.author.id, cdBall);
			if (!last) {
				await p.redis.hset('cd_' + p.msg.author.id, cdBall, new Date());
				await p.redis.expire('cd_' + p.msg.author.id);
			} else if (new Date() - new Date(last) > 345600000) {
				return displayBall(p);
			}
			feed(p);
		} else if (p.args[0] === 'silverball') {
			giveBall(p);
		} else {
			display(p);
		}
	},
});

async function giveBall(p) {
	let last = await p.redis.hget('cd_' + p.msg.author.id, cdBall);
	last = last ? new Date(last) : new Date();
	if (new Date() - last < 345600000) {
		return p.errorMsg(", Baby Yoda doesn't need a silver ball");
	}

	let result = await p.redis.hincrby('data_' + p.msg.author.id, ball, -1);
	// Error checking
	if (result == null || result < 0) {
		if (result < 0) await p.redis.hincrby('data_' + p.msg.author.id, ball, 1);
		return p.errorMsg(', you do not have any silver balls! >:c', 3000);
	}

	await p.redis.hset('cd_' + p.msg.author.id, cdBall, new Date());
	await p.redis.expire('cd_' + p.msg.author.id);
	display(
		p,
		'That seems to have done the trick, he seems content. You can claim your daily streak now!',
		gif4
	);
}

async function displayBall(p) {
	display(p, 'Baby Yoda is throwing a fit! Calm him down by giving him a silver ball!', gif3);
}

async function feed(p) {
	const lasttime = await p.redis.hget('cd_' + p.msg.author.id, cdFeed);
	const afterMid = dateUtil.afterMidnight(lasttime);

	let streak = 1;
	let title = p.msg.author.username + "'s Baby Yoda";
	if (afterMid.after) {
		await p.redis.hset('cd_' + p.msg.author.id, cdFeed, afterMid.now);
		await p.redis.expire('cd_' + p.msg.author.id);
		if (afterMid.withinDay || !lasttime) {
			streak = await p.redis.hincrby('data_' + p.msg.author.id, table, 1);
			title = p.msg.author.username + ' fed Baby Yoda!';
		} else {
			await p.redis.hset('data_' + p.msg.author.id, table, 1);
			title = p.msg.author.username + ' you missed a day!';
		}
	} else {
		streak = await p.redis.hget('data_' + p.msg.author.id, table);
	}

	const embed = {
		author: {
			name: title,
			icon_url: p.msg.author.avatarURL,
		},
		color: p.config.embed_color,
		image: {
			url: afterMid.after ? gif1 : gif2,
		},
		footer: {
			text: `STREAK: ${streak} | Resets in: ${afterMid.hours}H ${afterMid.minutes}M ${afterMid.seconds}S`,
		},
	};

	p.send({ embed });
}

async function display(p, title, gif = gif2) {
	const lasttime = await p.redis.hget('cd_' + p.msg.author.id, cdFeed);
	const afterMid = dateUtil.afterMidnight(lasttime);
	const streak = (await p.redis.hget('data_' + p.msg.author.id, table)) || 0;
	if (!title) title = p.msg.author.username + "'s Baby Yoda";

	const embed = {
		author: {
			name: title,
			icon_url: p.msg.author.avatarURL,
		},
		color: p.config.embed_color,
		image: {
			url: gif,
		},
		footer: {
			text: `STREAK: ${streak} | Resets in: ${afterMid.hours}H ${afterMid.minutes}M ${afterMid.seconds}S`,
		},
	};

	p.send({ embed });
}
