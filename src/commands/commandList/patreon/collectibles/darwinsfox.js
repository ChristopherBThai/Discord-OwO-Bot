/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class DarwinsFox extends Collectible {
	constructor() {
		super();

		this.key = 'darwinsfox';
		this.emoji = '<:fox:1079718256748793856>';
		this.owners = ['384202884553768961'];
		this.pluralName = 'Foxes';
		this.singleName = 'Fox';
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description =
			"Darwin's Fox (Lycalpoex fulvipes), also known as Zorro Chilote, is an endangered canid.  It is not a true fox." +
			'It was first discovered by the naturalist Charles Darwin in 1834.' +
			'There are two populations of Darwin’s fox. The location of the first population is in protected areas on an island off the coast of Chile,  with an estimated 227 individuals on the mainland and 412 on Chiloé Island.';
		this.displayMsg = "?emoji? **| ?user?**, you currently have ?count? Darwin's ?pluralName?!";
		this.brokeMsg = ", you do not have any Darwin's Foxes! >:c";
		this.giveMsg = "?emoji? **| ?receiver?**, ?giver? gave you 1 Darwin's Fox!";

		this.init();
	}
}

module.exports = new DarwinsFox();
