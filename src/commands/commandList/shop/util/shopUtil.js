/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const global = require('../../../../utils/global.js');
const numbers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';

exports.getItem = function (args) {
	let id = 0;

	if (global.isInt(args[0])) {
		id = parseInt(args[0]);
	} else {
		if (args.length != 1) return 'Invalid arguments!';
		return { name: 'weapon', id: args[0] };
	}

	if (id >= 10 && id < 49) return { name: 'item', id };
	if (args.length != 1) return 'Invalid arguments!';
	if (id == 50 || id == 49) return { name: 'lootbox', id };
	if (id > 50 && id < 100) return { name: 'gem', id: id };
	if (id == 100) return { name: 'crate' };
	if (id > 100) return { name: 'weapon', id: id };
};

exports.toSmallNum = function (count, digits) {
	var result = '';
	for (let i = 0; i < digits; i++) {
		let digit = count % 10;
		count = Math.trunc(count / 10);
		result = numbers[digit] + result;
	}
	return result;
};

exports.displayWallpaperShop = async function (p) {
	let sql = 'SELECT COUNT(bid) AS count FROM backgrounds WHERE active = 1;';
	let result = await p.query(sql);
	let totalPages = result[0].count;
	let currentPage = 1;
	if (p.args.length > 1 && p.global.isInt(p.args[1])) {
		currentPage = parseInt(p.args[1]);
		if (currentPage < 1) currentPage = 1;
		if (currentPage > totalPages) currentPage = totalPages;
	}

	let embed = await getWallpaperPage(p, currentPage, totalPages);
	let msg = await p.send({ embed });
	let filter = (emoji, userID) =>
		(emoji.name === nextPageEmoji || emoji.name === prevPageEmoji) && userID == p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);

	collector.on('collect', async function (emoji) {
		if (emoji.name === nextPageEmoji) {
			if (currentPage < totalPages) currentPage++;
			else currentPage = 1;
			embed = await getWallpaperPage(p, currentPage, totalPages);
			await msg.edit({ embed });
		} else if (emoji.name === prevPageEmoji) {
			if (currentPage > 1) currentPage--;
			else currentPage = totalPages;
			embed = await getWallpaperPage(p, currentPage, totalPages);
			await msg.edit({ embed });
		}
	});

	collector.on('end', async function (_collected) {
		embed = await getWallpaperPage(p, currentPage, totalPages);
		embed.color = 6381923;
		await msg.edit({ content: 'This message is now inactive', embed });
	});
};

async function getWallpaperPage(p, currentPage, totalPages) {
	let sql = `SELECT b.*,u.uid FROM backgrounds b LEFT JOIN (user_backgrounds ub INNER JOIN user u ON u.uid = ub.uid AND u.id = ${
		p.msg.author.id
	}) ON b.bid = ub.bid WHERE b.active = 1 ORDER BY b.bid LIMIT 1 OFFSET ${currentPage - 1};`;
	let result = await p.query(sql);

	let embed = {
		author: {
			name: 'OwO Shop: Wallpapers',
			icon_url: p.msg.author.avatarURL,
		},
		color: p.config.embed_color,
		footer: {
			text: 'Page ' + currentPage + '/' + totalPages,
		},
	};

	let idOffset = 200;
	let charLen = 35;
	if (result[0]) {
		let price = p.global.toShortNum(result[0].price);
		if (result[0].uid) price = 'OWNED';
		let cLength = charLen - result[0].bname.length + (4 - ('' + price).length);
		embed.description = `\`${idOffset + result[0].bid}\` **\`${result[0].bname}\`**\`${'-'.repeat(
			cLength
		)} ${price}\` <:cowoncy:416043450337853441>`;
		embed.image = {
			url: `${process.env.GEN_HOST}/background/${result[0].bid}.png`,
		};
		if (result[0].profile) embed.description = '*' + embed.description;
	} else {
		embed.description = 'There are no wallpapers to purchase';
		delete embed.footer;
	}

	return embed;
}
