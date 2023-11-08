/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Magoo extends Collectible {
	constructor() {
		super();

		this.key = 'magoo';
		this.emoji = '<:magoo:1171388723666108487>';
		this.owners = ['384202884553768961', '778204442411008021'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description =
			'Mr. Magoo is a fictional cartoon character voiced by Jim Backus.\nMr. Magoo is a wealthy elderly retiree who gets into comical situations as a result of his extreme near-sightedness, compounded by his stubborn refusal to admit the problem.';
		this.displayMsg = '?emoji? **| ?user?**, you currently have ?count? Magoo?plural?!';
		this.brokeMsg = ', you do not have any Magoos! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, ?giver? gave you 1 Magoo!';

		this.init();
	}
}

module.exports = new Magoo();
