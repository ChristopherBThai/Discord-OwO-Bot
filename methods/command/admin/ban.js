const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["ban"],

	admin:true,
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

		var sql = "INSERT INTO timeout (id,time,count,penalty) VALUES ("+args[0]+",NOW(),1,"+time+") ON DUPLICATE KEY UPDATE time = NOW(),count=count+1,penalty = penalty*2 + "+time+";";
		con.query(sql,async function(err,rows,fields){
			if(err) throw err;
			if(user = await sender.msgUser(args[0],"**☠ |** You have been banned for "+time+" hours!"))
				p.send("Penalty has been set to "+time+" for "+user.username);
			else
				p.send("Failed to set penalty for that user");
		});
	}

})
