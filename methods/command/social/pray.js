const CommandInterface = require('../../commandinterface.js');

const prayLines = ["May luck be in your favor.","You feel lucky!","You feel very lucky!","You can feel the luck within you!"];
const curseLines = ["You feel unlucky...","You feel very unlucky.","Oh no.","You should be careful..."];

module.exports = new CommandInterface({
	
	alias:["pray","curse"],

	args:"{@user}",

	desc:"Pray or curse yourself or other users!!",

	example:["owo pray","owo pray @scuttler"],

	related:[],

	cooldown:300000,
	half:100,
	six:500,

	execute: async function(p){
		var user = undefined;
		if(p.args.length>0)
			user = await p.global.getUser(p.args[0]);
		if(user&&user.id == p.msg.author.id)
			user = undefined;

		if(p.command=="pray"){
			const prayLine = prayLines[Math.floor(Math.random()*prayLines.length)];
			if(user)
				p.send("** | "+p.msg.author.username+"** prays for **"+user.username+"**! "+prayLine);
			else
				p.send("** | "+p.msg.author.username+"** prays... "+prayLine);
		}else{
			const curseLine = curseLines[Math.floor(Math.random()*curseLines.length)];
			if(user)
				p.send("** | "+p.msg.author.username+"** puts a curse on **"+user.username+"**! "+curseLine);
			else
				p.send("** | "+p.msg.author.username+"** is now cursed. "+curseLine);
		}
	}

})
