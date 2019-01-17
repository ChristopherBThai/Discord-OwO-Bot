const WeaponInterface = require('../WeaponInterface.js');

module.exports = class Bow extends WeaponInterface{

	init(){
		this.id = 3;
		this.name = "Bow";
		this.basicDesc = "An accurate bow that will deal alot of damage to a single opponent";
		this.emojis = ["<:cbow:535283611260420096>","<:ubow:535283613198188594>","<:rbow:535283613374349316>","<:ebow:535283614334844937>","<:mbow:535283613802168323>","<:lbow:535283613391126529>","<:fbow:535283614099832872>"]
		this.statDesc = "Deals ? magic damage to a random opponents";
		this.availablePassives = [1,2,3,4,5,6];
		this.passiveCount = 1;
		this.qualityList = [[90,150]];
	}
}
