const WeaponInterface = require('../WeaponInterface.js');

/* Deals [100~150]% to a random opponent */

module.exports = class BasicSword extends WeaponInterface{


	init(){
		this.id = 1;
		this.name = "Basic Sword";
		this.basicDesc = "A basic sword.";
		this.emoji = "<:csword:523707188674560010>";
		this.statDesc = "Deals ?% weapon damage to a random opponent!";
		this.availablePassives = [1];
		this.passiveCount = 1;
		this.qualityList = [[100,150]];
	}
}
