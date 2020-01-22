/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const shopUtil = require('./util/shopUtil.js');
const lootbox = require('../zoo/lootbox.js');
const gemUtil = require('../zoo/gemUtil.js');
const weapon = require('../battle/weapon.js');
const crate = require('../battle/crate.js');

module.exports = new CommandInterface({

	alias:["equip","use"],

	args:"{id}",

	desc:"Use an item from your inventory!",

	example:["owo equip 2"],

	related:["owo inv","owo weapon"],

	permissions:["sendMessages","embedLinks","attachFiles"],

	cooldown:5000,
	half:80,
	six:500,

	execute: function(p){
		let con=p.con,msg=p.msg,args=p.args;
		let item = shopUtil.getItem(args);
		if(typeof item === 'string' || item instanceof String){
			p.send("**🚫 | "+msg.author.username+"**, "+item,3000);
			return;
		}else if(!item){
			p.errorMsg(", I could not find that item",3000);
			return;
		}

		if(item.name=="lootbox"){
			p.args = [];
			lootbox.execute(p);
		}else if(item.name=="gem"){
			gemUtil.use(p,item.id);
		}else if(item.name=="crate"){
			p.args = [];
			crate.execute(p);
		}else if(item.name=="weapon"){
			weapon.execute(p);
		}else{
			p.errorMsg(", Could not find that item",3000);
		}
	}

})
