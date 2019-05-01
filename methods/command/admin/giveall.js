/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["giveall"],

	admin:true,

	execute: function(p){
		var global=p.global,con=p.con,args=p.args,msg=p.msg;
		var amount = 0;
		if(global.isInt(args[0]))
			amount = parseInt(args[0]);
		else
			return;
		var users = global.getids(msg.guild.members);
		var sql = "UPDATE IGNORE cowoncy SET money = money + "+amount+" WHERE id IN ("+users+");";
		con.query(sql,function(err,rows,fields){
			if(err) throw err;
			p.send("**💎 |** "+msg.author.username+" gave @everyone "+amount+" cowoncy!!!");
		});
	}

})
