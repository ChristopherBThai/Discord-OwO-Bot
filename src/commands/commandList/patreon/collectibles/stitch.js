/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Stitch extends Collectible {
	constructor() {
		super();

		this.key = 'stitch';
		this.emoji = '<a:stitch:1288009365906915340>';
		this.owners = ['942100445105647686', '638420840765063178'];
		this.pluralName = 'Stitch';
		this.singleName = 'Stitches';
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Lilo says that "ohana means family, family means nobody gets left behind or forgotten". I hope this little alien starts to be part of your family now!`;
		this.displayMsg = '?emoji? **| ?user?**, you currently have ?count? ?emoji? ?pluralName?!';
		this.brokeMsg = ', you do not have any stiches! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, ?giver? has sent you 1 ?emoji? Stitch!';

		this.init();
	}
}

module.exports = new Stitch();
