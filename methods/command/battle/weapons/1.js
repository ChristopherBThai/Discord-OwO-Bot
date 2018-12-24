const WeaponInterface = require('../WeaponInterface.js');

/* Deals [100~150]% to a random opponent */
const min=[100],max=[150];

module.exports = new WeaponInterface({

	id:1,
	name:"Scuttler's Debugging Sword",
	desc:"Used by Scuttler to debug stuff",
	emoji:"<:csword:523707188674560010>",

	statDesc:"Deals ?% weapon damage to a random opponent!",

	passives:[1],
	passiveCount:1,
	qualityList:[[100,150]],

	init:function(){
		let passive = this.randomPassives();
		let qualities = this.randomQualities();
		return this.clone(passive,qualities);
	}

});
