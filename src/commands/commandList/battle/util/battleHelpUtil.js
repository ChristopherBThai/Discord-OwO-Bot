/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const pages = [
	'https://i.imgur.com/cJ9F3DM.png',
	'https://i.imgur.com/uHyENGL.png',
	'https://i.imgur.com/QjYt5Xv.png',
	'https://i.imgur.com/mFWT5wg.png',
	'https://i.imgur.com/G3zfrc6.png',
	'https://i.imgur.com/AnNmELo.png',
	'https://i.imgur.com/KGAcFZW.png',
];
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';

exports.help = async function (p, page = 0) {
	/* Make sure we don't over or under shoot the page */
	if (page < 0) page = 0;
	if (page >= pages.length) page = pages.length - 1;

	/* Construct embed message */
	let embed = {
		author: {
			name: 'Guide to battle!',
		},
		description:
			'Have any questions? Please feel free to ask in our server!\n' + p.config.guildlink,
		color: p.config.embed_color,
		image: {
			url: pages[page],
		},
		footer: {
			text: 'page ' + (page + 1) + '/' + pages.length,
		},
	};

	/* Send our initial message */
	let msg = await p.send({ embed });

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
		if (emoji.name === nextPageEmoji && page + 1 < pages.length) {
			page++;
			embed.image.url = pages[page];
			embed.footer.text = 'page ' + (page + 1) + '/' + pages.length;
			await msg.edit({ embed });
		}
		if (emoji.name === prevPageEmoji && page > 0) {
			page--;
			embed.image.url = pages[page];
			embed.footer.text = 'page ' + (page + 1) + '/' + pages.length;
			await msg.edit({ embed });
		}
	});

	collector.on('end', async function (_collected) {
		embed.color = 6381923;
		await msg.edit({ content: 'This message is now inactive', embed });
	});
};
