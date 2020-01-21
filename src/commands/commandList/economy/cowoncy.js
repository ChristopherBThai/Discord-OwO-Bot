/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["cowoncy","money","currency","cash","credit","balance"],

	args:"",

	desc:"Check your cowoncy balance! You can earn more cowoncy by saying owo, dailies, and voting!",

	example:[],

	related:["owo give","owo daily","owo vote","owo my money"],

	permissions:["sendMessages"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		let sql = "SELECT money FROM cowoncy WHERE id = "+p.msg.author.id+";";

		let result = await p.query(sql);
		if(!result[0])
			p.replyMsg("<:cowoncy:416043450337853441>",", you currently have **__0__ cowoncy!**");
		else
			p.replyMsg("<:cowoncy:416043450337853441>",", you currently have **__"+(p.global.toFancyNum(result[0].money))+"__ cowoncy!**");
	}

})
