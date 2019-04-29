const CommandInterface = require('../../commandinterface.js');

const patreonUtil = require('../../../util/patreon.js');
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
		sql += `SELECT patreonMonths,patreonTimer,TIMESTAMPDIFF(MONTH,patreonTimer,NOW()) AS monthsPassed,patreonType FROM user INNER JOIN patreons ON user.uid = patreons.uid WHERE id = ${p.msg.author.id}`;
		let result = await p.query(sql);

		var stat =  "Join today for special animals and benefits!";
		if(patreon==1)
			stat = "You are currently a **Patreon**!";
		else if(patreon==2)
			stat = "You are currently a **Patreon+**!";
		else if(result[1][0]){
			let parsed = patreonUtil.parsePatreon(result[1][0]);
			if(parsed){
				if(parsed.animal&&!parsed.cowoncy)
					stat = "You are currently a **Patreon**";
				else 
					stat = "You are currently a **Patreon+**";
				stat += "\n**<:blank:427371936482328596> |** until: **"+parsed.expireDate.toString()+"**";
			}
		}

		var text = "**<:patreon:449705754522419222> |** Donate to OwO Bot for special benefits!\n";
		text += "**<:blank:427371936482328596> |** "+stat+"\n";
		text += "**<:blank:427371936482328596> |** https://www.patreon.com/OwOBot";
		p.send(text);
	}

})

