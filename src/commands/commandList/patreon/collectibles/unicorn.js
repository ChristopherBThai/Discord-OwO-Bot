/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Unicorn extends Collectible {
	constructor() {
		super();

		this.key = 'unicorn';
		this.emoji = '<a:unicorn:1056445018598027305>';
		this.owners = ['384202884553768961', '778204442411008021'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description =
			'The unicorn is a legendary creature with a single large, pointed, spiraling horn projecting from its forehead.' +
			'\nThe unicorn has captured the minds and hearts of many because of the unique properties it supposedly possessed.  The unicorn is greatly desired but difficult or impossible to find.' +
			'\n"The Unicorn" song was made very popular by the Irish Rovers in 1968.' +
			"\nAccording to the song, the unicorn was not a fantasy, but a creature that missed the boat by not boarding Noah's Ark in time to be saved from the Great Flood." +
			'\nNOTE:  The Okapi is a real animal once known as the "African unicorn".';
		this.displayMsg = '?emoji? **| ?user?**, you currently have ?count? Unicorn?plural?!';
		this.brokeMsg = ', you do not have any Unicorns! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, ?giver? gave you 1 Unicorn!';

		this.init();
	}
}

module.exports = new Unicorn();
