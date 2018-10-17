var manager;
const login = require('../../tokens/owo-login.json');
const con = require('../util/mysql.js').con;

exports.setManager = function(manageri){
	manager = manageri;
}

exports.msgUser = function(id,msg){
	var rand = Math.floor(Math.random()*manager.totalShards);
	manager.broadcast({
		type:"sendDM",
		shard:rand,
		to:id,
		msg:msg
	});
}

exports.getUsername = async function(id){
	var username = await manager.broadcastEval(`
		var user = this.users.get('${id}');
		if(user!=undefined)
			user = user.username;
		user;
	`);
	return username.reduce((fin, val) => fin = (val)?val:fin);
}

exports.msgChannel = function(id,msg){
	manager.broadcast({
		type:"sendChannel",
		to:id,
		msg:msg
	});
}

exports.con = function(){
	return con;
}
