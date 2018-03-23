/**
 * dbl voting webhooks
 */

const express = require('express');
const app = express();

const dblapi = require('dbl-api');
const api = new dblapi();

app.post('/scuttester',api.handler);

api.on('upvote', (user,bot) => upvote(user));

var con;
var client;

/**
 * Listens to upvote webhooks
 */
function upvote(id){
	var sql = "SELECT count,TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = "+id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0]==undefined){
			sql = "INSERT IGNORE INTO vote (id,date,count) VALUES ("+id+",NOW(),1);"+
				"UPDATE IGNORE cowoncy SET money = money+200 WHERE id = "+id+";";
			con.query(sql,function(err,result){
				if(err) throw err;
				var user = client.users.get(id);
				if(user!=undefined){
					user.send("You have received __200__ cowoncy for voting!");
					console.log("\x1b[33m",user.username+" has voted for the first time!"); 
				}
			});
		}else if(result[0].time>=23){
			var bonus = 200 + (result[0].count*5);
			sql = "UPDATE vote SET date = NOW(),count = count+1 WHERE id = "+id+";"+
			"UPDATE IGNORE cowoncy SET money = money+"+bonus+" WHERE id = "+id+";";
			con.query(sql,function(err,result){
				if(err) throw err;
				var user = client.users.get(id);
				if(user!=undefined){
					user.send("You have received __"+bonus+"__ cowoncy for voting!");
					console.log("\x1b[33m",user.username+" has voted and  received cowoncy!"); 
				}
			});
		}else{
			var user = client.users.get(id);
			if(user!=undefined){
				user.send("You wait need to wait "+(23-result[0].time)+" hours before voting again!");
				console.log("\x1b[33m",user.username+" tried to vote again"); 
			}
		}
	});
}

exports.sql = function(sql){
	con = sql;
}

exports.client = function(cli){
	client = cli;
	app.listen(3000);
}

/**
 * Sends a link to voting
 */
exports.link = function(msg){
	const embed = {
		"title":"Vote for me daily to receive 200+ Cowoncy!",
		"url":"https://discordbots.org/bot/408785106942164992/vote",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
	};
	msg.channel.send({embed})
		.catch(err => msg.channel.send("I don't have permission to send embedded links! :c"));
}
