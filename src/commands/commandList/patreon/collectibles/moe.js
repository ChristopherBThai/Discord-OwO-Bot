/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Moe extends Collectible {
	constructor() {
		super();

		this.key = 'moe';
		this.emoji = '<:moe:1098851501293707306>';
		this.owners = ['384202884553768961'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.giveAmount = 2;
		this.description = `Moses Harry Horwitz, better known by his stage name Moe Howard, was an American comedian and actor.\nHe is best known as the leader of the Three Stooges.\nHe loved to read, as his older brother Jack recalled: "I had many Horatio Alger books, and it was Moe's greatest pleasure to read them.\nThis helped him in his acting career; he could memorize his lines quickly and easily.\n(Combine with shemp, larry, and curly to make a 3stooges.  See the curly help for more info.)`;
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? Moe?plural?**';
		this.brokeMsg = ', you do not have any Moes! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **2 Moes** from **?giver?**';

		this.init();
	}
}

module.exports = new Moe();
