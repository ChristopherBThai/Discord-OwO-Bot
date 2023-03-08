/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const penalty = 12;

module.exports = new CommandInterface({
	alias: ['sendverif'],

	owner: true,
	admin: true,

	execute: async function (p) {
		if (p.args.length < 1) {
			p.errorMsg(', please include user id');
			return;
		}

		let type = 'link';
		if (p.args[1]) {
			type = p.args[1];
		}
		if (!['link', 'captcha'].includes(type)) {
			p.errorMsg(', type can only be `link` or `captcha`');
			return;
		}

		let user = await p.fetch.getUser(p.args[0], false);
		if (!user) {
			p.errorMsg(', could not find user');
			return;
		}

		let userObj = await p.macro.getUser(user.id);
		const reason = 'requested by ' + p.msg.author.username;
		await p.macro.humanCheck(userObj, p, penalty, reason, user, type);
		await p.macro.setUser(user.id, userObj);

		p.send('Sent verification to ' + user.username + '#' + user.discriminator);
	},
});
