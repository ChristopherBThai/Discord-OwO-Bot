const requireDir = require('require-dir');
const WeaponInterface = require('../WeaponInterface.js');

const weaponEmoji = "";

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

exports.parseWeapon = function(data){
	/* Parse stats */
	data.stat = data.stat.split(",");
	for(var i=0;i<data.stat.length;i++)
		data.stat[i] = parseInt(data.stat[i]);

	/* Grab all passives */
	for(var i=0;i<data.passives.length;i++){
		let stats = data.passives[i].stat.split(",");
		for(var j=0;j<stats.length;j++)
			stats[j] = parseInt(stats[j]);
		data.passives[i] = WeaponInterface.passives[data.passives[i].id].clone(stats);
	}

	/* Convert data to actual weapon data */
	data = {...data,...weapons[data.id].clone(data.passives,data.stat)};

	return data;
}

exports.parseWeaponQuery = function(query){
	/* Group weapons by uwid and add their respective passives */
	let weapons = {};
	for(var i=0;i<query.length;i++){
		var key = "_"+query[i].uwid;
		if(!(key in weapons)){
			weapons[key] = {
				uwid:query[i].uwid,
				pid:query[i].pid,
				id:query[i].wid,
				stat:query[i].stat,
				animal:{
					name:query[i].name,
					nickname:query[i].nickname
				},
				passives:[]
			};
		}
		if(query[i].wpid)
			weapons[key].passives.push({
				id:query[i].wpid,
				pcount:query[i].pcount,
				stat:query[i].pstat
			});
	}
	return weapons;
}

exports.display = async function(p){
	/* Query all weapons */
	let sql = `SELECT a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal c ON a.pid = c.pid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) ORDER BY a.uwid DESC LIMIT 25;`;
	var result = await p.query(sql);

	/* Parse all weapons */
	let weapons = this.parseWeaponQuery(result);

	/* Parse actual weapon data for each weapon */
	let desc = "Description: `owo weapon {weaponID}`\nEquip: `owo weapon {weaponID} {animal}`\nUnequip: `owo weapon unequip {weaponID}`\n";
	for(var key in weapons){
		let weapon = this.parseWeapon(weapons[key]);
		let emoji = `${weapon.rank.emoji}${weapon.emoji}`;
		for(var i=0;i<weapon.passives.length;i++){
			let passive = weapon.passives[i];
			emoji += passive.emoji;
		}
		desc += `\n\`${weapons[key].uwid}\` ${emoji} **${weapon.name}** | Quality: ${weapon.avgQuality}%`;
		if(weapons[key].animal.name){
			let animal = p.global.validAnimal(weapons[key].animal.name);
			desc += ` | ${(animal.uni)?animal.uni:animal.value} ${(weapons[key].animal.nickname)?weapons[key].animal.nickname:""}`;
		}
	}

	/* Construct msg */
	const embed = {
		"author":{
			"name":p.msg.author.username+"'s weapons",
			"icon_url":p.msg.author.avatarURL
		},
		"description":desc,
		"color": p.config.embed_color,
	};

	return p.send({embed});
}

