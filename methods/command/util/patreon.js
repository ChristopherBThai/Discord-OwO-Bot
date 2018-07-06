const CommandInterface = require('../../commandinterface.js');

const guild = "420104212895105044";
const daily = "449429399217897473";
const animal = "449429255781351435";

module.exports = new CommandInterface({
	
	alias:["patreon","donate"],

	args:"",

	desc:"Donate to OwO Bot to help support its growth! Any donations will come with special benefits!",

	example:[],

	related:[],

	cooldown:10000,
	half:80,
	six:500,

	execute: async function(p){
		var patreon = await p.client.shard.broadcastEval(`
			var user = this.guilds.get('${guild}');
			if(!user) 0;
			else{
				var user = user.members.get('${p.msg.author.id}');
				if(!user) 0;
				else{
					var result = 0;
					if(user.roles.has('${daily}'))
						result++;
					if(user.roles.has('${animal}'))
						result++;
					result;
				}
			}
		`);
		patreon = patreon.reduce((prev, val) => prev + val, 0)

		var sql = "UPDATE IGNORE user SET patreonDaily = "+((patreon>1)?1:0)+",patreonAnimal = "+((patreon>0)?1:0)+" WHERE id = "+p.msg.author.id+";";
		p.con.query(sql,function(err,result){
			if(err) {console.error(err);return;}
			var stat =  "You are currently not a Patreon!";
			if(patreon==1)
				stat = "You are a common Patreon!";
			if(patreon==2)
				stat = "You are an uncommon+ Patreon!";
			var text = "**<:patreon:449705754522419222> |** Donate to OwO Bot for special benefits!\n";
			text += "**<:blank:427371936482328596> |** "+stat+"\n";
			text += "**<:blank:427371936482328596> |** https://www.patreon.com/OwOBot";
			p.send(text);
		});
	}

})

