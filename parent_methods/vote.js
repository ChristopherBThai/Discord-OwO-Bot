/**
 * dbl voting webhooks
 */

const express = require('express');
const app = express();

const dblapi = require('dbl-api');
const api = new dblapi();

app.post('/owo',api.handler);

api.on('upvote', (user,bot,json) => upvote(user,bot,json));

const global = require('./global.js');
const logger = require('../util/logger.js');

var con;
var manager;

/**
 * Listens to upvote webhooks
 */
function upvote(id,bot,json){
	console.log("Webhooks for "+id);
	var weekend = json.isWeekend;
	var sql = "SELECT count,TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = "+id+";";
	sql += "SELECT patreonDaily FROM cowoncy NATURAL JOIN user WHERE id = "+id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		var patreon = false;
		if(result[1][0]&&result[1][0].patreonDaily==1)
			patreon = true;
		if(result[0][0]==undefined){
			let box = {};
			if(Math.random()<.5){
				box.sql = "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+id+",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
				box.text = "\n**<:box:427352600476647425> |** You received a lootbox!"
			}else{
				box.sql = "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+id+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
				box.text = "\n**<:crate:523771259302182922> |** You received a weapon crate!";
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
				if(err) throw err;
				logger.value('cowoncy',(reward+patreonBonus+weekendBonus),['command:vote','id:'+id]);
				var reply = "**☑ |** You have received **"+reward+"** cowoncy for voting!"+patreonMsg(patreonBonus);
				if(weekend)
					reply += "\n**⛱ |** It's the weekend! You also earned a bonus of **"+weekendBonus+"** cowoncy!";
				reply += box.text;
				global.msgUser(id,reply);
				console.log("\x1b[33m",id+" has voted for the first time!");
			});
		}else if(result[0][0].time>=11){
			let box = {};
			if(Math.random()<.5){
				box.sql = "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+id+",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
				box.text = "\n**<:box:427352600476647425> |** You received a lootbox!"
			}else{
				box.sql = "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+id+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
				box.text = "\n**<:crate:523771259302182922> |** You received a weapon crate!";
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
				if(err) throw err;
				logger.value('cowoncy',(bonus+patreonBonus,weekendBonus),['command:vote','id:'+id]);
				var reply = "**☑ |** You have received **"+bonus+"** cowoncy for voting!"+patreonMsg(patreonBonus);
				if(weekend)
					reply += "\n**⛱ |** It's the weekend! You also earned a bonus of **"+weekendBonus+"** cowoncy!";
				reply += box.text;
				global.msgUser(id,reply);
				console.log("\x1b[33m",id+" has voted and  received cowoncy!");
			});
		}else{
			global.msgUser(id,"You wait need to wait "+(12-result[0][0].time)+" hours before voting again!")
			console.log("\x1b[33m",id+" tried to vote again");
		}
	});
	logger.increment("votecount");
}

exports.setManager = function(manageri){
	manager = manageri;
	con = global.con();
	app.listen(3001,() => {
		console.log("\x1b[33m","Voting is listening on port 3001!");
	});
}

function patreonMsg(amount){
	if(!amount||amount==0)
		return "";
	return "\n**<:blank:427371936482328596> |** And **"+amount+"** cowoncy for being a <:patreon:449705754522419222> Patreon!";
}
