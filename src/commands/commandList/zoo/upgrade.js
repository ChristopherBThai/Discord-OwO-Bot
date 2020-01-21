/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const alterUpgrade = require('../patreon/alterUpgrade.js');
const autohuntUtil = require('./autohuntutil.js');
const essence = "<a:essence:451638978299428875>";
const traits = {};
const efficiency = ["efficiency","timer","cd","cooldown"];
for(var i=0;i<efficiency.length;i++)
	traits[efficiency[i]] = "efficiency";
const cost = ["cost","price","cowoncy"];
for(var i=0;i<cost.length;i++)
	traits[cost[i]] = "cost";
const duration = ["duration","totaltime","time"];
for(var i=0;i<duration.length;i++)
	traits[duration[i]] = "duration";
const gain = ["gain","essence"];
for(var i=0;i<gain.length;i++)
	traits[gain[i]] = "gain";
const exp= ["exp","experience","pet"];
for(var i=0;i<exp.length;i++)
	traits[exp[i]] = "exp";


module.exports = new CommandInterface({

	alias:["upgrade","upg"],

	args:"{trait} {count}",

	desc:"Use animal essence to upgrade autohunt!",

	example:["owo upgrade efficiency 200","owo upgrade cost 5000"],

	related:["owo autohunt","owo sacrifice"],

	permissions:["sendMessages"],

	cooldown:1000,
	half:120,
	six:500,
	bot:true,

	execute: async function(p){
		let global=p.global,con=p.con,msg=p.msg,args=p.args;

		let count = undefined;
		let trait = undefined;

		//if arg0 is an int
		if(global.isInt(args[0])){
			if(args[1])
				trait = traits[args[1].toLowerCase()];
			count = parseInt(args[0]);

		//if arg1 is an int
		}else if(global.isInt(args[1])){
			if(args[0])
				trait = traits[args[0].toLowerCase()];
			count = parseInt(args[1]);

		}else{
			p.send("**🚫 |** Please include how many animal essence to use!",3000);
			return;
		}

		//Check if valid args
		if(!trait){
			p.send("**🚫 |** I could not find that autohunt trait!\n**<:blank:427371936482328596> |** You can choose from: `efficiency`, `duration`, `cost`, `gain`, or `exp`",5000);
			return;
		}
		if(!count||count<=0){
			p.send("**🚫 |** You need to use more than 1 animal essence silly~",3000);
			return;
		}

		let sql = "SELECT * FROM autohunt WHERE id = "+msg.author.id+";";
		sql += "UPDATE autohunt SET essence = essence - "+count+","+trait+"="+trait+"+"+count+" WHERE id = "+msg.author.id+" AND essence >= "+count+";";
		let result = await p.query(sql);
		if(!result[0][0]||result[1].affectedRows==0){
			p.send("**🚫 | "+msg.author.username+"** You do not have enough animal essence!",3000);
			return;
		}
		let stat = autohuntUtil.getLvl(result[0][0][trait],count,trait);
		/* Refund overflowing mana */
		if(stat.max){
			sql += "UPDATE autohunt SET essence = essence + "+stat.currentxp+","+trait+"="+trait+"-"+stat.currentxp+" WHERE id = "+msg.author.id+";";
			await p.query(sql);
		}
		let text = "**🛠 | "+msg.author.username+"**, You successfully upgraded `"+trait+"` with  **"+(p.global.toFancyNum(count))+" Animal Essence** "+essence+"!";
		text += "\n**<:blank:427371936482328596> |** `"+trait+": "+stat.stat+stat.prefix+" -  Lvl "+stat.lvl+" "+((stat.max)?"[MAX]":"["+stat.currentxp+"/"+stat.maxxp+"]")+"`";
		if(stat.max)
			text += "\n**<:blank:427371936482328596> |** HuntBot is at max level!";
		else if(stat.lvlup)
			text += "\n**<:blank:427371936482328596> |** HuntBot Leveled Up!! 🎉";
		text = alterUpgrade.alter(p.msg.author.id,text);
		p.send(text);

	}

})
