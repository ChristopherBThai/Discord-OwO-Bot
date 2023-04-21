/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Larry extends Collectible {
	constructor() {
		super();

		this.key = 'larry';
		this.emoji = '<:larry:1098851505525751959>';
		this.owners = ['384202884553768961'];
		this.fullControl = true;
		this.ownerOnly = false;
		this.giveAmount = 2;
		this.description = `Louis Feinberg, better known by his stage name Larry Fine, was an American comedian, actor, and musician.\nIn his early childhood, Fine's arm was accidentally burned with acid that his father used to test jewelry for its gold content.\nFine's parents later gave him violin lessons to help strengthen the damaged muscles in his forearm.  He became so proficient in it that his parents wanted to send him to a European music conservatory, but the plan was thwarted by the outbreak of World War I.\nTo further strengthen his damaged arm, Fine took up boxing in his teens, winning one professional bout.\n(Combine with moe, shemp, and curly to make a 3stooges.  See the curly help for more info.)\n`;
		this.pluralName = 'Larries';
		this.singleName = 'Larry';
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? ?pluralName?**';
		this.brokeMsg = ', you do not have any Larries! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **2 Larries** from **?giver?**';

		this.init();
	}
}

module.exports = new Larry();
