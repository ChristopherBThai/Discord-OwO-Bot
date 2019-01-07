const CommandInterface = require('../../commandinterface.js');
const imagegen = require('../battle/battleImage.js');
const patreon = require('../../../handler/patreonHandler.js');

module.exports = new CommandInterface({
	
	alias:["testcommand"],

	admin:true,

	execute: async function(p){
		/*
		var sql = "SELECT COUNT(*) as count FROM animal;"
		var result = await p.query(sql);
		*/
		var result = [{"count":600000}];
		sql = "SELECT t.* FROM (SELECT id,name FROM animal LIMIT 1 OFFSET "+(Math.trunc(Math.random()*result[0].count))+") q JOIN animal t ON q.id = t.id AND q.name = t.name;";
		sql += "SELECT t.* FROM (SELECT id,name FROM animal LIMIT 1 OFFSET "+(Math.trunc(Math.random()*result[0].count))+") q JOIN animal t ON q.id = t.id AND q.name = t.name;";
		sql += "SELECT t.* FROM (SELECT id,name FROM animal LIMIT 1 OFFSET "+(Math.trunc(Math.random()*result[0].count))+") q JOIN animal t ON q.id = t.id AND q.name = t.name;";
		result = await p.query(sql);
		var player = [];
		for(i=0;i<result.length;i++)
			player.push(result[i][0])
		var enemy = []
		for(i=0;i<result.length;i++)
			enemy.push(result[i][0])
		try{
			var image = await imagegen.generateImage(player,enemy);
			p.send({file:image});
		}catch(error){
			console.error(error);
		}
	}
})
