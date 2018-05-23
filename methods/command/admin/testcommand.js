const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["testcommand"],

	admin:true,

	execute: async function(p){
		var global=p.global,con=p.con,args=p.args,msg=p.msg;
		var amount = 0;
		if(global.isInt(args[0]))
			amount = parseInt(args[0]);
		else
			return;
		await msg.guild.fetchMembers()
			.then(function(mem){
				var users = global.getids(mem.members);
				var sql = "UPDATE IGNORE cowoncy SET money = money + "+amount+" WHERE id IN ("+users+");";
				console.log(sql);
			})
			.catch(function(err){
				console.error(err);
			});
	}

})
