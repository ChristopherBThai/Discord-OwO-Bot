/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const CommandInterface = require('../../CommandInterface');

module.exports = new CommandInterface({
	alias: ['giveall'],
	owner: true,

	execute: async function (p) {
		let amount = 0;
		if (p.global.isInt(p.args[0])) amount = parseInt(p.args[0]);
		else return;
		let users = p.global.getids(p.msg.channel.guild.members);
		let sql = `UPDATE IGNORE cowoncy SET money = money + ${amount} WHERE id IN (${users});`;
		let result = await p.query(sql);
		p.send(
			`**💎 |** ${p.msg.author.username} gave @everyone ${amount} cowoncy!!!`
		);
	},
});
