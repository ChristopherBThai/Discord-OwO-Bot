/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const shopUtil = require('./util/shopUtil.js');
const itemUtil = require('./util/itemUtil.js');
const lootbox = require('../zoo/lootbox.js');
const gemUtil = require('../zoo/gemUtil.js');
const weapon = require('../battle/weapon.js');
const crate = require('../battle/crate.js');

module.exports = new CommandInterface({
	alias: ['equip', 'use'],

	args: '{id}',

	desc: 'Use items from your inventory!',

	example: ['owo equip 50', 'owo equip 57 71 78', 'owo equip 101'],

	related: ['owo inv', 'owo weapon'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['animals'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: function (p) {
		let msg = p.msg,
			args = p.args;

		if (!p.global.isInt(args[0]) || args[0] > 130) {
			// arbitrary number higher than inventory ids
			// pass over to weapon to handle with all args intact
			weapon.execute(p);
			return;
		}
		let itemList = [];
		for (let i = 0; i < args.length; i++) {
			let item = shopUtil.getItem([args[i]]);
			if (typeof item === 'string' || item instanceof String) {
				p.send('**🚫 | ' + msg.author.username + '**, ' + item, 3000);
				return;
			} else if (!item) {
				p.errorMsg(`, I could not find item ${args[i]}`, 3000);
				return;
			} else if (i > 0 && item.name != 'gem') {
				p.errorMsg(', you can only use multiple gems at one time!', 3000);
				return;
			}
			itemList.push(item);
		}
		if (itemList.length === 0) {
			p.errorMsg(', please provide an id of an item to use!', 3000);
			return;
		}

		if (itemList[0].name == 'gem') {
			gemUtil.use(
				p,
				itemList.map((gem) => gem.id)
			);
			return;
		}
		// first item not a gem, fall back to original logic (ignore other ids provided)
		let item = itemList[0];

		if (item.name == 'item') {
			itemUtil.use(item.id, p);
		} else if (item.name == 'lootbox') {
			p.args = [];
			if (item.id == 49) p.args.push('f');
			lootbox.execute(p);
		} else if (item.name == 'crate') {
			p.args = [];
			crate.execute(p);
		} else if (item.name == 'weapon') {
			p.args = [p.args[0]]; // cut off any other junk
			weapon.execute(p);
		} else {
			p.errorMsg(', Could not find that item', 3000);
		}
	},
});
