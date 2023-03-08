/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const rEmoji = '<:rusty:704108168313045072>';
const eEmoji = '<:earthly:704108167990083706>';
const hEmoji = '<:heavenly:704108168258781284>';
const bEmoji = '<:broken:704913505937260654>';
const _emblem = '<:emblem:704913505693859881>';
const yessirEmoji = '<:yessir:704916201071181845>';
const gaspEmoji = '<:gasp:704916200794357762>';

module.exports = new CommandInterface({
	alias: ['army'],

	args: '[server]',

	desc: 'Collect Army Emblems for your server! You get 15 per day. This command was created by KITSUNE!',

	example: ['owo army', 'owo army s'],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 5000,

	execute: async function (p) {
		if (p.args[0] && ['s', 'server'].includes(p.args[0])) {
			await display(p);
		} else {
			await use(p);
		}
	},
});

async function display(p) {
	let rusty = (await p.redis.hget('data_' + p.msg.channel.guild.id, 'r_emblem')) || 0;
	let earthly = (await p.redis.hget('data_' + p.msg.channel.guild.id, 'e_emblem')) || 0;
	let heavenly = (await p.redis.hget('data_' + p.msg.channel.guild.id, 'h_emblem')) || 0;
	let text = `The server wide contributions are:\n${rEmoji}: ${rusty} | ${eEmoji}: ${earthly} | ${hEmoji}: ${heavenly}`;
	p.send(text);
}

async function use(p) {
	let emblem = (await p.redis.hget('data_' + p.msg.author.id, 'emblem')) || 0;
	let reset = await p.redis.hget('data_' + p.msg.author.id, 'emblem_reset');
	let afterMid = p.dateUtil.afterMidnight(reset);

	if (afterMid.after) {
		emblem = 15;
	}

	if (!emblem || emblem <= 0) {
		p.errorMsg(', you can only find 15 emblems per day!', 5000);
		return;
	}

	await p.redis.hset('data_' + p.msg.author.id, 'emblem', --emblem);
	if (afterMid.after) {
		await p.redis.hset('data_' + p.msg.author.id, 'emblem_reset', afterMid.now);
	}

	let rand = Math.random();

	let text;
	if (rand <= 0.1) {
		text = `${bEmoji} **|** Scavenging through the messages, you found the really old relic of the past! Shattered Army Emblem!! So old it turned to dust as you picked it up. :(`;
	} else if (rand <= 0.6) {
		text = `${rEmoji} **|** Scavenging through the messages, you found the rusty ol' Rusty Army Emblem!`;
		await p.redis.hincrby('data_' + p.msg.channel.guild.id, 'r_emblem', 1);
	} else if (rand <= 0.95) {
		text = `${eEmoji} **|** Scavenging through the messages, you found the mighty Earthly Army Emblem!! ${yessirEmoji}`;
		await p.redis.hincrby('data_' + p.msg.channel.guild.id, 'e_emblem', 1);
	} else {
		text = `${hEmoji} **|** HEAVENS!! Scavenging through the messages, you found the TRUE relic of the Ancients! The Heavenly Army Emblem!!!! ${gaspEmoji}`;
		await p.redis.hincrby('data_' + p.msg.channel.guild.id, 'h_emblem', 1);
	}

	text += `\n${p.config.emoji.blank} **|** Today's remaining Broken Army Emblem : ${emblem}`;
	await p.send(text);
}
