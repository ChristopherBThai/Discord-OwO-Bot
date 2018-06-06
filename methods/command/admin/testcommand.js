const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["testcommand"],

	admin:true,

	execute: async function(p){
		var global=p.global,con=p.con,args=p.args,msg=p.msg;
		await msg.guild.fetchMembers()
			.then(function(mem){
				var users = global.getids(mem.members);
				console.log(users);
			})
			.catch(function(err){
				console.error(err);
			});
	}

})
