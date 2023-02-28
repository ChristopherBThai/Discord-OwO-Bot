/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class ShootingStar extends Collectible {
	constructor() {
		super();

		this.key = 'shootingstar';
		this.emoji = '<a:shootingstar2:1067095593912119296>';
		this.owners = ['370709798020448257'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Give out a shooting star! Merge 2 to create a wish.`;
		this.displayMsg = '**<a:1_starpurple:898464431594422323><a:dp_star:1067095702041284608> Make a wish! <a:1_starpurple:898464431594422323><a:dp_star:1067095702041284608>'
				+ '\n✧<:LGA_dash1:1067375962909585478><:LGA_dash1:1067375962909585478><:LGA_dash1:1067375962909585478><:LGA_dash1:1067375962909585478><:LGA_dash1:1067375962909585478><:LGA_dash1:1067375962909585478><:LGA_dash1:1067375962909585478>✧'
				+ '\n?emoji? Shooting stars: ?count?'
				+ '\n?mergeEmoji? Wishes: ?mergeCount?**';
		this.brokeMsg = ', you do not have any Shooting Stars! >:c';
		this.giveMsg = '<:starfrens:1067095520985751563> ooh, your **wish** <a:21glitter:1067368203971481660> came true! the universe has listened to your dream, you got **1 shooting star**! ?emoji?';

		this.failChance = 0.8;
		this.failMsg = '**<:starfrens:1067095520985751563> Sadly...maybe a dream is just meant to be a dream <a:p_stars1:828388719848849450>**';

		this.hasManualMerge = true;
		this.manualMergeData = 'shootingstar_wish';
		this.manualMergeCommands = ['unite'];
		this.mergeNeeded = 2;
		this.mergeEmoji = '<a:angelWZsparkleheart:1067370628690231306>';
		this.mergeMsg = '<a:shootingstar2:1067095593912119296> 2 **shooting stars** have turned into 1 **wish**. <a:_sparkles3:1067369146456743948>Dream on, my dear friend, and your wishes will be fulfilled <a:YMb_MoonXPink:747305132596920401>';

		this.init();
	}
}

module.exports = new ShootingStar();
