/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const global = require("../../../utils/global.js");
const box = "<:box:427352600476647425>";
const tempGem = require("../../../data/gems.json");
const ranks = {"c":"Common","u":"Uncommon","r":"Rare","e":"Epic","m":"Mythical","l":"Legendary","f":"Fabled"};
var gems = {};
for (var key in tempGem.gems){
 	var temp = tempGem.gems[key];
	temp.key = key;
	if(!gems[temp.type]) gems[temp.type] = [];
	let rank = ranks[key[0]];
	if(!rank) throw "Missing rank type for gems";
	temp.rank = rank;
	gems[temp.type].push(temp);
}
var typeCount = Object.keys(gems).length;

exports.getItems = async function(p){
	var sql = `SELECT boxcount FROM lootbox WHERE id = ${p.msg.author.id} AND boxcount > 0;`;
	var result = await p.query(sql);
	if(!result[0]){return {}}
	return {box:{emoji:box,id:50,count:result[0].boxcount}};
}

function getRandomGem(){
	let rand = Math.trunc(Math.random()*(typeCount-1));
	let count = 0;
	let type = "Hunting";

	for (let key in gems){
		if(key=="Patreon"){
			count++;
			rand++;
		}else if(count==rand){
			type = key;
			count++;
		}else{
			count++;
		}
	}

	if(global.isInt(type))
		type = Object.keys(gems)[0];
	type = gems[type];

	rand = Math.random();
	let gem;
	let sum = 0
	for(let x in type){
		sum += type[x].chance;
		if(rand<sum){
			gem = type[x];
			rand = 100;
		}
	}
	let rank = ranks[gem.key[0]];
	return gem;

}

exports.getRandomGems = function(uid,count=1){

	let gemResult = {};
	for(let i=0;i<count;i++){
		let tempGem = getRandomGem();
		if(!gemResult[tempGem.id]) gemResult[tempGem.id] = {gem:tempGem,count:1};
		else gemResult[tempGem.id].count++;
	}

	let sql = `INSERT INTO user_gem (uid,gname,gcount) VALUES `;
	for(let i in gemResult){
		sql += `(${uid},'${gemResult[i].gem.key}',${gemResult[i].count}),`;
	}
	sql = `${sql.slice(0,-1)} ON DUPLICATE KEY UPDATE gcount = gcount + VALUES(gcount);`;

	return {gems:gemResult,sql};
}

exports.desc = function(p){
	var text = "**ID:** 50\nOpens a lootbox! Check how many you have in 'owo inv'!\nYou can get some more by hunting for animals. You can get a maximum of 3 lootboxes per day.\nUse `owo inv` to check your inventory\nUse 'owo use {id}` to use the item!";
	var embed = {
	"color": 4886754,
	"fields":[{
		"name":box+" Lootbox",
		"value":text
		}]
	};
	p.send({embed});
}
