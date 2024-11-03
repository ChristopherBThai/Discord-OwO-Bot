/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const commandGroups = require('../../../utils/commandGroups.js');
const request = require('request');

module.exports = new CommandInterface({
	alias: ['waddle'],

	args: '@user|emoji',

	desc: 'Create a waddle emoji! You can add it to server if you have used `owo emoji set`',

	example: ['owo waddle @user', 'owo waddle :emoji:'],

	related: ['owo emoji'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['memegeneration'],

	appCommands: [
		commandGroups.addOption('waddle', ['gen'], {
			'name': 'waddle',
			'description': 'Generate a waddle emoji',
			'type': 2,
			'options': [
				{
					'name': 'user',
					'description': "Generate a waddle emoji with a user's avatar",
					'type': 1,
					'options': [
						{
							'name': 'user',
							'description': 'The user to use',
							'type': 6,
						},
					],
				},
				{
					'name': 'emoji',
					'description': 'Generate a waddle emoji with an emoji',
					'type': 1,
					'options': [
						{
							'name': 'emoji',
							'description': 'The emoji to use',
							'type': 3,
							'required': true,
						},
					],
				},
			],
		}),
	],

	cooldown: 30000,
	half: 100,
	six: 500,
	bot: true,

	execute: async function (p) {
		let user = p.getMention(p.args[0]) || p.options.user;
		let link;
		let name;
		if (user) {
			link = user.dynamicAvatarURL('png', 128);
			name = user.username;
		} else if (p.global.isEmoji(p.args[0] || p.options.emoji)) {
			const emoji = p.args[0] || p.options.emoji;
			link = emoji.match(/:[0-9]+>/gi)[0];
			link = `https://cdn.discordapp.com/emojis/${link.slice(1, link.length - 1)}.png`;
			name = emoji.match(/:[\w]+:/gi)[0];
			name = name.slice(1, name.length - 1);
		} else if (!p.args.length) {
			link = p.msg.author.dynamicAvatarURL('png', 128);
			name = p.getName();
		} else {
			p.errorMsg(', invalid arguments! Please tag a user or add an emoji!', 3000);
			p.setCooldown(5);
			return;
		}

		try {
			const uuid = await fetchImage(p, link);
			const url = `${process.env.GEN_HOST}/img/${uuid}.gif`;
			await display(p, url, name);
		} catch (err) {
			console.log(err);
			p.errorMsg(', Failed to generate gif. Try again later.', 3000);
			p.setCooldown(5);
		}
	},
});

async function display(p, url, name) {
	const emojiName = `${name.replace(/[^\w]/gi, '')}_waddle`;
	let embed = createEmbed(p, url, name, emojiName);
	const components = await p.global.getStealButton(p, true);
	const content = {
		embed,
		components,
	};
	let msg = await p.send(content);

	// Create interaction collector
	let filter = (componentName) => componentName === 'steal';
	let collector = p.interactionCollector.create(msg, filter, { idle: 120000 });
	const emojiAdder = new p.EmojiAdder(p, { name: emojiName, url });

	collector.on('collect', async (component, user, ack) => {
		try {
			if (await emojiAdder.addEmoji(user.id)) {
				(content.embed = createEmbed(p, url, name, emojiName, emojiAdder)), ack(content);
			}
		} catch (err) {
			if (!emojiAdder.successCount) {
				(content.embed = createEmbed(p, url, name, emojiName, emojiAdder)), ack(content);
			}
		}
	});

	collector.on('end', async function (_collected) {
		content.embed = createEmbed(p, url, name, emojiName, emojiAdder);
		content.embed.color = 6381923;
		content.content = 'This message is now inactive';
		content.components[0].components[0].disabled = true;
		await msg.edit(content);
	});
}

function createEmbed(p, url, name, emojiName, emojiAdder) {
	const embed = {
		author: {
			name: `${name} is waddling!`,
			url: url,
			icon_url: p.msg.author.avatarURL,
		},
		description: `\`${emojiName}\``,
		color: p.config.embed_color,
		image: {
			url: url,
		},
		url: url,
		footer: {},
	};

	if (emojiAdder) {
		if (emojiAdder.successCount) {
			embed.footer.text =
				'Emoji added!' + (emojiAdder.successCount > 1 ? ' x' + emojiAdder.successCount : '');
			embed.color = 65280;
		} else {
			embed.footer.text =
				'Failed to add emoji' + (emojiAdder.failureCount > 1 ? ' x' + emojiAdder.failureCount : '');
			embed.color = 16711680;
		}
	}

	return embed;
}

async function fetchImage(p, link) {
	const info = {
		avatarLink: link,
		password: process.env.GEN_PASS,
	};

	return new Promise((resolve, reject) => {
		try {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/waddle`,
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
