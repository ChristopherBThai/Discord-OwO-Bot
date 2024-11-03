/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const commandGroups = require('../../../utils/commandGroups.js');
const request = require('request');
const rocketEmoji = '🚀';

module.exports = new CommandInterface({
	alias: ['eject', 'amongus'],

	args: '@user',

	desc: 'Eject a user into space!',

	example: [],

	related: [],

	permissions: ['sendMessages', 'attachFiles'],

	group: ['memegeneration'],

	appCommands: [
		commandGroups.addOption('eject', ['gen'], {
			'name': 'eject',
			'description': 'Eject the user into space',
			'type': 1,
			'options': [
				{
					'name': 'user',
					'description': 'The user to use',
					'type': 6,
					'required': true,
				},
			],
		}),
		{
			'type': 2,
			'name': 'Eject to space',
			'dm_permission': true,
			'integration_types': [0, 1],
			'contexts': [0, 1, 2],
		},
	],

	cooldown: 30000,
	half: 100,
	six: 500,
	bot: true,

	execute: async function (p) {
		let user = p.options.user || p.getMention(p.args[0]);
		if (!user) {
			p.errorMsg(', you must tag a user!', 5000);
			p.setCooldown(5);
			return;
		}

		try {
			const uuid = await fetchImage(p, user);
			const url = `${process.env.GEN_HOST}/img/${uuid}.gif`;
			const data = await p.DataResolver.urlToBuffer(url);
			await p.send(
				`${rocketEmoji} **| ${p.getName()}** decided to vote off ${p.getName(user)}`,
				null,
				{ file: data, name: 'eject.gif' }
			);
		} catch (err) {
			console.error(err);
			p.errorMsg('Failed to generate gif. Try again later.', 3000);
		}
	},
});

function fetchImage(p, user) {
	const info = {
		username: p.getName(user),
		avatarLink: user.dynamicAvatarURL('png'),
		password: process.env.GEN_PASS,
	};

	return new Promise((resolve, reject) => {
		try {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/amongus`,
					json: true,
					body: info,
				},
				(error, res, body) => {
					if (error) {
						reject();
						return;
					}
					if (res.statusCode == 200) resolve(body);
					else reject();
				}
			);
		} catch (err) {
			reject();
		}
	});
}
