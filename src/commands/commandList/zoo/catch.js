/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const animals = require('../../../../../tokens/owo-animals.json');
const global = require('../../../utils/global.js');
const dateUtil = require('../../../utils/dateUtil.js');
const gemUtil = require('./gemUtil.js');
const animalUtil = require('./animalUtil.js');
const alterHunt = require('./../patreon/alterHunt.js');
const lootboxChance = 0.05;

module.exports = new CommandInterface({

	alias:["hunt","h","catch"],

	args:"",

	desc:"Hunt for some animals for your zoo!\nHigher ranks are harder to find!",

	example:[],

	related:["owo zoo","owo sell","owo lootbox"],

	permissions:["sendMessages"],

	cooldown:15000,
	half:80,
	six:500,
	bot:true,

	execute: async function(p){
		let msg=p.msg,con=p.con;

		let sql = "SELECT money,IF(patreonAnimal = 1 OR (TIMESTAMPDIFF(MONTH,patreonTimer,NOW())<patreonMonths),1,0) as patreon FROM cowoncy LEFT JOIN user ON cowoncy.id = user.id LEFT JOIN patreons ON user.uid = patreons.uid WHERE cowoncy.id = "+msg.author.id+";";
		sql += `SELECT name,nickname,animal.pid FROM user INNER JOIN pet_team ON user.uid = pet_team.uid INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid INNER JOIN animal ON pet_team_animal.pid = animal.pid
				WHERE user.id = ${p.msg.author.id};`;
		sql += "SELECT *,TIMESTAMPDIFF(HOUR,claim,NOW()) as time FROM lootbox WHERE id = "+msg.author.id+";";
		sql += "SELECT uid,activecount,gname,type FROM user NATURAL JOIN user_gem NATURAL JOIN gem WHERE id = "+msg.author.id+" AND activecount > 0;";
		let result = await p.query(sql);
		if(result[0][0]==undefined||result[0][0].money<animals.rollprice){
			p.errorMsg(", You don't have enough cowoncy!",3000);
		}else{
			//Sort gem benefits
			let gems = {}
			let uid = undefined;
			for(var i=0;i<result[3].length;i++){
				tempGem = gemUtil.getGem(result[3][i].gname);
				tempGem.uid = result[3][i].uid;
				tempGem.activecount = result[3][i].activecount;
				tempGem.gname = result[3][i].gname;
				gems[tempGem.type] = tempGem;
				uid = result[3][i].uid;
			}

			//Get animal
			let animal = getAnimals(p,result,gems,uid);
			let sql = animal.sql;
			let text = animal.text;

			//Get Xp
			if(result[1][0]){
				text += `\n${p.config.emoji.blank} **|** `;
				for(let i in result[1]){
					sql += `UPDATE animal SET xp = xp + ${animal.xp} WHERE pid = ${result[1][i].pid};`;
					let pet =  p.global.validAnimal(result[1][i].name);
					text += (pet.uni?pet.uni:pet.value)+" ";
				}
				text += `gained **${animal.xp}xp**!`;
			}

			//Get Lootbox
			let lbReset = dateUtil.afterMidnight((result[2][0])?result[2][0].claim:undefined);
			if(!result[2][0]||result[2][0].claimcount<3||lbReset.after){
				var lootbox = getLootbox(p,result[2][0],lbReset);
				sql += lootbox.sql;
				text += lootbox.text;
			}

			//Alter text for legendary tier patreons
			text = alterHunt.alter(p.msg.author.id,text);
			//text += "\n⚠ **|** `battle` and `hunt` cooldowns have increased to prevent rateLimits issues.\n<:blank:427371936482328596> **|** They will revert back to `15s` in the future.";

			let result2 = await p.query(sql);
			p.logger.value('cowoncy',-5,['command:hunt','id:'+msg.author.id]);
			for(let i in animal.animal){
				let tempAnimal = p.global.validAnimal(animal.animal[i][1]);
				p.logger.value('animal',1,['animal:'+tempAnimal.name,'rank:'+tempAnimal.rank,'id:'+p.msg.author.id,'guild:'+p.msg.channel.guild.id]);
				p.logger.value('animal.points',tempAnimal.points,['animal:'+tempAnimal.name,'rank:'+tempAnimal.rank,'id:'+p.msg.author.id,'guild:'+p.msg.channel.guild.id]);
			}
			p.quest("hunt");
			p.quest("find",1,animal.typeCount);
			p.quest("xp",animal.xp);
			p.send(text);
		}
	}
})

