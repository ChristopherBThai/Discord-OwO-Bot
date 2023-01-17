/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const profileUtil = require('./util/profileUtil.js');

module.exports = new CommandInterface({
	alias: ['profile'],

	args: 'set [about|background|wallpaper|title|accent|public|private] {argument}',

	desc: 'Display your profile! Level up by talking on Discord!',

	example: [
		'owo profile',
		'owo profile set about Hello!',
		'owo profile set private',
		'owo profile set accent #FFFFFF',
	],

	related: [],

	permissions: ['sendMessages', 'attachFiles'],

	group: ['social'],

	cooldown: 3000,

	execute: async function (p) {
		if (p.args.length <= 0) {
			await profileUtil.displayProfile(p, p.msg.author);
		} else if (p.global.isUser(p.args[0]) || p.global.isInt(p.args[0])) {
			let user = p.args[0].match(/[0-9]+/)[0];
			user = await p.fetch.getUser(user);
			if (!user) p.errorMsg(", I couldn't find that user!", 3000);
			else {
				let sql = `SELECT private FROM user INNER JOIN user_profile ON user.uid = user_profile.uid WHERE id = ${user.id};`;
				let result = await p.query(sql);
				if (!result[0] || !result[0].private) await profileUtil.displayProfile(p, user);
				else p.errorMsg(', **' + user.username + '** has their profile set to private');
			}
		} else if (p.args.length > 1 && p.args[0] == 'set') {
			if (['about'].includes(p.args[1].toLowerCase())) {
				profileUtil.editAbout(p);
			} else if (['background', 'wallpaper', 'wp'].includes(p.args[1].toLowerCase())) {
				profileUtil.editBackground(p);
			} else if (['title', 'status'].includes(p.args[1].toLowerCase())) {
				profileUtil.editTitle(p);
			} else if (['private'].includes(p.args[1].toLowerCase())) {
				profileUtil.setPrivate(p);
			} else if (['public'].includes(p.args[1].toLowerCase())) {
				profileUtil.setPublic(p);
			} else if (['accent'].includes(p.args[1].toLowerCase())) {
				profileUtil.editAccent(p);
			} else {
				p.errorMsg(
					', Invalid arguments! You can only edit `about`, `background`,`title` and `accent`!',
					3000
				);
			}
		}
	},
});
