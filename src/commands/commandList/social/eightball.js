/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

var eightballCount = 55;

module.exports = new CommandInterface({

	alias:["eightball","8b","ask"],

	args:"{question}",

	desc:"Ask a question and get an answer!",

	example:["owo 8b Am I cute?"],

	related:[],

	permissions:["SEND_MESSAGES"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		if(p.args.length==0)
			return;
		var id = Math.ceil(Math.random()*eightballCount);
		var sql = "SELECT answer FROM eightball WHERE id = "+id+";";
		p.con.query(sql,function(err,rows,field){
			if(err){console.error(err);return;}
			var question = p.args.join(" ");

			p.send("**🎱 | "+p.msg.author.username+" asked:**  "+question+"\n**<:blank:427371936482328596> | Answer:**  "+rows[0].answer);
		});
	}

})
