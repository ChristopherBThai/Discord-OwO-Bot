/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Shemp extends Collectible {
	constructor() {
		super();

		this.key = 'shemp';
		this.emoji = '<:shemp:1098851503499903078>';
		this.owners = ['384202884553768961'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.giveAmount = 2;
		this.description = `Samuel Horwitz, better known by his stage name Shemp Howard, was an American comedian and actor.  He was called "Shemp" because "Sam" came out that way in his mother's thick Litvak accent.\nHe is best known as the third Stooge in the Three Stooges, a role he played when the act began in the early 1920s, and again in 1946 to replace his brother Curly as the third Stooge after Curly's illness.\n(Combine with moe, larry, and curly to make a 3stooges.  See the curly help for more info.)`;
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? Shemp?plural?**';
		this.brokeMsg = ', you do not have any Shemps! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **2 Shemps** from **?giver?**';

		this.init();
	}
}

module.exports = new Shemp();
