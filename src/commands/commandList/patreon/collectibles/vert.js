/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Vert extends Collectible {
	constructor() {
		super();

		this.key = 'vert';
		this.emoji = '<:vert:1056448345251512360>';
		this.owners = ['963635559266390066'];
		this.fullControl = false;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = 'Send a vert to someone!';
		this.displayMsg = '?emoji? **| ?user?**, you currently have ?count? Vert?plural?!';
		this.brokeMsg = ', you do not have any Verts! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, ?giver? gave you 1 Vert!';

		this.init();
	}
}

module.exports = new Vert();
