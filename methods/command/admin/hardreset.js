const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["hardreset"],

	admin:true,
	dm:true,

	execute: function(p){
		var global=p.global,con=p.con,args=p.args,msg=p.msg;
		var id;
		if(!global.isUser("<@"+args[0]+">")){
			p.send("Invalid user id");
			return;
		}else{
			id = args.shift();
		}
		var reason = args.join(" ");
		var sql = "DELETE FROM animal WHERE id = "+id+";";
		sql += "DELETE FROM animal_count WHERE id = "+id+";";
		sql += "DELETE FROM cowoncy WHERE id = "+id+";";
		sql += "DELETE FROM lottery WHERE id = "+id+";";
		sql += "DELETE FROM rep WHERE id = "+id+";";
		sql += "DELETE FROM user WHERE id = "+id+";";
		sql += "DELETE FROM vote WHERE id = "+id+";";
		con.query(sql,async function(err,rows,fields){
			if(err){ console.error(err); return;}
			if(user = await sender.msgUser(id,"**☠ |** You account has been reset.\n**Reason:** "+reason))
				p.send("**☠ |** "+user.username+"'s account has been reset");
			else
				p.send("Failed to find that user");
		});
	}

})

