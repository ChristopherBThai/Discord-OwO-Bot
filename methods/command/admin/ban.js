const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["ban"],

	admin:true,
	mod:true,
	dm:true,

	execute: function(p){
		var global=p.global,con=p.con,args=p.args,msg=p.msg;
		var time;
		if(global.isInt(args[1])){
			time = parseInt(args[1]);
		}else{
			p.send("Wrong time format");
			return;
		}

		if(!global.isUser("<@"+args[0]+">")){
			p.send("Invalid user id");
			return;
		}

		var reason = args.slice(2).join(" ");
		if(reason&&reason!="")
			reason = "\n**<:blank:427371936482328596> | Reason:** "+reason;

		var sql = "INSERT INTO timeout (id,time,count,penalty) VALUES ("+args[0]+",NOW(),1,"+time+") ON DUPLICATE KEY UPDATE time = NOW(),count=count+1,penalty = "+time+";";
		con.query(sql,async function(err,rows,fields){
			if(err) throw err;
			if(user = await sender.msgUser(args[0],"**☠ |** You have been banned for "+time+" hours!"+reason))
				p.send("**☠ |** Penalty has been set to "+time+" for "+user.username+reason);
			else if(guild = await p.global.getGuildName(args[0]))
				p.send("**☠ |** Penalty has been set to "+time+" for guild: "+guild);
			else
				p.send("Failed to send a message to user|guild");
		});
	}

})
