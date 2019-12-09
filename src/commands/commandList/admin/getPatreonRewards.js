/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const patreon = require('../../../botHandlers/patreonHandler.js');
var cowoncy = ["184587051943985152","184587051943985152","184587051943985152","184587051943985152","184587051943985152","184587051943985152","184587051943985152"];

module.exports = new CommandInterface({

	alias:["getpatreons","distributecowoncy"],

	admin:true,
	dm:true,

	execute: async function(p){
		if(p.command == "getpatreons"){
			await getPatreons(p);
		}else{
			await distributeCowoncy(p);
		}
	}

})

async function getPatreons(p){
	let patreons = await patreon.request();
	let sql = `SELECT id FROM user INNER JOIN patreons ON user.uid = patreons.uid WHERE TIMESTAMPDIFF(MONTH,patreonTimer,NOW())<patreonMonths;`;
	let result = await p.query(sql);

	let text = "";

	if(patreons["One wish"].length){
		text += "**One Wish**\n";
		let list = patreons["One wish"];
		for(let i in list){
			text += "<@"+list[i].discordID+"> | **"+list[i].name+"** | "+list[i].discordID+"\n";
		}
	}

	if(patreons["Custom Command"].length){
		text += "\n**Custom Command**\n";
		let list = patreons["Custom Command"];
		for(let i in list){
			text += "<@"+list[i].discordID+"> | **"+list[i].name+"** | "+list[i].discordID+"\n";
		}
	}

	if(patreons["Custom Discord rank"].length){
		text += "\n**Custom Rank**\n";
		let list = patreons["Custom Discord rank"];
		for(let i in list){
			text += "<@"+list[i].discordID+"> | **"+list[i].name+"** | "+list[i].discordID+"\n";
		}
	}

	csv = "Discord Name,Discord ID,Patreon Name,Pet Name,hp str pr wp mag mr,Pet Desc,Pet ID,SQL\n";
	if(patreons["Custom Pet"].length){
		text += "\n**Custom Pet**\n";
		let list = patreons["Custom Pet"];
		for(let i in list){
			text += "<@"+list[i].discordID+"> | **"+list[i].name+"** | "+list[i].discordID+"\n";
			let user = await p.fetch.getUser(list[i].discordID);
			csv += (user?user.username:"A User")+","+list[i].discordID+","+list[i].name+"\n";
		}
	}

	cowoncy = [];
	if(patreons["Monthly cowoncy"].length){
		let list = patreons["Monthly cowoncy"];
		for(let i in list){
			if(list[i].discordID)
				cowoncy.push(list[i].discordID);
		}
		for(let i in result){
			if(!cowoncy.includes(result[i].id))
				cowoncy.push(result[i].id);
		}
		
	}

	await p.send(text,null,{split:true});
	await p.send("Type `owo distributecowoncy {amount}` to send monthly cowoncy to "+cowoncy.length+" users");
	await p.send('```'+csv+'```',null,null,{split:{prepend:'```',append:'```'}})
}

async function distributeCowoncy(p){
	if(p.args.length!=1||!p.global.isInt(p.args[0])){
		p.errorMsg(", Invalid param",4000);
		return;
	}
	let amount = parseInt(p.args[0]);
	let sql = `INSERT INTO cowoncy (id,money) VALUES (${cowoncy.join(","+amount+"),(")},${amount}) ON DUPLICATE KEY UPDATE money = money + ${amount};`;
	let result = await p.query(sql);
	let text = "Distributed "+amount+" cowoncy to "+cowoncy.length+" users\n```json\n"+JSON.stringify(result, null, 2)+"```";
	p.send(text);
}
