const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["send"],

	admin:true,
	dm:true,

	execute: function(p){
		var global=p.global;con=p.con,args=p.args;
		var amount = 0;
		var id = 0;
		if(global.isInt(args[0])&&global.isInt(args[1])){
			amount = parseInt(args[1]);
			id = parseInt(args[0]);
		}else{
			p.send("Wrong args");
			return;
		}
		var sql = "UPDATE cowoncy SET money = money + "+amount+" WHERE id IN (SELECT sender FROM feedback WHERE id = "+id+");SELECT sender FROM feedback WHERE id = "+id+";";
		con.query(sql,async function(err,rows,fields){
			if(err){console.error(err);return;}
			if(!(rows[1][0]))
				p.send("Invalid feedback ID");
			else if(user = await sender.msgUser(String(rows[1][0].sender),"**💎 |** You have received __"+amount+"__ cowoncy!"))
				p.send("You sent "+amount+" cowoncy to "+user.username);
			else
				p.send("Could not find that user");
		});
	}

})
