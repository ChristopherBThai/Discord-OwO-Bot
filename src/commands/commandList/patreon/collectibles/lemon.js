/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Lemon extends Collectible {
	constructor() {
		super();

		this.key = 'lemon';
		this.alias = ['lemonade', 'lmn'];
		this.emoji = '<:lemon:1120968824137715762>';
		this.owners = ['460987842961866762'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `When life gives you lemons, ill give you lemon-aid.\nLemon tell ya, the zest chance to get lemons is through quest help.\nOwo lemon squeeze to make your refreshing lemonade.`;
		this.displayMsg =
			'?emoji? **|** ?user?, you have hand picked ?count? ?emoji? lemons <:lemonslice:1120968825089831002>' +
			"\n?mergeEmoji? **|** you've made ?mergeCount? sweet lemonades ?mergeEmoji? <:lemonslice:1120968825089831002>";
		this.brokeMsg = ', you do not have any Lemons! >:c';
		this.giveMsg = '?emoji? **|** You got a sour lemon ?emoji? zesty. ';

		this.hasManualMerge = true;
		this.manualMergeData = 'lemon_lemonade';
		this.manualMergeCommands = ['squeeze'];
		this.mergeNeeded = 2;
		this.mergeEmoji = '<:lemonade:1120968826570428427>';
		this.mergeMsg =
			"?mergeEmoji? **|** Squeeze of the day, <:lemonslice:1120968825089831002> you've made lemonade ?mergeEmoji?";

		this.init();
	}
}

module.exports = new Lemon();
