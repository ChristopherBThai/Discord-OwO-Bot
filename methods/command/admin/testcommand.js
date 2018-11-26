const CommandInterface = require('../../commandinterface.js');
const imagegen = require('../battle/battleImage.js');

module.exports = new CommandInterface({
	
	alias:["testcommand"],

	admin:true,

	execute: async function(p){
		var sql = "SELECT COUNT(*) as count FROM animal WHERE ispet > 0;"
		var result = await p.query(sql);
		sql = "SELECT * FROM animal WHERE ispet > 0 LIMIT 1 OFFSET "+(Math.trunc(Math.random()*result[0].count))+";";
		sql += "SELECT * FROM animal WHERE ispet > 0 LIMIT 1 OFFSET "+(Math.trunc(Math.random()*result[0].count))+";";
		sql += "SELECT * FROM animal WHERE ispet > 0 LIMIT 1 OFFSET "+(Math.trunc(Math.random()*result[0].count))+";";
		result = await p.query(sql);
		var player = [];
		for(i=0;i<result.length;i++)
			player.push(result[i][0])
		var enemy = []
		try{
			var image = await imagegen.generateImage(player,enemy);
			p.send({file:image});
		}catch(error){
			console.error(error);
		}
	}
})
