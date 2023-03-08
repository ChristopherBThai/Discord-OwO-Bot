/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Snake extends Collectible {
	constructor() {
		super();

		this.key = 'snake';
		this.emoji = '<:_snake:889369004660109363>';
		this.owners = ['380822909813391360', '384202884553768961'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.giveAmount = 2;
		this.description = 'Give snakes to someone!';
		this.displayMsg = '?emoji? **| ?user?**, you currently have ?count? snake?plural?!';
		this.brokeMsg = ', you do not have any snakes! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, ?giver? gave you 2 snakes!';

		this.init();
	}
}

module.exports = new Snake();
