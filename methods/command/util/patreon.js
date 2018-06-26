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

	execute: function(p){
		/*var user = p.client.guilds.get(guild);
		if(!user) return undefined;
		var user = owoguild.members.get(p.msg.author.id);
		if(!user) return undefined;
		var result = {};
		if(user.roles.has(daily))
			result.daily = true;
		if(user.roles.has(animal))
			result.animal = true;
		return result;
		*/
		var guilds = await client.shard.fetchClientValues('guilds.get('+guild+').members.get('+p.msg.author.id+')');
		console.log(guilds);

		var text = "**<:patreon:449705754522419222> |** Donate to OwO Bot for special benefits!\n";
		text += "**<:blank:427371936482328596> |** https://www.patreon.com/OwOBot";
		p.send(text);
	}

})

