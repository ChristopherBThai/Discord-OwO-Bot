/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['points'],

	args: '',

	desc: "Gives the user a point. This is the same as just saying owo in your messages.\nYou weren't really suppose to find this.",

	example: [],

	related: [],

	cooldown: 10000,
	half: 90,
	six: 700,
	bot: true,

	execute: async function (p) {
		//Adds points
		let sql =
			'INSERT INTO user (id,count) VALUES (' +
			p.msg.author.id +
			',1) ON DUPLICATE KEY ' +
			'UPDATE count = count + 1;';
		sql +=
			'INSERT INTO guild (id,count) VALUES (' +
			p.msg.channel.guild.id +
			',1) ON DUPLICATE KEY UPDATE count = count + 1;';

		await p.query(sql);
		p.quest('owo');
		p.logger.incr('cowoncy', 2, { type: 'points' }, p.msg);
		p.logger.incr('points', 1, {}, p.msg);
	},
});
