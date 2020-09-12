/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const carrotEmoji = '🥕'

module.exports = new CommandInterface({

	alias:["piku"],

	args:"",

	desc:"Pick one PikPik carrot. Each day you can only do this command one more time than the amount of times you did it the day before. This command was created by ?245103025805328384?",

	example:[],

	related:[],

	permissions:["sendMessages"],

	group:["patreon"],

	cooldown:60000,

	execute: async function(p){
		const reset = await p.redis.hget("data_"+p.msg.author.id, "carrot_reset");
		const afterMid = p.dateUtil.afterMidnight(reset);
		const prevMax = parseInt(await p.redis.hget("data_"+p.msg.author.id, "carrot_max")) || 0;
		let current = parseInt(await p.redis.hget("data_"+p.msg.author.id, "carrot_current")) || 0;
		let max = 1;

		if (afterMid.after) {
			if (afterMid.withinDay) {
				parseInt(await p.redis.hset("data_"+p.msg.author.id, "carrot_max", current + 1));
				max = current + 1;
			} else {
				await p.redis.hset("data_"+p.msg.author.id, "carrot_max", 1);
			}
			parseInt(await p.redis.hset("data_"+p.msg.author.id, "carrot_current", 0));
			current = 0;
			await p.redis.hset("data_"+p.msg.author.id, "carrot_reset", afterMid.now);
		} else {
			max = prevMax;
		}


		current = parseInt(await p.redis.hincrby("data_"+p.msg.author.id, "carrot_current", 1));
		let total = await p.redis.hincrby("data_"+p.msg.author.id, "carrot_total", 1);
		if (current > max) {
			await p.redis.hincrby("data_"+p.msg.author.id, "carrot_current", -1);
			total = await p.redis.hincrby("data_"+p.msg.author.id, "carrot_total", -1);
			p.send(`${p.config.emoji.invalid} **|** Your garden is out of carrots!\n${p.config.emoji.blank} **|** You harvested ${max} carrots today!\n${p.config.emoji.blank} **|** You can harvest ${max+1} tomorrow!\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`);
		} else if (current == 1) {
			let spoil = (prevMax + 1) - max;
			p.send(`${carrotEmoji} **|** You picked one PikPik carrot!\n${p.config.emoji.blank} **|** Yesterday you let ${spoil} carrots spoil...\n${p.config.emoji.blank} **|** You can still harvest ${max} today.\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`);
		} else {
			p.send(`${carrotEmoji} **|** You picked one PikPik carrot!\n${p.config.emoji.blank} **|** You harvested ${current}/${max} today!\n${p.config.emoji.blank} **|** You have ${total} carrots in total!`);
		}
		
	}
});