exports.describe = async function(p,uwid){
	/* sql query */
	let sql = `SELECT a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid WHERE a.uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	var result = await p.query(sql);

	/* Check if valid */
	if(!result[0]){
		p.errorMsg(", I could not find a weapon with that unique weapon id! Please use `owo weapon`");
		return;
	}

	/* parse weapon to get info */
	var weapon = this.parseWeaponQuery(result);
	weapon = weapon[Object.keys(weapon)[0]];
	weapon = this.parseWeapon(weapon);
	
	/* Parse image url */
	let url = weapon.emoji;
	if(temp = url.match(/:[0-9]+>/)){
		temp = "https://cdn.discordapp.com/emojis/"+temp[0].match(/[0-9]+/)[0]+".";
		if(url.match(/<a:/))
			temp += "gif";
		else
			temp += "png";
		url = temp;
	}

	/* Make description */
	let desc = `**Name:** ${weapon.name}\n`;
	desc += `**Quality:** ${weapon.rank.emoji} ${weapon.avgQuality}%`;
	desc += `\n**Description:** ${weapon.desc}\n`;
	if(weapon.passives.length<=0)
		desc += `\n**Passives:** None`;
	for(var i=0;i<weapon.passives.length;i++){
		let passive = weapon.passives[i];
		desc += `\n${passive.emoji} **${passive.name}** - ${passive.desc}`;
	}

	/* Construct embed */
	const embed ={
		"author":{
			"name":p.msg.author.username+"'s "+weapon.name,
			"icon_url":p.msg.author.avatarURL
		},
		"color":p.config.embed_color,
		"thumbnail":{
			"url":url
		},
		"description":desc
	};
	p.send({embed});
}

exports.equip = async function(p,uwid,pet){
	/* Construct sql depending in pet parameter */
	if(p.global.isInt(pet)){
		var pid = `(SELECT pid FROM user a LEFT JOIN pet_team b ON a.uid = b.uid LEFT JOIN pet_team_animal c ON b.pgid = c.pgid WHERE a.id = ${p.msg.author.id} AND pos = ${pet})`
	}else{
		var pid = `(SELECT pid FROM animal WHERE name = '${pet.value}' AND id = ${p.msg.author.id})`;
	}
	let sql = `UPDATE IGNORE user_weapon SET pid = NULL WHERE 
			uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND
			pid = ${pid} AND
			(SELECT * FROM (SELECT uwid FROM user_weapon WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND uwid = ${uwid}) a) IS NOT NULL;`
	sql += `UPDATE IGNORE user_weapon SET
			pid = ${pid}
		WHERE
			uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND
			uwid = ${uwid} AND
			${pid} IS NOT NULL;`;
	sql += `SELECT wid,name,nickname FROM user_weapon a LEFT JOIN animal b ON a.pid = b.pid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND uwid = ${uwid};`;
	let result = await p.query(sql);

	/* Success */
	if(result[1].changedRows>0){
		let animal = p.global.validAnimal(result[2][0].name);
		let nickname = result[2][0].nickname;
		let weapon = weapons[result[2][0].wid];
		p.replyMsg(weaponEmoji,`, ${(animal.uni)?animal.uni:animal.value} **${(nickname)?nickname:animal.name}** is now wielding ${weapon.emoji} **${weapon.name}**!`);

	/* Already equipped */
	}else if(result[1].affectedRows>0){
		let animal = p.global.validAnimal(result[2][0].name);
		let nickname = result[2][0].nickname;
		let weapon = weapons[result[2][0].wid];
		p.replyMsg(weaponEmoji,`, ${(animal.uni)?animal.uni:animal.value} **${(nickname)?nickname:animal.name}** is already wielding ${weapon.emoji} **${weapon.name}**!`);

	/* A Failure (like me!) */
	}else{
		p.errorMsg(", could not find that weapon or animal! The correct command is `owo weapon {weaponID} {animal}`");
	}
}

exports.unequip = async function(p,uwid){
	let sql = `SELECT wid,name,nickname FROM user_weapon a LEFT JOIN animal b ON a.pid = b.pid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND uwid = ${uwid};`;
	sql += `UPDATE IGNORE user_weapon SET pid = NULL WHERE uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	let result =  await p.query(sql);

	/* Success */
	if(result[1].changedRows>0){
		let animal = p.global.validAnimal(result[0][0].name);
		let nickname = result[0][0].nickname;
		let weapon = weapons[result[0][0].wid];
		p.replyMsg(weaponEmoji,`, Unequipped ${weapon.emoji} **${weapon.name}** from ${(animal.uni)?animal.uni:animal.value} **${(nickname)?nickname:animal.name}**`);


	/* No body using weapon */
	}else if(result[1].affectedRows>0){
		let weapon = weapons[result[0][0].wid];
		p.replyMsg(weaponEmoji,`, No animal is using ${weapon.emoji} **${weapon.name}**`);

	/* Invalid */
	}else{
		p.errorMsg(`, Could not find a weapon with that id!`);
	}
}
