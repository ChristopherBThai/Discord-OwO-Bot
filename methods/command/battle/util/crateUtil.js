const requireDir = require('require-dir');
const ranks = {"c":"Common","u":"Uncommon","r":"Rare","e":"Epic","m":"Mythical","l":"Legendary","f":"Fabled"};
const WeaponInterface = require('../WeaponInterface.js');

/* Initialize all the weapons */
const weaponsDir = requireDir('../weapons');
var weapons = {};
for(var key in weaponsDir){
	if(weaponsDir[key] instanceof WeaponInterface){
		let weapon = weaponsDir[key];
		if(!weapon.disabled)
			weapons[weapon.id] = weapon;
	}
}

exports.getRandomWeapon = function(id){
	/* Grab a random weapon */
	let keys = Object.keys(weapons);
	let random = keys[Math.floor(Math.random()*keys.length)];
	let weapon = weapons[random];

	/* Initialize random stats */
	weapon = weapon.init();

	return weapon;
}


