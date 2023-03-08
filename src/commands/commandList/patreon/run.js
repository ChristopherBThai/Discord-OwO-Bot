/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const data = 'run';
const dataEmoji = '<a:run:798062668417859584>';

module.exports = new CommandInterface({
	alias: ['run'],

	args: '',

	desc: 'Run one kilometer. Each day you can only do this command one more time than the amount of times you did it the day before. This command was created by ?103409793972043776?',

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
			let newMax = 0;
			if (prevMax == current) {
				newMax = current + 1;
			} else {
				newMax = Math.ceil(prevMax / 2);
			}
			parseInt(await p.redis.hset('data_' + p.msg.author.id, data + '_max', newMax));
			max = newMax;
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
		let text = `${p.config.emoji.invalid} **|** You are too tired to run!\n${
			p.config.emoji.blank
		} **|** You ran ${max} kilometer(s) today!\n${p.config.emoji.blank} **|** You can run ${
			max + 1
		} kilometers tomorrow!\n${p.config.emoji.blank} **|** You ran ${total} in total!`;
		p.send(text);
	} else if (current == 1) {
		let spoil = prevMax + 1 - max;
		if (prevMax == 0) {
			let text = `${dataEmoji} **|** You ran ${current}/${max} kilometers today!\n${p.config.emoji.blank} **|** You're just getting warmed up.\n${p.config.emoji.blank} **|** Total distance traveled: ${total}km`;
			p.send(text);
		} else {
			let text = `${dataEmoji} **|** You stopped your run a bit early yesterday.\n${p.config.emoji.blank} **|** You ran ${current}/${max} kilometers today!\n${p.config.emoji.blank} **|** Total distance traveled: ${total}km`;
			if (!spoil) {
				text = `${dataEmoji} **|** You ran ${current}/${max} kilometers today!\n${p.config.emoji.blank} **|** You're just getting warmed up.\n${p.config.emoji.blank} **|** Total distance traveled: ${total}km`;
			}
			p.send(text);
		}
	} else {
		let extraText = '';
		if (current == max) {
			extraText = `\n${p.config.emoji.blank} **|** Nicely done! Stretch, rest, and hydrate for tomorrow`;
		} else if (current + 1 == max) {
			extraText = `\n${p.config.emoji.blank} **|** Almost there!`;
		}
		let text = `${dataEmoji} **|** You ran ${current}/${max} kilometers today!${extraText}\n${p.config.emoji.blank} **|** Total distance traveled: ${total}km`;
		p.send(text);
	}
}
