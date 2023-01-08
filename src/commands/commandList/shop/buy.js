/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const ringUtil = require('../social/util/ringUtil.js');
const wallpaperUtil = require('../social/util/wallpaperUtil.js');
const dailyWeaponUtil = require('../battle/util/dailyWeaponUtil.js');

module.exports = new CommandInterface({
	alias: ['buy'],

	args: '{id}',

	desc: 'Buy an item from the shop!',

	example: ['owo buy 2'],

	related: ['owo shop'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['economy'],

	cooldown: 5000,

	execute: async function (p) {
		if (p.global.isInt(p.args[0])) {
			buy(p, parseInt(p.args[0]));
		} else {
			p.errorMsg(', invalid arguments! Please specify what item you want to buy!', 3000);
		}
	},
});

function buy(p, id) {
	if (id <= 0) {
		p.errorMsg(', that item does not exist! Please choose one from `owo shop`!', 3000);
	} else if (id <= 7) {
		ringUtil.buy(p, id);
	} else if (id <= 150) {
		dailyWeaponUtil.buy(p, id);
	} else if (id > 200) {
		wallpaperUtil.buy(p, id);
	} else {
		p.errorMsg(', that item does not exist! Please choose one from `owo shop`!', 3000);
	}
}
