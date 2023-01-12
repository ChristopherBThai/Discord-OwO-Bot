/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const shopUtil = require('./util/shopUtil.js');
const lootboxUtil = require('../zoo/lootboxUtil.js');
const weaponUtil = require('../battle/util/weaponUtil.js');
const gemUtil = require('../zoo/gemUtil.js');
const itemUtil = require('./util/itemUtil.js');

module.exports = new CommandInterface({
	alias: ['describe', 'desc'],

	args: '',

	desc: 'Describe an item from the shop!',

	example: ['owo describe 2'],

	related: ['owo shop', 'owo inv', 'owo equip'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['animals'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: function (p) {
		let item = shopUtil.getItem(p.args);

		if (typeof item === 'string' || item instanceof String) {
			p.errorMsg(', ' + item, 3000);
			return;
		}

		if (!item) {
			p.errorMsg(', invalid id!', 3000);
		} else if (item.name == 'item') {
			itemUtil.desc(p, item.id);
		} else if (item.name == 'lootbox') {
			lootboxUtil.desc(p, item.id);
		} else if (item.name == 'gem') {
			gemUtil.desc(p, item.id);
		} else {
			weaponUtil.describe(p, item.id);
		}
	},
});
