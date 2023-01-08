/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['pika', 'pikapika'],

	args: '',

	desc: 'Pikachuuuuuu! This command was created by ?693470720281280532?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 30000,
	half: 80,
	six: 400,
	bot: true,

	execute: async function (p) {
		p.send({
			embed: {
				author: {
					name: 'Pikachuuuuuuu',
					icon_url: p.msg.author.avatarURL,
				},
				color: 16312092,
				image: {
					url: 'https://cdn.discordapp.com/attachments/731924620906594344/731927751572979736/image0.jpg',
				},
			},
		});
	},
});
