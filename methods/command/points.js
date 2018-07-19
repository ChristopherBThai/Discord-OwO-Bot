const CommandInterface = require('../commandinterface.js');

module.exports = new CommandInterface({

	alias:["points"],

	args:"",

	desc:"Gives the user a point. This is the same as just saying owo in your messages.\nYou weren't really suppose to find this.",

	example:[],

	related:[],

	cooldown:10000,
	half:90,
	six:700,
	bot:true,

	execute: function(p){
		var id = p.msg.author.id;
		var guild = p.msg.guild;
		var text = p.msg.content.replace(/(\n)+/g," | ");
		try{
			//Adds points
			var sql = "INSERT INTO user (id,count) VALUES ("+id+",1) ON DUPLICATE KEY "+
				"UPDATE count = count + 1;";
			sql += "INSERT INTO guild (id,count) VALUES ("+guild.id+",1) ON DUPLICATE KEY UPDATE count = count + 1;";
			sql += "INSERT INTO cowoncy (id,money) VALUES ("+id+",2) ON DUPLICATE KEY UPDATE money = money + 2;";

			p.con.query(sql,function(err,result){
				if(err) console.error(err);
				p.logger.value('cowoncy',2,['command:points','id:'+id]);
			});
		}catch(err){
			console.error(err);
		}
	}

})
