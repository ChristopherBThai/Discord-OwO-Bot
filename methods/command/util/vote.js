const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["vote"],

	args:"",

	desc:"Vote on Discord Bot List to gain daily cowoncy!",

	example:[],

	related:["owo daily","owo money"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		var con = p.con;
		var id = p.msg.author.id;
		p.dbl.hasVoted(""+p.msg.author.id).then(voted => {
			console.log(voted);
			if(voted){
				var sql = "SELECT count,TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = "+id+";";
				sql += "SELECT patreonDaily FROM cowoncy NATURAL JOIN user WHERE id = "+id+";";
				con.query(sql,function(err,result){
					if(err) {console.error(err);return;}
					var patreon = false;
					if(result[1][0]&&result[1][0].patreonDaily==1)
						patreon = true;
					if(result[0][0]==undefined){
						var reward = 200;
						var patreonBonus = 0;
						if(patreon)
							patreonBonus*=2;
						sql = "INSERT IGNORE INTO vote (id,date,count) VALUES ("+id+",NOW(),1);"+
							"UPDATE IGNORE cowoncy SET money = money+"+(reward+patreonBonus)+" WHERE id = "+id+";";
						con.query(sql,function(err,result){
							if(err) {console.error(err);return;}
							var text = "**☑ |** You have received **"+reward+"** cowoncy for voting!"+patreonMsg(patreonBonus)+"\n";
							text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
							p.send(text);
							console.log("\x1b[33m",id+" has voted for the first time!"); 
							p.logger.increment("votecount");
						});
					}else if(result[0][0].time>=24){
						var bonus = 200 + (result[0][0].count*5);
						var patreonBonus = 0;
						if(patreon)
							patreonBonus= bonus;
						sql = "UPDATE vote SET date = NOW(),count = count+1 WHERE id = "+id+";"+
						"UPDATE IGNORE cowoncy SET money = money+"+(bonus+patreonBonus)+" WHERE id = "+id+";";
						con.query(sql,function(err,result){
							if(err) {console.error(err);return;}
							var text = "**☑ |** You have received **"+bonus+"** cowoncy for voting!"+patreonMsg(patreonBonus)+"\n";
							text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
							p.send(text);
							console.log("\x1b[33m",id+" has voted and  received cowoncy!"); 
							p.logger.increment("votecount");
						});
					}else{
						var text = "**☑ |** Click the link to vote and gain 200+ cowoncy!\n";
						text += "**<:blank:427371936482328596> |** Your daily vote is available in **"+(24-result[0][0].time)+"**\n";
						text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
						p.send(text);
						console.log("\x1b[33m",id+" tried to vote again"); 
					}
				});
			}else{
				var text = "**RETYPE `OWO VOTE` AFTER YOU VOTE TO CLAIM COWONCY (for now)**\n**☑ |** Click the link to vote and gain 200+ cowoncy!\n";
				text += "**<:blank:427371936482328596> | Your daily vote is available!**\n";
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
