/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const lootboxUtil = require('../zoo/lootboxUtil.js');
const ringUtil = require('../social/util/ringUtil.js');
const gemUtil = require('../zoo/gemUtil.js');
const shopUtil = require('./util/shopUtil.js');
const weaponUtil = require('../battle/util/weaponUtil.js');
const crateUtil = require('../battle/util/crateUtil.js');
const wallpaperUtil = require('../social/util/wallpaperUtil.js');
const itemUtil = require('./util/itemUtil.js');
const alterInventory = require('../patreon/alterInventory.js');

module.exports = new CommandInterface({
	alias: ['inventory', 'inv'],

	args: '',

	desc: "Displays your inventory! Use 'owo equip' to use them!",

	example: [],

	related: ['owo equip'],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['animals'],

	cooldown: 10000,
	half: 80,
	six: 500,

	execute: async function (p) {
		let msg = p.msg;

		/* {emoji,id,count} */
		let promises = await Promise.all([
			ringUtil.getItems(p),
			lootboxUtil.getItems(p),
			gemUtil.getItems(p),
			weaponUtil.getItems(p),
			crateUtil.getItems(p),
			wallpaperUtil.getItems(p),
			itemUtil.getItems(p),
		]);
		let inv = addToString(promises);

		let text = '**====== ' + msg.author.username + "'s Inventory ======**\n" + inv;
		if (inv == '') text = 'Your inventory is empty :c';
		text = alterInventory.alter(p, text, { user: p.msg.author, inv });
		p.send(text);
	},
});

/* Converts an array of items to strings */
function addToString(items) {
	let sorted = [];
	let itemsID = {};
	let maxCount = 0;
	/* Sort items by id and get largest count*/
	for (let i = 0; i < items.length; i++) {
		let itemList = items[i];
		for (let key in itemList) {
			sorted.push(itemList[key].id);
			itemsID[itemList[key].id] = itemList[key];
			itemList[key].count = parseInt(itemList[key].count);
			if (itemList[key].count > maxCount) maxCount = itemList[key].count;
		}
	}
	sorted.sort((a, b) => a - b);
	items = [];
	for (let i = 0; i < sorted.length; i++) {
		items.push(itemsID[sorted[i]]);
	}
	let digits = Math.trunc(Math.log10(maxCount) + 1);

	/* Add to text */
	let text = '';
	let count = 0;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		text +=
			'`' +
			(item.id < 10 ? '0' : '') +
			(item.id < 100 ? '0' : '') +
			item.id +
			'`' +
			item.emoji +
			shopUtil.toSmallNum(item.count, digits);
		count++;
		if (count == 4) {
			text += '\n';
			count = 0;
		} else text += '    ';
	}

	return text;
}
