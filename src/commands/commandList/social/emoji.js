/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const baseURL = 'https://cdn.discordapp.com/emojis/';
const stickerUrl = 'https://media.discordapp.net/stickers/';

module.exports = new CommandInterface({
	alias: ['emoji', 'enlarge', 'jumbo'],

	args: '{setguild|unsetguild|previous|emoji1 emoji2 emoji3...}',

	desc: "Enlarge an emoji! You can list multiple emojis are use the 'previous' keyword to enlarge an emoji from the message above you!\nYou can also steal emojis if you use 'owo emoji setguild'.",

	example: ['owo emoji previous', 'owo emoji setguild'],

	related: [],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['social'],

	appCommands: [
		{
			'type': 3,
			'name': 'Grab Emojis',
			'dm_permission': true,
			'integration_types': [0, 1],
			'contexts': [0, 1, 2],
		},
	],

	cooldown: 7000,
	half: 100,
	six: 500,

	execute: async function (p) {
		/* Look at previous message */
		if (
			p.args.length == 0 ||
			(p.args[0] &&
				(p.args[0].toLowerCase() == 'prev' ||
					p.args[0].toLowerCase() == 'previous' ||
					p.args[0].toLowerCase() == 'p'))
		) {
			let msgs = await p.global.getChannelMessages(p.msg.channel, 10);
			if (!msgs) {
				p.errorMsg(', There are no emojis! >:c', 3000);
				return;
			}
			let emojis = '';
			for (let i in msgs) {
				const msg = msgs[i];
				emojis += msg.content;
				emojis += JSON.stringify(msg.embeds);
				if (msg.reactions) {
					for (let name in msg.reactions) {
						const emoji = msg.reactions[name];
						emojis += `<${emoji.animated ? 'a' : ''}:${name}>`;
					}
				}
				if (msg.stickerItems?.length) {
					msg.stickerItems.forEach((sticker) => {
						emojis += `<s:${sticker.name}:${sticker.id}>`;
					});
				}
			}

			emojis = parseIDs(emojis);
			if (emojis.length == 0)
				p.errorMsg(', There are no emojis! I can only look at the previous 10 messages! >:c', 3000);
			else await display(p, emojis);

			// Set emoji steal guild
		} else if (['setguild', 'setserver', 'set', 'setsteal'].includes(p.args[0].toLowerCase())) {
			setServer(p);

			// unset emoji steal guild
		} else if (
			['unsetguild', 'unsetserver', 'unset', 'unsetsteal'].includes(p.args[0].toLowerCase())
		) {
			unsetServer(p);

			/* Look at current message */
		} else {
			let text = p.args.join(' ');
			let emojis = parseIDs(text);
			if (emojis.length == 0) p.errorMsg(', There are no emojis! >:c', 3000);
			else await display(p, emojis);
		}
	},
});

function parseIDs(text) {
	let emojis = [];

	let parsedEmojis = text.match(/<[as]?:[a-z0-9_ ]+:[0-9]+>/gi);

	for (let i in parsedEmojis) {
		let emoji = parsedEmojis[i];
		let id = emoji
			.match(/:[0-9]+>/gi)[0]
			.substr(1)
			.slice(0, -1);
		let isSticker = emoji.match(/<s:/gi) ? true : false;
		if (isSticker) {
			let name = emoji
				.match(/:[a-z0-9_ ]+:/gi)[0]
				.substr(1)
				.slice(0, -1);
			let url = `${stickerUrl}${id}.png`;
			emojis.push({ name, id, url, isSticker });
		} else {
			let name = emoji
				.match(/:[a-z0-9_]+:/gi)[0]
				.substr(1)
				.slice(0, -1);
			let gif = emoji.match(/<a:/gi) ? true : false;
			let url = baseURL + id + (gif ? '.gif' : '.png');
			emojis.push({ name, id, gif, url, isSticker });
		}
	}

	return emojis;
}

async function display(p, emojis) {
	const emojiAdders = [];
	const createEmbed = (currentPage, maxPage) => {
		const emoji = emojis[currentPage];

		const embed = {
			author: {
				name: `Enlarged ${emoji.isSticker ? 'Sticker' : 'Emoji'}!`,
				url: emoji.url,
				icon_url: p.msg.author.avatarURL,
			},
			description: `**${emoji.isSticker ? 'STICKER' : 'EMOJI'}**: \`${emoji.name}\` \`${
				emoji.id
			}\``,
			color: p.config.embed_color,
			image: { url: emoji.url },
			url: emoji.url,
			footer: { text: `page ${currentPage + 1}/${maxPage + 1}` },
		};

		const emojiAdder = emojiAdders?.[currentPage];
		if (emojiAdder) {
			if (emojiAdder.successCount) {
				embed.footer.text +=
					' - Successfully stolen' +
					(emojiAdder.successCount > 1 ? ' x' + emojiAdder.successCount : '');
				embed.color = 65280;
			} else {
				embed.footer.text +=
					' - Failed to steal' +
					(emojiAdder.failureCount > 1 ? ' x' + emojiAdder.failureCount : '');
				embed.color = 16711680;
			}
		}

		return embed;
	};

	const additionalButtons = await p.global.getStealButton(p);
	const additionalFilter = (componentName, _user) => componentName === 'steal';
	const pagedMsg = new p.PagedMessage(p, createEmbed, emojis.length - 1, {
		idle: 120000,
		additionalFilter,
		additionalButtons,
	});

	pagedMsg.on('button', async (component, user, ack, { currentPage, maxPage }) => {
		if (component === 'steal') {
			const emoji = emojis[currentPage];
			if (!emojiAdders[currentPage]) emojiAdders[currentPage] = new p.EmojiAdder(p, emoji);
			try {
				if (await emojiAdders[currentPage].addEmoji(user.id)) {
					await ack({ embed: createEmbed(currentPage, maxPage) });
				}
			} catch (err) {
				if (!emojiAdders[currentPage].successCount) {
					await ack({ embed: createEmbed(currentPage, maxPage) });
				}
			}
		}
	});
}

async function setServer(p) {
	// Check if the user has emoji permissions
	if (!p.msg.member.permissions.has('manageEmojis')) {
		p.errorMsg(', you do not have permissions to edit emojis on this server!', 3000);
		return;
	}

	// Check if the bot has permissions
	if (!p.msg.channel.guild.members.get(p.client.user.id).permissions.has('manageEmojis')) {
		p.errorMsg(
			", I don't have permissions to add emojis! Please give me permission or reinvite me!\n" +
				p.config.invitelink
		);
		return;
	}

	let sql = `INSERT INTO emoji_steal (uid,guild) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),${p.msg.channel.guild.id}) ON DUPLICATE KEY UPDATE guild = ${p.msg.channel.guild.id};`;
	try {
		await p.query(sql);
	} catch (e) {
		if (e.code == 'ER_BAD_NULL_ERROR') {
			sql = `INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0);` + sql;
			await p.query(sql);
		}
	}

	p.replyMsg(p.config.emoji.steal, ', stolen emojis will now be sent to this server!');
}

async function unsetServer(p) {
	let sql = `DELETE FROM emoji_steal WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	await p.query(sql);
	p.replyMsg(p.config.emoji.steal, ', your server has been unset for stealing!');
}
