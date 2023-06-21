/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Koi extends Collectible {
	constructor() {
		super();

		this.key = 'koi';
		this.alias = ['koi', 'lotus'];
		this.emoji = '<:koi1:1120973305420197888>';
		this.owners = ['460987842961866762', '384202884553768961'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Happy OwO Anniversary and many more to come.\nOur friendship is beautiful and we balance like the Yin & Yang just like the two koi fish representing the duality of life.`;
		this.displayMsg =
			'<:lotus:1120973306682687509> **| ?user?**, currently have ?count? ?emoji? Koi Yin fish & ?mergeCount? ?mergeEmoji? Koi Yang swimming in your lotus pond. <:lotus:1120973306682687509>';
		this.brokeMsg = ', you do not have any Kois! >:c';
		this.giveMsg =
			'<:lotus:1120973306682687509> **| ?receiver?**, your lotus pond has been filled with 1 ?emoji? Koi fish.';

		this.hasManualMerge = true;
		this.manualMergeData = 'koi_koi';
		this.manualMergeCommands = ['merge'];
		this.mergeNeeded = 4;
		this.mergeEmoji = '<:koi2:1120973303012667403>';
		this.mergeMsg =
			'<:lotus:1120973306682687509> **|** You have summoned the special ?mergeEmoji? Koi Yang fish ?mergeEmoji?';

		this.init();
	}
}

module.exports = new Koi();
