/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Fear extends Collectible {
	constructor() {
		super();

		this.key = 'fear';
		this.alias = ['nommy'];
		this.dataOverride = 'fear2';
		this.emoji = '<a:fear:978025301013594162>';
		this.owners = ['486604819545587723'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description =
			"What do you fear?\n\n fears can alarming, but we all overcome them... unless it's me noming you \n\nI'd nom you if I could\"";
		this.displayMsg = '?emoji? **| ?user?**, you have overcome ?count? fear?plural? ?emoji?';
		this.brokeMsg = ', you do not have any Fears! >:c';
		this.giveMsg =
			'?emoji? **| ?giver?** says thank you for all the kindness <a:nommy:978025301189750814>, *nom nom*, ?receiver? has been sent one fear.';

		this.init();
	}
}

module.exports = new Fear();
