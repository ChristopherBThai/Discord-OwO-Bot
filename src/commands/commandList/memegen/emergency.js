/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const request = require('request');
const Vibrant = require('node-vibrant');
const rocketEmoji = '🚀';

module.exports = new CommandInterface({
	alias: ['emergency', 'emergencymeeting'],

	args: '',

	desc: 'Call an emergency meeting!',

	example: [],

	related: [],

	permissions: ['sendMessages', 'attachFiles'],

	group: ['memegeneration'],

	cooldown: 30000,
	half: 100,
	six: 500,
	bot: true,

	execute: async function (p) {
		try {
			const uuid = await fetchImage(p, p.msg.author);
			const url = `${process.env.GEN_HOST}/img/${uuid}.gif`;
			const data = await p.DataResolver.urlToBuffer(url);
			await p.send(
				`${rocketEmoji} **| ${p.msg.author.username}** called an emergency meeting!`,
				null,
				{ file: data, name: 'eject.gif' }
			);
		} catch (err) {
			console.error(err);
			p.errorMsg(', Failed to generate gif. Try again later.', 3000);
		}
	},
});

async function fetchImage(p, user) {
	let handColor;
	try {
		let url = user.dynamicAvatarURL(null, 32);
		let palette = await Vibrant.from(url).getPalette();
		handColor = palette.Vibrant._rgb.join(',');
	} catch (err) {
		console.error(err);
		handColor = '255,255,255';
	}

	const info = {
		avatarLink: user.dynamicAvatarURL('png'),
		handColor,
		password: process.env.GEN_PASS,
	};

	return new Promise((resolve, reject) => {
		try {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/emergency`,
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
