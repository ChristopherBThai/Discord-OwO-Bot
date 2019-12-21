/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const weaponUtil = require('./weaponUtil.js');
const passiveArray = ["passive","p"];
const statArray = ["stat","stats","s"];

exports.reroll = async function(p){
	/* Parse reroll type and weapon id */
	let rrType, uwid;
	if(passiveArray.includes(p.args[1])){
		rrType = "p";
		uwid = p.args[2];
	}else if(passiveArray.includes(p.args[2])){
		rrType = "p";
		uwid = p.args[1];
	}else if(["stat","stats","s"].includes(p.args[1])){
		rrType = "s";
		uwid = p.args[2];
	}else if(["stat","stats","s"].includes(p.args[2])){
		rrType = "s";
		uwid = p.args[1];
	}else{
		await p.errorMsg(", invalid syntax! Please use the format: `owo w rr {uwid} [passive|stat]`!",5000);
		return;
	}

	/* Convert uwid into decimal */
	uwid = weaponUtil.expandUWID(uwid);
	if(!uwid){
		await p.errorMsg(", invalid syntax! Please use the format: `owo w rr {uwid} [passive|stat]`!",5000);
		return;
	}

	/* Grab weapon from database */
	let sql = `SELECT user.uid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user INNER JOIN user_weapon a ON user.uid = a.uid LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid WHERE a.uwid = ${uwid} AND user.id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	/* Check if valid */
	if(!result[0]){
		p.errorMsg(", I could not find a weapon with that unique weapon id!",4000);
		return;
	}

	/* Parse weapon to get info */
	let weapon = weaponUtil.parseWeaponQuery(result);
	weapon = weapon[Object.keys(weapon)[0]];
	weapon = weaponUtil.parseWeapon(weapon);

	/* If no weapon */
	if(!weapon){
		p.errorMsg(", I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!",4000);
		return;
	}

	if(rrType=="p") rerollPassive(p,weapon);
	else if(rrType=="s") rerollStats(p,weapon);
	else p.errorMsg(", It seems like javascript broke.. This should never happen!",3000);
}

async function rerollStats(p,weapon){
	p.send("```json\n"+JSON.stringify(weapon,null,2)+"\n```",null,null,{split:{prepend:'```md\n',append:'```'}});
	weapon.rerollStats();
	p.send("```json\n"+JSON.stringify(weapon,null,2)+"\n```",null,null,{split:{prepend:'```md\n',append:'```'}});
}

async function rerollPassive(p,weapon){
}
