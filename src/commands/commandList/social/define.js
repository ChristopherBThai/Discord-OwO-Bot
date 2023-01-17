/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const ud = require('urban-dictionary');
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';

module.exports = new CommandInterface({
	alias: ['define'],

	args: '{word}',

	desc: 'I shall define thy word!',

	example: ['owo define tsundere'],

	related: [],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['fun'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let word = p.args.join(' ');
		if (word == '') {
			p.errorMsg(', Silly human! Makes sure to add a word to define!', 3000);
			return;
		}
		try {
			await ud.define(word, function (error, entries) {
				try {
					if (error) {
						p.errorMsg(", I couldn't find that word! :c", 3000);
					} else {
						let pages = [];
						let count = 1;
						for (let i = 0; i < entries.length; i++) {
							let def = entries[i].definition;
							let url = entries[i].permalink;
							let example = '\n*``' + entries[i].example + ' ``*';
							let result = def + example;
							if (!p.msg.channel.nsfw && p.global.isProfane(result)) {
								result =
									'⚠️ **A few words may have been censored! To view an uncensored version, use this command in a NSFW channel.** ⚠️\n\n' +
									p.global.cleanString(result);
							}
							let run = true;
							do {
								let print = '';
								if (result.length > 1700) {
									print = result.substring(0, 1700);
									result = result.substring(1700);
								} else {
									print = result;
									run = false;
								}
								let embed = {
									description: print || '*no description*',
									color: p.config.embed_color,
									author: {
										name: "Definition of '" + entries[0].word + "'",
										icon_url: p.msg.author.avatarURL,
									},
									url: url,
									footer: {
										text: 'Definition ' + count + '/' + entries.length,
									},
								};
								pages.push({ embed });
							} while (run);
							count++;
						}
						display(p, pages);
					}
					/* eslint-disable-next-line */
				} catch (err) {}
			});
			/* eslint-disable-next-line */
		} catch (err) {}
	},
});

async function display(p, pages) {
	let loc = 0;
	let msg = await p.send(pages[loc]);

	/* Add a reaction collector to update the pages */
	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);

	let filter = (emoji, userID) =>
		(emoji.name === nextPageEmoji || emoji.name === prevPageEmoji) && userID === p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	/* Flip the page if reaction is pressed */
	collector.on('collect', async function (emoji) {
		/* Save the animal's action */
		if (emoji.name === nextPageEmoji && loc + 1 < pages.length) {
			loc++;
			await msg.edit(pages[loc]);
		}
		if (emoji.name === prevPageEmoji && loc > 0) {
			loc--;
			await msg.edit(pages[loc]);
		}
	});

	collector.on('end', async function (_collected) {
		let embed = pages[loc];
		embed.embed.color = 6381923;
		await msg.edit({ content: 'This message is now inactive', embed });
	});
}
