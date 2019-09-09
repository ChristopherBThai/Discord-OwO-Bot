/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["cowoncy","money","currency","cash","credit","balance"],

	args:"",

	desc:"Check your cowoncy balance! You can earn more cowoncy by saying owo, dailies, and voting!",

	example:[],

	related:["owo give","owo daily","owo vote","owo my money"],

	permissions:["SEND_MESSAGES"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		var msg = p.msg;
		var sql = "SELECT * FROM cowoncy WHERE id = "+msg.author.id+";";

		p.con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			if(rows[0]==undefined)
				p.send("**<:cowoncy:416043450337853441> | "+msg.author.username+"**, you currently have **__0__ cowoncy!**");
			else
				p.send("**<:cowoncy:416043450337853441> | "+msg.author.username+"**, you currently have **__"+(p.global.toFancyNum(rows[0].money))+"__ cowoncy!**");
		});
	}

})
