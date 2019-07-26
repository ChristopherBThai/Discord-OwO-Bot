/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const charLen = 30;
const rings = require('../../../json/rings.json');

module.exports = new CommandInterface({

	alias:["shop","market"],

	args:"",

	desc:"Spend your cowoncy for some items!",

	example:[],

	related:["owo money"],

	cooldown:15000,

	execute: async function(p){
		let embed = getPage(p,1);
		embed.author.icon_url = p.msg.author.avatarURL();
		p.send({embed});	
	}
});

function getPage(p,i){
	switch(i){
		case 1:
			return {
				"description": "Purchase a ring to propose to someone!\nAll rings are the same. Different tiers are available to show off your love!\n- **`owo buy {id}`** to buy an item\n- **`owo sell {id}`** to sell an item for 75% of its original price\n"+('═'.repeat(charLen+2))+"\n"+getRings(p),
				"color": 4886754,
				"author": {
					"name": "OwO Shop: Rings",
				},
				"footer":{
					"text": "Page 1/1"
				}
			}
			break;
		default:
			return null;
	}
}

function getRings(p){
	let result = "";
	for(let i in rings){
		let ring = rings[i];
		let price = p.global.toShortNum(ring.price);
		let cLength = charLen-ring.name.length+(4-(""+price).length);
		if(cLength<0) cLength = 0;
		result += "`"+ring.id+"` "+ring.emoji+" **`"+ring.name+" `**`"+("-".repeat(cLength))+" "+price+"` <:cowoncy:416043450337853441>\n";
	}
	return result;
}
