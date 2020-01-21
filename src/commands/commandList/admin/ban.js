/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["ban"],

	admin:true,
	mod:true,
	dm:true,

	execute: async function(p){
		let global=p.global,con=p.con,args=p.args,msg=p.msg;
		let time;
		if(global.isInt(args[1])){
			time = parseInt(args[1]);
		}else{
			p.errorMsg(", wrong time format");
			return;
		}

		if(!global.isUser("<@"+args[0]+">")){
			p.errorMsg(", invalid user id");
			return;
		}

		let reason = args.slice(2).join(" ");
		if(reason&&reason!="")
			reason = "\n**<:blank:427371936482328596> | Reason:** "+reason;

		let sql = "INSERT INTO timeout (id,time,count,penalty) VALUES ("+args[0]+",NOW(),1,"+time+") ON DUPLICATE KEY UPDATE time = NOW(),count=count+1,penalty = "+time+";";
		let rows = await p.query(sql);

		if(user = await p.sender.msgUser(args[0],"**☠ |** You have been banned for "+time+" hours!"+reason))
			p.send("**☠ |** Penalty has been set to "+time+" for "+user.username+reason);
		else if(guild = await p.fetch.getGuild(args[0]))
			p.send("**☠ |** Penalty has been set to "+time+" for guild: "+guild.name);
		else
			p.send("Failed to send a message to user|guild");
	}

})
