/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Totoro extends Collectible {
	constructor() {
		super();

		this.key = 'totoro';
		this.emoji = '<:totoro:1288015785603760201>';
		this.owners = ['777641801212493826', '193140307326402562', '942100445105647686'];
		this.pluralName = 'Totoro';
		this.singleName = 'Totoros';
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `"Try Laughing. Then Whatever Scares You Will Go Away”.\nWe hope this Forest Spirit never lets you feel alone!`;
		this.displayMsg = '?emoji? **| ?user?**, you currently have ?count? ?emoji? ?pluralName?!';
		this.brokeMsg = ', you do not have any Totoros! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, ?giver? has sent you 1 ?emoji? Totoro!';

		this.init();
	}
}

module.exports = new Totoro();
