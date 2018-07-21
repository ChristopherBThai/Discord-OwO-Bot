const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const battleUtil = require('./battleutil.js');
const petUtil = require('./petutil.js');

module.exports = new CommandInterface({

	alias:["battle","b","fight"],

	args:"{@user} {bet}",

	desc:"Use your pets to fight against other players! As you fight, your pet will become stronger! You can only add pets from your current zoo.",

	example:["owo battle","owo battle @scuttler 100"],

	related:["owo zoo","owo pet"],

	cooldown:15000,
	half:80,
	six:500,
	bot:true,

	execute: function(p){
		if(p.args.length==0){
			var sql = "SELECT money FROM cowoncy WHERE id = "+p.msg.author.id+";";
			p.con.query(sql,function(err,result){
				if(err){console.error(err);return;}
				if(result[0]==undefined||result[0].money<5)
					p.send("**🚫 | "+p.msg.author.username+"**, You don't have enough cowoncy!",3000);
				else
					fight(p.con,p.msg,p.send,p);
			});
		}else
			fightUser(p.con,p.msg,p.args,p.send);
	}

})

function fight(con,msg,send,p){
	var sql = "SELECT id,money,nickname,name,lvl,att,hp,lvl,streak,xp, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three "+
		"FROM (cowoncy NATURAL JOIN animal) LEFT JOIN (animal_food NATURAL JOIN food) "+
		"ON animal.pid = animal_food.pid "+
		"WHERE id = "+msg.author.id+" AND pet = name GROUP BY animal.pid;";
	sql += "SET @rand = (CEIL(RAND()*(SELECT COUNT(*) FROM animal WHERE ispet = 1 AND id != "+msg.author.id+")));"+
		"SELECT id,nickname,name,lvl,att,hp,lvl,streak,xp, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three "+
		"FROM ("+
			"SELECT * FROM (SELECT animal.*,@rownum := @rownum + 1 AS rank FROM animal ,(SELECT @rownum := 0) r WHERE ispet = 1 AND id != "+msg.author.id+") d WHERE rank <= @rand ORDER BY rank DESC LIMIT 1"+
		") as opponent "+
		"LEFT JOIN (animal_food NATURAL JOIN food) ON opponent.pid = animal_food.pid "+
		"GROUP BY opponent.pid;";
	sql += "SELECT young FROM guild WHERE id = "+msg.guild.id+";";
	sql += "UPDATE cowoncy SET money = money - 5 WHERE id = "+msg.author.id+";";

	con.query(sql,async function(err,rows,fields){
		if(err){ console.error(err);return;}
		p.logger.value('cowoncy',-5,['command:battle','id:'+msg.author.id]);

		//Check if guild is kid friendly
		var censor = (rows[3][0]!=undefined && rows[3][0].young)

		//Grab pet info
		var upet = battleUtil.extractInfo(rows[0][0],msg.author,censor);
		var opet = battleUtil.extractInfo(rows[2][0],await global.getUser(rows[2][0].id,false),censor);

		//Check if pets are valid
		if(upet == undefined){
			send("**🚫 | "+msg.author.username+"**, You don't have a pet! Set one with `owo pets add [animal] [nickname]`");
			return;
		}
		if(opet == undefined){
			send("**🚫 | "+msg.author.username+"**, Something went wrong...");
			return;
		}

		var battleInfo = {count:0,color:4886754,line1:"-----------------------",line2:"-----------------------",line3:"",line4:""};
		var embed = battleUtil.createDisplay(upet,opet,battleInfo);
		var battleLog = [embed];
		var uXpGain = 1;
		var oXpGain = 1;

		//Fight 3 times
		for(var i=0;i<3;i++){
			var result = battleUtil.battleTurn(upet,opet,battleInfo);
			if(result){
				//Check who won and give xp
				if(result=="won"){
					uXpGain = opet.lvl - upet.lvl;
					if(uXpGain <= 0) uXpGain = 1;
					uXpGain = (15+upet.streak)*uXpGain;
					if(uXpGain>1000)
						uXpGain = 1000;
					oXpGain = 1;
					battleInfo.line3 += " Your streak is now "+(upet.streak+1)+"!";
				}else if(result=="lost"){
					oXpGain = upet.lvl - opet.lvl;
					if(oXpGain <= 0) oXpGain = 1;
					oXpGain = (15+opet.streak)*oXpGain;
					if(oXpGain>1000)
						oXpGain = 1000;
					uXpGain = 1;
					battleInfo.line3 += " You lost your streak...";
				}else if(result=="draw"){
					if(upet.hp>opet.hp){
						uXpGain = 5;
						oXpGain = 3;
					}else if(opet.hp>upet.hp){
						uXpGain = 3;
						oXpGain = 5;
					}else{
						uXpGain = 4;
						oXpGain = 4;
					}
					battleInfo.line3 += " Your streak is still "+upet.streak+".";
				}else
					result = undefined;

				var lvlup = petUtil.givexp(con,{
					id:upet.id,
					pet:upet.animal,
					lvl:upet.lvl,
					xp:upet.xp,
					gxp:uXpGain,
					result:result
				});

				petUtil.givexp(con,{
					id:opet.id,
					pet:opet.animal,
					lvl:opet.lvl,
					xp:opet.xp,
					gxp:oXpGain,
					result:undefined
				});

				battleInfo.line4 = upet.name+" gained "+uXpGain+" xp!";
				if(lvlup){
					upet.lvl++;
					battleInfo.line4 += " "+upet.name+" is now level "+upet.lvl+"!";
				}else{
					battleInfo.line4 += " Current Xp: ["+(upet.xp+uXpGain)+"/"+petUtil.maxxp(upet.lvl)+"]";
				}
			}
			var embed = battleUtil.createDisplay(upet,opet,battleInfo);
			battleLog.push(embed);
		}

		//Display the fight
		msg.channel.send("**"+msg.author.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",battleLog[0])
		.then(message => setTimeout(function(){

				if(battleLog[1]){message.edit("**"+msg.author.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",battleLog[1])
				.then(message => setTimeout(function(){

				if(battleLog[2]){message.edit("**"+msg.author.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",battleLog[2])
				.then(message => setTimeout(function(){

				if(battleLog[3]){message.edit("**"+msg.author.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",battleLog[3])
				.then(message => setTimeout(function(){

				},1000)).catch(err=>console.error(err));}
				},1000)).catch(err=>console.error(err));}
				},1000)).catch(err=>console.error(err));}

		},1000)).catch(err => msg.channel.send("**🚫 | "+msg.author.username+"**, I don't have permission to send embeded messages!")
		.catch(err => console.error(err)));


	});
}

async function fightUser(con,msg,args,send){
	//Finds opponent
	var opponent = await global.getUser(args[0]);
	if(opponent==undefined){
		send("**🚫 | "+msg.author.username+"**,  I could not find that user!",3000);
		return;
	}
	//Bet amount
	var amount = 0;
	if(global.isInt(args[1]))
		amount = parseInt(args[1]);
	if(amount<0){
		send("**🚫 | "+msg.author.username+"**,  It doesnt work like that silly",3000);
		return;
	}

	//Check if self
	if(opponent.id == msg.author.id){
		send("**🚫 | "+msg.author.username+"**,  You can't battle yourself silly",3000);
		return;
	}
	//Check for smaller id (for sql)
	var smallerid,largerid,sender;
	if(opponent.id<msg.author.id){
		smallerid = opponent.id;
		largerid = msg.author.id;
		sender = 2;
	}else{
		smallerid = msg.author.id;
		largerid = opponent.id;
		sender = 1;
	}
	var sql = "SELECT * FROM battleuser WHERE (user1 = "+msg.author.id+" OR user2 = "+msg.author.id+") AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
	sql += "SELECT * FROM cowoncy LEFT OUTER JOIN animal ON cowoncy.id = animal.id AND pet = name WHERE cowoncy.id = "+msg.author.id+" AND money >= "+amount+";";
	sql += "SELECT * FROM battleuser WHERE (user1 = "+opponent.id+" OR user2 = "+opponent.id+") AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
	sql += "SELECT * FROM cowoncy LEFT OUTER JOIN animal ON cowoncy.id = animal.id AND pet = name WHERE cowoncy.id = "+opponent.id+" AND money >= "+amount+" ;";
	con.query(sql,function(err,result){
		if(err) throw err;
		//Already has a pending battle
		if(result[0][0]!=undefined){
			send("**🚫 | "+msg.author.username+"**, You already have a battle pending!\nDecline it with `owo db`!",3000);
		}else if(result[1][0]==undefined){
			send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
		}else if(result[1][0].name==undefined){
			send("**🚫 | "+msg.author.username+"**, You don't have a pet!",3000);
		}else if(result[1][0].time <= 15){
			send("**🚫 | "+msg.author.username+", You need to wait "+(15-result[0][0].time)+" more seconds!**",3000);
		}else if(result[2][0]!=undefined){
			send("**🚫 | "+opponent.username+"** already has a battle pending!",3000);
		}else if(result[3][0]==undefined){
			send("**🚫 | "+opponent.username+"** doesn't have enough cowoncy!",3000);
		}else if(result[3][0].name==undefined){
			send("**🚫 | "+opponent.username+"** doesn't have a pet!",3000);
		}else{
			var pid1,pid2;
			if(result[1][0].id==smallerid){
				pid1 = result[1][0].pid;
				pid2 = result[3][0].pid;
			}else{
				pid1 = result[3][0].pid;
				pid2 = result[1][0].pid;
			}
			sql = "INSERT INTO battleuser (user1,pid1,user2,pid2,amount,sender) VALUES ("+smallerid+","+pid1+","+largerid+","+pid2+","+amount+","+sender+") ON DUPLICATE KEY UPDATE pid1 = "+pid1+", pid2 = "+pid2+", amount = "+amount+",time = NOW(),sender = "+sender+";";
			con.query(sql,function(err,result2){
				if(err) throw err;
				const embed = {
					"color":4886754,
					"footer": {
						"text": "This invitation ends in 5 minutes"
					},
					"author": {
						"name": opponent.username+"! You have been challenged by "+msg.author.username+"!",
						"icon_url": opponent.avatarURL
					},
					"fields": [{
						"name": msg.author.username,
						"value": "**"+global.unicodeAnimal(result[1][0].name)+" "+result[1][0].nickname+"**\n`Lvl "+result[1][0].lvl+"`\n**`HP`**`: "+result[1][0].hp+"  `\n**`ATT`**`: "+result[1][0].att+"`",
						"inline": true
						},{
						"name": "VS",
						"value": " -",
						"inline": true
						},{
						"name": opponent.username,
						"value": "**"+global.unicodeAnimal(result[3][0].name)+" "+result[3][0].nickname+"**\n`Lvl "+result[3][0].lvl+"`\n**`HP`**`: "+result[3][0].hp+"  `\n**`ATT`**`: "+result[3][0].att+"`",
						"inline": true
						},{
						"name": "The fight requires <:cowoncy:416043450337853441> "+(global.toFancyNum(amount))+" cowoncy to start!",
						"value": "To accept the battle type `owo acceptbattle` or `owo ab`.\nTo decline the battle type `owo declinebattle` or `owo db`.",
					}]
				};
				msg.channel.send({ embed })
					.catch(err => console.error(err));
			});
		}
	});
}
