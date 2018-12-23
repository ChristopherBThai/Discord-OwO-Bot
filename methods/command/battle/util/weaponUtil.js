const requireDir = require('require-dir');
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

exports.getItems = async function(p){
	var sql = `SELECT wid,count(uwid) AS count FROM user_weapon WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) GROUP BY wid`;
	var result = await p.query(sql);
	var items = {};
	for(var i = 0;i<result.length;i++){
		var key = result[i].wid;
		items[key] = {id:(key+100),count:result[i].count,emoji:weapons[key].emoji};
	}
	return items;
}

exports.parseWeapon(query){
}

exports.displayWeapons(p){
}

exports.describe(p,uwid){
}

exports.equip(p,uwid){
}
