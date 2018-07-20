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
	console.log(json);
	console.log("Webhooks for "+id);
	var sql = "SELECT count,TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = "+id+";";
	sql += "SELECT patreonDaily FROM cowoncy NATURAL JOIN user WHERE id = "+id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
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
				if(err) throw err;
				logger.value('cowoncy',(reward+patreonBonus),['command:vote','id:'+id]);
				global.msgUser(id,"**☑ |** You have received **"+reward+"** cowoncy for voting!"+patreonMsg(patreonBonus));
				console.log("\x1b[33m",id+" has voted for the first time!");
			});
		}else if(result[0][0].time>=11){
			var bonus = 200 + (result[0][0].count*5);
			var patreonBonus = 0;
			if(patreon)
				patreonBonus= bonus;
			sql = "UPDATE vote SET date = NOW(),count = count+1 WHERE id = "+id+";"+
			"UPDATE IGNORE cowoncy SET money = money+"+(bonus+patreonBonus)+" WHERE id = "+id+";";
			con.query(sql,function(err,result){
				if(err) throw err;
				logger.value('cowoncy',(bonus+patreonBonus),['command:vote','id:'+id]);
				global.msgUser(id,"**☑ |** You have received **"+bonus+"** cowoncy for voting!"+patreonMsg(patreonBonus));
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
