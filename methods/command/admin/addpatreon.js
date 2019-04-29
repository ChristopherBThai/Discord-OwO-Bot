const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["addpatreon"],

	admin:true,

	execute: async function(p){

		/*
		// Parses # of months
		let month = 1;
		if(p.args.length&&p.global.isInt(p.args[0]))
			month = parseInt(p.args[0]));
		if(month<1) month = 1;

		// Query result
		let sql = `SELECT patreon FROM user WHERE id = ${p.msg.author.id}`;
		let result = await p.query(sql);
		
		*/

	}

})
