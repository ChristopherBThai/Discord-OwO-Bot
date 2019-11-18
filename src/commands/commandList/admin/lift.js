/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["lift"],

	admin:true,
	mod:true,
	dm:true,

	execute: async function(p){
		let time;
		if(p.global.isInt(p.args[1])){
			time = parseInt(p.args[1]);
		}else{
			p.errorMsg(", Wrong time format");
			return;
		}

		if(!p.global.isUser("<@"+p.args[0]+">")){
			p.errorMsg(", Invalid user id");
			return;
		}
		let sql = "UPDATE IGNORE timeout SET penalty = "+time+" WHERE id = "+p.args[0]+";";
		let result = await p.query(sql);

		if(user = await p.sender.msgUser(p.args[0],"**🙇 |** Your penalty has been lifted by an admin! Sorry for the inconvenience!"))
			p.send("Penalty has been set to "+time+" for "+user.username);
		else if(guild = await p.fetch.getGuild(p.args[0]))
			p.send("Penalty has been set to "+time+" for guild: "+guild.name);
		else
			p.send("Failed to set penalty for that user");
	}

})
