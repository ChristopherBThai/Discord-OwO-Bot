const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["banguild","guildban"],

	admin:true,
	mod:true,
	dm:true,

	execute: async function(p){
		var global=p.global,con=p.con,args=p.args,msg=p.msg;
		var time;
		if(global.isInt(args[1])){
			time = parseInt(args[1]);
		}else{
			p.send("Wrong time format");
			return;
		}

		if(!global.isInt(args[0])){
			p.send("Invalid guild id");
			return;
		}

		var guild = await p.global.getGuildName(args[0]);

		var sql = "INSERT INTO timeout (id,time,count,penalty) VALUES ("+args[0]+",NOW(),1,"+time+") ON DUPLICATE KEY UPDATE time = NOW(),count=count+1,penalty = "+time+";";
		con.query(sql,function(err,rows,fields){
			if(err) throw err;
			if(guild)
				p.send("**☠ |** Penalty has been set to "+time+" for the guild: "+guild);
			else
				p.send("**☠ |** Could not find that guild, but banned anyways");
		});
	}

})
