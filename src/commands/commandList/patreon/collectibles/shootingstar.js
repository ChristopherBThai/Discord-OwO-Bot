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
		this.alias = ['shootingstar', 'ss'];
		this.emoji = '<a:shootingstar:1080027054688440350>';
		this.owners = [
			'370709798020448257',
			'412812867348463636',
			'692146302284202134',
			'417214768970203136',
		];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Give out a shooting star! Merge 2 to create a wish.`;
		this.displayMsg =
			'**<a:purplestar:1080027292102823966><a:pinkstars:1080026894436667402> Make a wish! <a:purplestar:1080027292102823966><a:pinkstar:1080027395295285368>' +
			'\n✧<:dash:1080027541466783825><:dash:1080027541466783825><:dash:1080027541466783825><:dash:1080027541466783825><:dash:1080027541466783825><:dash:1080027541466783825><:dash:1080027541466783825>✧' +
			'\n?emoji? Shooting stars: ?count?' +
			'\n?mergeEmoji? Wishes: ?mergeCount?**';
		this.brokeMsg = ', you do not have any Shooting Stars! >:c';
		this.giveMsg =
			'<:starfrens:1067095520985751563> ooh, your **wish** <a:glitter:1080026999327834122> came true! the universe has listened to your dream, you got **1 shooting star**! ?emoji?';

		this.failChance = 0.8;
		this.failMsg =
			'**<:starfrens:1067095520985751563> Sadly...maybe a dream is just meant to be a dream <a:pinkstars:1080026894436667402>**';

		this.hasManualMerge = true;
		this.manualMergeData = 'shootingstar_wish';
		this.manualMergeCommands = ['unite'];
		this.mergeNeeded = 2;
		this.mergeEmoji = '<a:pinkheart:1080027639152119818>';
		this.mergeMsg =
			'<a:shootingstar:1080027054688440350> 2 **shooting stars** have turned into 1 **wish**. <a:pinkheart:1080027639152119818>Dream on, my dear friend, and your wishes will be fulfilled <a:moon:1080027213388333107>';

		this.init();
	}

	async checkFailed(p, user) {
		if (typeof this.failChance !== 'number' || this.failChance <= 0) return false;
		if (!this.owners.includes(user.id) && Math.random() <= this.failChance) {
			const msg = await this.getFailMsg(p, user);
			p.send(msg);
			return true;
		}
		return false;
	}
}

module.exports = new ShootingStar();
