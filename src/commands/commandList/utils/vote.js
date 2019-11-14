/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["vote"],

	args:"",

	desc:"Vote on Discord Bot List to gain daily cowoncy!",

	example:[],

	related:["owo daily","owo money"],

	permissions:["sendMessages","embedLinks","attachFiles"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		let con = p.con,id = p.msg.author.id;
		p.dbl.hasVoted(""+p.msg.author.id).then(voted => {
			if(voted){
			p.dbl.isWeekend().then(weekend => {
				let sql = "SELECT count,TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = "+id+";";
				sql += "SELECT IF(patreonDaily = 1 OR ((TIMESTAMPDIFF(MONTH,patreonTimer,NOW())<patreonMonths) AND patreonType = 3),1,0) as patreon FROM user LEFT JOIN patreons ON user.uid = patreons.uid WHERE user.id = "+id+";";
				con.query(sql,function(err,result){
					if(err) return;
					let patreon = false;
					if(result[1][0]&&result[1][0].patreon==1)
						patreon = true;
					if(result[0][0]==undefined){
						let box = {};
						if(Math.random()<.5){
							box.sql = "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+p.msg.author.id+",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
							box.text = "**<:box:427352600476647425> |** You received a lootbox!\n"
						}else{
							box.sql = "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
							box.text = "**<:crate:523771259302182922> |** You received a weapon crate!\n";
						}
						var reward = 100;
						var patreonBonus = 0;
						var weekendBonus = ((weekend)?reward:0);
						if(patreon)
							patreonBonus*=2;
						sql = "INSERT IGNORE INTO vote (id,date,count) VALUES ("+id+",NOW(),1);"+
							"UPDATE IGNORE cowoncy SET money = money+"+(reward+patreonBonus+weekendBonus)+" WHERE id = "+id+";";
						sql += box.sql;
						con.query(sql,function(err,result){
							if(err) {console.error(err);return;}
							p.logger.value('cowoncy',(reward+patreonBonus+weekendBonus),['command:vote','id:'+id]);
							var text = "**☑ |** You have received **"+reward+"** cowoncy for voting!"+patreonMsg(patreonBonus)+"\n";
							if(weekend)
								text += "**⛱ |** It's the weekend! You also earned a bonus of **"+weekendBonus+"** cowoncy!\n";
							text += box.text;
							text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
							p.send(text);
							//console.log("\x1b[33m",id+" has voted for the first time!");
							p.logger.increment("votecount");
						});
					}else if(result[0][0].time>=12){
						let box = {};
						if(Math.random()<.5){
							box.sql = "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+p.msg.author.id+",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
							box.text = "**<:box:427352600476647425> |** You received a lootbox!\n"
						}else{
							box.sql = "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
							box.text = "**<:crate:523771259302182922> |** You received a weapon crate!\n";
						}
						var bonus = 100 + (result[0][0].count*3);
						var patreonBonus = 0;
						var weekendBonus = ((weekend)?bonus:0);
						if(patreon)
							patreonBonus= bonus;
						sql = "UPDATE vote SET date = NOW(),count = count+1 WHERE id = "+id+";"+
						"UPDATE IGNORE cowoncy SET money = money+"+(bonus+patreonBonus+weekendBonus)+" WHERE id = "+id+";";
						sql += box.sql;
						con.query(sql,function(err,result){
							if(err) {console.error(err);return;}
							p.logger.value('cowoncy',(bonus+patreonBonus+weekendBonus),['command:vote','id:'+id]);
							var text = "**☑ |** You have received **"+bonus+"** cowoncy for voting!"+patreonMsg(patreonBonus)+"\n";
							if(weekend)
								text += "**⛱ |** It's the weekend! You also earned a bonus of **"+weekendBonus+"** cowoncy!\n";
							text += box.text;
							text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
							p.send(text);
							//console.log("\x1b[33m",id+" has voted and  received cowoncy!");
							p.logger.increment("votecount");
						});
					}else{
						var text = "**☑ |** Click the link to vote and gain 100+ cowoncy!\n";
						text += "**<:blank:427371936482328596> |** You can vote every 12 hours!\n";
						text += "**<:blank:427371936482328596> |** Your daily vote is available in **"+(12-result[0][0].time)+" H**\n";
						//text += "**<:blank:427371936482328596> |** Please retype `owo vote` 1-10min after you vote!\n";
						text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
						p.send(text);
						//console.log("\x1b[33m",id+" tried to vote again");
					}
				});
			});
			}else{
				var text = "**☑ | Your daily vote is available!**\n";
				text += "**<:blank:427371936482328596> |** You can vote every 12 hours!\n";
				//text += "**⚠ |** Automatic votes are currently broken!\n";
				//text += "**<:blank:427371936482328596> |** Please retype `owo vote` 1-10min after you vote!\n";
				text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
				p.send(text);
			}
		});
	}

})


function patreonMsg(amount){
	if(!amount||amount==0)
		return "";
	return "\n**<:blank:427371936482328596> |** And **"+amount+"** cowoncy for being a <:patreon:449705754522419222> Patreon!";
}
