/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['censor'],

	args: '',

	desc: 'This will censor any bad words displayed in battle!',

	example: [],

	related: ['owo uncensor'],

	permissions: ['sendMessages'],

	group: ['utility'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		if (!p.msg.member.permissions.has('manageChannels')) {
			p.send('**🚫 | ' + p.msg.author.username + '**, You are not an admin!', 3000);
			return;
		}
		if (p.args.length > 0) {
			p.send('**🚫 | ' + p.msg.author.username + '**, Invalid Arguments!', 3000);
			return;
		}

		let sql =
			'INSERT INTO guild (id,count,young) VALUES (' +
			p.msg.channel.guild.id +
			',0,1) ON DUPLICATE KEY UPDATE young = 1;';
		await p.query(sql);
		p.send(
			'**⚙ |** This guild is now kid friendly! Any offensive names in `battle` will be censored!'
		);
	},
});
