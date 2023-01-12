/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const shopUtil = require('./util/shopUtil.js');
const dailyWeaponUtil = require('../battle/util/dailyWeaponUtil.js');
const PageClass = require('./PageClass.js');
const requireDir = require('require-dir');
const dir = requireDir('./pages', { recurse: true });
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';

var initialPages = [];
for (let key in dir) {
	if (new dir[key]() instanceof PageClass) {
		initialPages.splice(new dir[key]().id, 0, dir[key]);
	}
}

module.exports = new CommandInterface({
	alias: ['shop', 'market'],

	args: '',

	desc: 'Spend your cowoncy for some items!',

	example: [],

	related: ['owo money'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles', 'addReactions'],

	group: ['economy'],

	cooldown: 15000,

	execute: async function (p) {
		if (
			p.args.length &&
			['wallpaper', 'wp', 'wallpapers', 'background', 'backgrounds'].includes(
				p.args[0].toLowerCase()
			)
		) {
			await shopUtil.displayWallpaperShop(p);
		} else if (
			p.args.length &&
			['weapon', 'w', 'shard', 'weapons', 'weaponshard', 'shards', 'weaponshards'].includes(
				p.args[0].toLowerCase()
			)
		) {
			await dailyWeaponUtil.displayShop(p);
		} else {
			await displayShop(p);
		}
	},
});

async function displayShop(p) {
	let pages = await initPages(p);

	let embed = await getPage(p, pages);
	let msg = await p.send({ embed });
	let filter = (emoji, userID) =>
		(emoji.name === nextPageEmoji || emoji.name === prevPageEmoji) && userID === p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);

	collector.on('collect', async function (emoji) {
		if (emoji.name === nextPageEmoji) {
			if (pages.currentPage < pages.totalPages) pages.currentPage++;
			else pages.currentPage = 1;
			embed = await getPage(p, pages);
			await msg.edit({ embed });
		} else if (emoji.name === prevPageEmoji) {
			if (pages.currentPage > 1) pages.currentPage--;
			else pages.currentPage = pages.totalPages;
			embed = await getPage(p, pages);
			await msg.edit({ embed });
		}
	});

	collector.on('end', async function (_collected) {
		embed = await getPage(p, pages);
		embed.color = 6381923;
		await msg.edit({ content: 'This message is now inactive', embed });
	});
}

async function getPage(p, pages) {
	let embed = {
		author: {
			icon_url: p.msg.author.avatarURL,
		},
		color: p.config.embed_color,
		footer: {
			text: 'Page ' + pages.currentPage + '/' + pages.totalPages,
		},
	};
	let tempPage = pages.currentPage;
	for (let i in pages.pages) {
		let page = pages.pages[i];
		if (tempPage <= page.totalPages) {
			return await page.getPage(tempPage, embed);
		} else {
			tempPage -= page.totalPages;
		}
	}
}

async function initPages(p) {
	let pages = [];
	let totalPages = 0;
	for (let i in initialPages) {
		let page = new initialPages[i](p);
		let pageNum = await page.totalPages();
		totalPages += pageNum;
		page.totalPages = pageNum;
		pages.push(page);
	}

	return { totalPages, pages, currentPage: 1 };
}
