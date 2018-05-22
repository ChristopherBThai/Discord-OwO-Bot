/**
 * dbl voting webhooks
 */

const express = require('express');
const app = express();

const dblapi = require('dbl-api');
const api = new dblapi();

app.post('/scuttester',api.handler);

api.on('upvote', (user,bot) => upvote(user));

const global = require('./global.js');
const logger = require('../util/logger.js');

var con;
var manager;

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
				global.msgUser(id,"You have received __200__ cowoncy for voting!");
				console.log("\x1b[33m",id+" has voted for the first time!"); 
			});
		}else if(result[0].time>=23){
			var bonus = 200 + (result[0].count*5);
			sql = "UPDATE vote SET date = NOW(),count = count+1 WHERE id = "+id+";"+
			"UPDATE IGNORE cowoncy SET money = money+"+bonus+" WHERE id = "+id+";";
			con.query(sql,function(err,result){
				if(err) throw err;
				global.msgUser(id,"You have received __"+bonus+"__ cowoncy for voting!")
				console.log("\x1b[33m",id+" has voted and  received cowoncy!"); 
			});
		}else{
			global.msgUser(id,"You wait need to wait "+(23-result[0].time)+" hours before voting again!")
			console.log("\x1b[33m",id+" tried to vote again"); 
		}
	});
	logger.increment("votecount");
}

exports.setManager = function(manageri){
	manager = manageri;
	con = global.con();
	app.listen(3000);
}

