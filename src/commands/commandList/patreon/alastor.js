/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const dateUtil = require('../../../utils/dateUtil.js');
const gif1 =
	'https://cdn.discordapp.com/attachments/626155987904102402/673253558577004555/image0.gif';
const gif2 =
	'https://cdn.discordapp.com/attachments/626155987904102402/673253769907142679/image0.gif';
const gif3 =
	'https://cdn.discordapp.com/attachments/626155987904102402/696858611627851787/image0.gif';
const gif4 =
	'https://cdn.discordapp.com/attachments/626155987904102402/696858882680684604/image0.gif';
const table = 'alastor';

module.exports = new CommandInterface({
	alias: ['alastor'],

	args: '[feed]',

	desc: 'OwO Alastor to show your Alastor! Feed Alastor every day to increase your streak! When Alastor gets upset, offer him a crown to appease him and continue your streak! This command was created by ?229299825072537601?',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['patreon'],

	cooldown: 10000,
	half: 80,
	six: 400,

	execute: async function (p) {
		if (p.args[0] === 'feed') {
			const lastCrown = await p.redis.hget('cd_' + p.msg.author.id, table + '_crown');
			if (!lastCrown) {
				await p.redis.hset('cd_' + p.msg.author.id, table + '_crown', new Date());
				await p.redis.expire('cd_' + p.msg.author.id);
			} else if (new Date() - new Date(lastCrown) > 345600000) {
				displayCrown(p);
				return;
			}
			feed(p);
		} else if (p.args[0] === 'crown') {
			giveCrown(p);
		} else {
			display(p);
		}
	},
});

async function giveCrown(p) {
	let lastCrown = await p.redis.hget('cd_' + p.msg.author.id, table + '_crown');
	lastCrown = lastCrown ? new Date(lastCrown) : new Date();
	if (new Date() - lastCrown < 345600000) {
		p.errorMsg(", Alastor doesn't need a crown");
		return;
	}

	let result = await p.redis.incr('crown', p.msg.author.id, -1);
	// Error checking
	if (result == null || result < 0) {
		if (result < 0) p.redis.incr('crown', p.msg.author.id, 1);
		p.errorMsg(', you do not have any crowns! >:c', 3000);
		return;
	}

	await p.redis.hset('cd_' + p.msg.author.id, table + '_crown', new Date());
	await p.redis.expire('cd_' + p.msg.author.id);
	display(
		p,
		'That seems to have done the trick, he seems content. He will allow you to claim the daily streak.. maybe.',
		gif4
	);
}

async function displayCrown(p) {
	display(
		p,
		'Alastor is ready to battle. Try calming him down with a gift, quickly! Try the crown!',
		gif3
	);
}

async function feed(p) {
	const lasttime = await p.redis.hget('cd_' + p.msg.author.id, table);
	const afterMid = dateUtil.afterMidnight(lasttime);

	let streak = 1;
	let title = p.msg.author.username + "'s Alastor";
	if (afterMid.after) {
		await p.redis.hset('cd_' + p.msg.author.id, table, afterMid.now);
		await p.redis.expire('cd_' + p.msg.author.id);
		if (afterMid.withinDay || !lasttime) {
			streak = await p.redis.hincrby(p.msg.author.id, table);
			title = p.msg.author.username + ' fed Alastor!';
		} else {
			await p.redis.hset(p.msg.author.id, table, 1);
			title = p.msg.author.username + ', Alastor has stopped broadcasting';
		}
	} else {
		streak = await p.redis.hget(p.msg.author.id, table);
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

async function display(p, title, gif) {
	const lasttime = await p.redis.hget('cd_' + p.msg.author.id, table);
	const afterMid = dateUtil.afterMidnight(lasttime);
	const streak = await p.redis.hget(p.msg.author.id, table);
	if (!title) title = p.msg.author.username + "'s Alastor";
	if (!gif) gif = gif2;

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
