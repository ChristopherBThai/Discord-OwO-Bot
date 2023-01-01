/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const carrotEmoji = '🥕';
const rabbitEmoji = '🐇';
const windEmoji = '💨';
const yesEmoji = '👍';
const noEmoji = '👎';

module.exports = new CommandInterface({
	alias: ['piku'],

	args: '[farmer]',

	desc: 'Pick one PikPik carrot. Each day you can only do this command one more time than the amount of times you did it the day before. This command was created by ?245103025805328384?',

	example: ['owo piku', 'owo piku farmer'],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 60000,

	execute: async function (p) {
		if (['farmer', 'bunny', 'rabbit', 'hb'].includes(p.args[0])) {
			await farmer(p);
		} else {
			await harvest(p);
		}
	},
});

async function harvest(p, msg) {
	const reset = await p.redis.hget('data_' + p.msg.author.id, 'carrot_reset');
	const afterMid = p.dateUtil.afterMidnight(reset);
	const prevMax = parseInt(await p.redis.hget('data_' + p.msg.author.id, 'carrot_max')) || 0;
	let current = parseInt(await p.redis.hget('data_' + p.msg.author.id, 'carrot_current')) || 0;
	let max = 1;

	if (afterMid.after) {
		if (afterMid.withinDay) {
			parseInt(await p.redis.hset('data_' + p.msg.author.id, 'carrot_max', current + 1));
			max = current + 1;
		} else {
			await p.redis.hset('data_' + p.msg.author.id, 'carrot_max', 1);
		}
		parseInt(await p.redis.hset('data_' + p.msg.author.id, 'carrot_current', 0));
		current = 0;
		await p.redis.hset('data_' + p.msg.author.id, 'carrot_reset', afterMid.now);
	} else {
		max = prevMax;
	}

	current = parseInt(await p.redis.hincrby('data_' + p.msg.author.id, 'carrot_current', 1));
	let total = await p.redis.hincrby('data_' + p.msg.author.id, 'carrot_total', 1);
	if (current > max) {
		await p.redis.hincrby('data_' + p.msg.author.id, 'carrot_current', -1);
		total = await p.redis.hincrby('data_' + p.msg.author.id, 'carrot_total', -1);
		let text = `${p.config.emoji.invalid} **|** Your garden is out of carrots!\n${
			p.config.emoji.blank
		} **|** You harvested ${max} carrots today!\n${p.config.emoji.blank} **|** You can harvest ${
			max + 1
		} tomorrow!\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`;
		if (msg) msg.edit(text);
		else p.send(text);
	} else if (current == 1) {
		let spoil = prevMax + 1 - max;
		if (prevMax == 0) {
			let text = `${carrotEmoji} **|** You picked one PikPik carrot!\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`;
			if (msg) msg.edit(text);
			else p.send(text);
		} else {
			let text = `${carrotEmoji} **|** You picked one PikPik carrot!\n${p.config.emoji.blank} **|** Yesterday you let ${spoil} carrots spoil...\n${p.config.emoji.blank} **|** You can still harvest ${max} today.\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`;
			if (msg) msg.edit(text);
			else p.send(text);
		}
	} else {
		let text = `${carrotEmoji} **|** You picked one PikPik carrot!\n${p.config.emoji.blank} **|** You harvested ${current}/${max} today!\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`;
		if (msg) msg.edit(text);
		else p.send(text);
	}
}

async function farmer(p) {
	if (await checkFarmer(p)) return;
	const reset = await p.redis.hget('data_' + p.msg.author.id, 'carrot_reset');
	const afterMid = p.dateUtil.afterMidnight(reset);
	const prevMax = parseInt(await p.redis.hget('data_' + p.msg.author.id, 'carrot_max')) || 0;
	let current = parseInt(await p.redis.hget('data_' + p.msg.author.id, 'carrot_current')) || 0;
	let max = 1;

	if (afterMid.after) {
		if (afterMid.withinDay) {
			parseInt(await p.redis.hset('data_' + p.msg.author.id, 'carrot_max', current + 1));
			max = current + 1;
		} else {
			await p.redis.hset('data_' + p.msg.author.id, 'carrot_max', 1);
		}
		parseInt(await p.redis.hset('data_' + p.msg.author.id, 'carrot_current', 0));
		current = 0;
		await p.redis.hset('data_' + p.msg.author.id, 'carrot_reset', afterMid.now);
	} else {
		max = prevMax;
	}

	const msg = await p.send(
		`${rabbitEmoji} **|** I'll harvest 10 carrots for you, but I'm keeping half! Deal?`
	);
	let filter = (emoji, userID) =>
		(emoji.name === yesEmoji || emoji.name === noEmoji) && userID == p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, { time: 60000 });
	await msg.addReaction(yesEmoji);
	await msg.addReaction(noEmoji);
	let sema = false;
	collector.on('collect', async function (emoji) {
		collector.stop();
		if (sema) return;
		sema = true;
		if (emoji.name === yesEmoji) {
			current = parseInt(await p.redis.hincrby('data_' + p.msg.author.id, 'carrot_current', 10));
			if (current > max) {
				await p.redis.hincrby('data_' + p.msg.author.id, 'carrot_current', -10);
				msg.edit(`${rabbitEmoji} **|** You don't have at least 10 carrots left in your garden!`);
			} else {
				await p.redis.hset('data_' + p.msg.author.id, 'carrot_farmer', afterMid.now);
				msg.edit(`${windEmoji} **|** I'll be back in 10 minutes!`);
			}
		} else {
			harvest(p, msg);
		}
	});
}

async function checkFarmer(p) {
	const farmer = await p.redis.hget('data_' + p.msg.author.id, 'carrot_farmer');
	if (!farmer || farmer == 'false') return;
	if (new Date() - new Date(farmer) >= 600000) {
		await p.redis.hset('data_' + p.msg.author.id, 'carrot_farmer', false);
		const total = await p.redis.hincrby('data_' + p.msg.author.id, 'carrot_total', 5);
		p.send(
			`${rabbitEmoji} **|** I'm back with 5 carrots!\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`
		);
	} else {
		p.send(`${rabbitEmoji} **|** I'm still harvesting your carrots!`);
	}
	return true;
}
