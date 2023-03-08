/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['avatar', 'user'],

	args: '{@user}',

	desc: "Look at your or other people's avatar!",

	example: ['owo avatar @OwO'],

	related: [],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['social'],

	cooldown: 2000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let user;
		if (p.args.length == 0) {
			user = p.msg.author;
		} else if (p.global.isUser(p.args[0]) || p.global.isInt(p.args[0])) {
			let id = p.args[0].match(/[0-9]+/)[0];
			user = await p.fetch.getUser(id);
		}

		if (!user) {
			p.errorMsg(', I failed to fetch user information... sowwy', 3000);
			return;
		}

		let embed = {
			fields: [
				{
					name:
						user.username +
						'#' +
						user.discriminator +
						(user.bot ? ' <:bot:489278383646048286>' : ''),
					value: '`ID: ' + user.id + '`',
				},
			],
			color: p.config.embed_color,
			image: { url: user.dynamicAvatarURL(null, 1024) },
		};

		let member;
		if ((member = await p.fetch.getMember(p.msg.channel.guild, user.id))) {
			let hex = p.global.getRoleColor(member);
			let memberStatus = !member.status ? 'offline' : member.status;
			embed.fields[0].value =
				(member.nick ? '`Nickname: ' + member.nick + '`\n' : '') +
				'`ID: ' +
				member.id +
				'`' +
				(hex ? '\n`RoleColor: ' + hex + '`' : '');
			embed.fields[0].name += '  `' + memberStatus + '`';
		}

		await p.send({ embed });
	},
});
