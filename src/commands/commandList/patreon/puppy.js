/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const data = 'puppy';
const dataEmoji = '<a:puppy:798057355140136980>';

module.exports = new CommandInterface({
	alias: ['puppy', 'pup'],

	args: '',

	desc: 'Pick one up a puppy. Each day you can only do this command one more time than the amount of times you did it the day before. This command was created by ?575555630312456193?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 60000,

	execute: async function (p) {
		await harvest(p);
	},
});

async function harvest(p) {
	const reset = await p.redis.hget('data_' + p.msg.author.id, data + '_reset');
	const afterMid = p.dateUtil.afterMidnight(reset);
	const prevMax = parseInt(await p.redis.hget('data_' + p.msg.author.id, data + '_max')) || 0;
	let current = parseInt(await p.redis.hget('data_' + p.msg.author.id, data + '_current')) || 0;
	let max = 1;

	if (afterMid.after) {
		if (afterMid.withinDay) {
			parseInt(await p.redis.hset('data_' + p.msg.author.id, data + '_max', current + 1));
			max = current + 1;
		} else {
			await p.redis.hset('data_' + p.msg.author.id, data + '_max', 1);
		}
		parseInt(await p.redis.hset('data_' + p.msg.author.id, data + '_current', 0));
		current = 0;
		await p.redis.hset('data_' + p.msg.author.id, data + '_reset', afterMid.now);
	} else {
		max = prevMax;
	}

	current = parseInt(await p.redis.hincrby('data_' + p.msg.author.id, data + '_current', 1));
	let total = await p.redis.hincrby('data_' + p.msg.author.id, data + '_total', 1);
	if (current > max) {
		await p.redis.hincrby('data_' + p.msg.author.id, data + '_current', -1);
		total = await p.redis.hincrby('data_' + p.msg.author.id, data + '_total', -1);
		let text = `${p.config.emoji.invalid} **|** There are no puppies to adopt!\n${
			p.config.emoji.blank
		} **|** You adopted ${max} puppies today!\n${p.config.emoji.blank} **|** You can adopt ${
			max + 1
		} puppies tomorrow!\n${p.config.emoji.blank} **|** You have ${total} puppies in total!`;
		p.send(text);
	} else if (current == 1) {
		let spoil = prevMax + 1 - max;
		if (prevMax == 0) {
			let text = `${dataEmoji} **|** You picked up one puppy!\n${p.config.emoji.blank} **|** You adopted ${total} puppies in total!`;
			p.send(text);
		} else {
			let text = `${dataEmoji} **|** You picked up one puppy!\n${p.config.emoji.blank} **|** Yesterday you missed ${spoil} puppy to adopt.\n${p.config.emoji.blank} **|** You can still adopt ${max} puppies today.\n${p.config.emoji.blank} **|** You adopted ${total} puppies in total!`;
			if (!spoil) {
				text = `${dataEmoji} **|** You picked up one puppy!\n${p.config.emoji.blank} **|** You can adopt ${max} puppies today.\n${p.config.emoji.blank} **|** You adopted ${total} puppies in total!`;
			}
			p.send(text);
		}
	} else {
		let text = `${dataEmoji} **|** You picked up one puppy!!\n${p.config.emoji.blank} **|** You adopted ${current}/${max} puppies today!\n${p.config.emoji.blank} **|** You adopted ${total} puppies in total!`;
		p.send(text);
	}
}
