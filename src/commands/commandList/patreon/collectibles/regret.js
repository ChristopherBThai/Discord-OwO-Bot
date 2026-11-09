/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Regret extends Collectible {
	constructor() {
		super();

		this.key = 'regret';
		this.emoji = '<a:regret:1288001896346419230>';
		this.owners = ['486604819545587723'];
		this.pluralName = 'regret';
		this.singleName = 'regrets';
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = '\n\n\n"same fears, same dreams"';
		this.displayMsg = '?emoji? **| ?user?**, you have collected ?count? ?pluralName? ?emoji?';
		this.brokeMsg = ', you do not have any regrets! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have acquired one regret';

		this.init();
	}
}

module.exports = new Regret();