function getAnimals(p,result,gems,uid){
	/* Parse if user is a patreon */
	var patreon = (result[0][0].patreon==1);
	var patreonGem = (gems["Patreon"])?true:false;

	/* If no gems */
	var gemLength = Object.keys(gems).length;
	if(gemLength==0){
		var animal = [animalUtil.randAnimal(patreon)];

	/* If gems... */
	}else{
		/* Calculate how many animals we need */
		let count = 1;
		if(gems["Hunting"]) count += gems["Hunting"].amount
		if(gems["Empowering"]) count *= 2

		/* Grabs 1-2 animal to check for patreongem */
		var animal = [animalUtil.randAnimal((patreon||patreonGem),true,gems["Lucky"])];
		if(gems["Patreon"]) animal.push(animalUtil.randAnimal(true,true,gems["Lucky"]));

		/* Get the rest of the animals */
		for(var i=1;i<count;i++)
			animal.push(animalUtil.randAnimal(patreon,true,gems["Lucky"]));
	}

	/* Construct sql statement for animal insertion */
	var sql = "";
	var xp = 0;
	var insertAnimal = "INSERT INTO animal (count,totalcount,id,name) VALUES ";
	var typeCount = {};
	for(var i=0;i<animal.length;i++){
		var type = animal[i][2];
		xp += animal[i][3];
		insertAnimal += "(1,1,"+p.msg.author.id+",'"+animal[i][1]+"'),";
		if(!typeCount[type]) typeCount[type] = 0;
		typeCount[type] += 1;
	}
	sql += insertAnimal.slice(0,-1)+" ON DUPLICATE KEY UPDATE count = count +1,totalcount = totalcount+1;";
	var insertCount = "";
	for(var key in typeCount){
		insertCount += "INSERT INTO animal_count (id,"+key+") VALUES ("+p.msg.author.id+","+typeCount[key]+") ON DUPLICATE KEY UPDATE "+key+" = "+key+"+"+typeCount[key]+";";
	}
	sql += insertCount+"UPDATE cowoncy SET money = money - 5 WHERE id = "+p.msg.author.id+";";

	/* Construct sql statements for gem usage */
	var huntingActive = false;
	var empoweringActive = false;
	if(gems["Patreon"]) sql += "UPDATE user_gem SET activecount = GREATEST(activecount - 1, 0) WHERE uid = "+uid+" AND gname = '"+gems["Patreon"].gname+"';";
	if(gems["Hunting"]) {
		huntingActive = true;
		sql += "UPDATE user_gem SET activecount = GREATEST(activecount - 1, 0) WHERE uid = "+uid+" AND gname = '"+gems["Hunting"].gname+"';";
	}
	if(gems["Empowering"]) {
		empoweringActive = true;
		sql += "UPDATE user_gem SET activecount = GREATEST(activecount - "+Math.trunc(animal.length/2)+", 0) WHERE uid = "+uid+" AND gname = '"+gems["Empowering"].gname+"';";
	}
	if(gems["Lucky"]) {
		// make lucky gems last twice as long if you're running all 3 gems
		var luckySubtract = (huntingActive && empoweringActive) ? Math.trunc(animal.length/2) : animal.length;

		sql += "UPDATE user_gem SET activecount = GREATEST(activecount - "+luckySubtract+", 0) WHERE uid = "+uid+" AND gname = '"+gems["Lucky"].gname+"';";
	} 

	/* Construct output message for user */
	var text = "**🌱 | "+p.msg.author.username+"** spent 5 <:cowoncy:416043450337853441> and caught a "+animal[0][0]+" "+global.unicodeAnimal(animal[0][1])+"!";
	if(animal[0][0].charAt(2)=='u' || animal[0][0].charAt(2)=='e') text = text.replace(" a ", " an ");
	if(gemLength>0){
		text = "**🌱 | "+p.msg.author.username+"**, hunt is empowered by ";
		for(let i in gems){
			let remaining = gems[i].activecount-((gems[i].type=="Patreon"||gems[i].type=="Hunting")?1:((gems[i].type=="Empowering"||(gems[i].type=="Lucky"&& huntingActive && empoweringActive))?Math.trunc(animal.length/2):animal.length));
			if(remaining<0) remaining = 0;
			text += gems[i].emoji+"`["+remaining+"/"+gems[i].length+"]` ";
		}
		text += " !\n**<:blank:427371936482328596> |** You found: "+global.unicodeAnimal(animal[0][1]);
		for(var i=1;i<animal.length;i++) text += " "+global.unicodeAnimal(animal[i][1]);
	}

	return {"sql":sql,"xp":xp,"animal":animal,"text":text,"typeCount":typeCount};
}

function getLootbox(p,query,lbReset){
	var rand = Math.random();
	var sql = "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+p.msg.author.id+",1,1,"+lbReset.sql+") ON DUPLICATE KEY UPDATE boxcount = boxcount + 1, claimcount = 1, claim = "+lbReset.sql+";";
	var count = 1;
	if(!query||lbReset.after)
		rand = 0;
	else{
		sql = "UPDATE IGNORE lootbox SET boxcount = boxcount + 1, claimcount = claimcount + 1 WHERE id = "+p.msg.author.id+";";
		count = query.claimcount + 1;
	}
	if(rand <= lootboxChance){
		return {
			"sql":sql,
			"text":"\n**<:box:427352600476647425> |** You found a **lootbox**! `["+count+"/3] RESETS IN: "+lbReset.hours+"H "+lbReset.minutes+"M "+lbReset.seconds+"S`"
		};
	}else return {"sql":"","text":""};
}
