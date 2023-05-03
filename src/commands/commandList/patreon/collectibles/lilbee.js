/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Lilbee extends Collectible {
	constructor() {
		super();

		this.key = 'lilbee';
		this.alias = ['lilbee'];
		this.emoji = '<:lilbee:1099451252955418735>';
		this.owners = ['635873165758824449', '423166705477353472'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.giveAmount = 1;
		this.description = `Created by Lil and Bee to celebrate 1000 days of Owo marriage!`;
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? Lil Bee?plural?**';
		this.brokeMsg = ', you do not have any Lil bees! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **1 Lil Bee** from **?giver?**';

		this.init();
	}
}

module.exports = new Lilbee();
