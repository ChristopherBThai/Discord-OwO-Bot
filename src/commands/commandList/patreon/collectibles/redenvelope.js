/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class RedEnvelope extends Collectible {
	constructor() {
		super();

		this.key = 'redenvelope';
		this.alias = ['hongbao', 'angpow'];
		this.emoji = '<a:red_envelope:1080076847053820014>';
		this.owners = ['605994815317999635'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Red envelope is small red and gold packets, containing money as a symbol of good luck.\n\nCollect 8 Red Envelopes to get a Gold!`;
		this.displayMsg =
			'?emoji? **| ?user?**, you currently have ?count? ?emoji? Red Envelope?plural? and ?mergeCount? ?mergeEmoji? Gold?plural?! Wishing you lots of luck!';
		this.brokeMsg = ', you do not have any Red Envelopes! >:c';
		this.giveMsg =
			'?emoji? **| ?receiver?**, you have received 1 ?emoji? Red Envelope from **?giver?**! Best of luck!';

		this.hasMerge = true;
		this.mergeNeeded = 8;
		this.mergeEmoji = '<:gold:1080076845124427806>';
		this.mergeMsg =
			'?giveMsg?\n?mergeEmoji? **|** Your eight red envelopes combined and turned into a Gold!';

		this.init();
	}
}

module.exports = new RedEnvelope();
