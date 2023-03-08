/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class PaintedDog extends Collectible {
	constructor() {
		super();

		this.key = 'painteddog';
		this.alias = ['painted-dog'];
		this.emoji = '<:painteddog:1056445016576372736>';
		this.owners = ['384202884553768961'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description =
			'African wild dog (Lycaon pictus), also called painted dog, and cape hunting dog.' +
			'\nAfrican wild dog is an endangered species, with estimates that only about 3,000 to 5,500 remain.' +
			'\nAn endangered species is a species that is very likely to become extinct in the near future.' +
			'\nIt is the largest wild canine in Africa.';
		this.displayMsg = '?emoji? **| ?user?**, you currently have ?count? Painted Dog?plural?!';
		this.brokeMsg = ', you do not have any painted dogs! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, ?giver? gave you 1 Painted Dog!';

		this.init();
	}
}

module.exports = new PaintedDog();
