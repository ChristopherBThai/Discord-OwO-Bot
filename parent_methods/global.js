var manager;
const login = require('../../tokens/owo-login.json');
const con = require('../util/mysql.js').con;

exports.setManager = function(manageri){
	manager = manageri;
}

exports.msgUser = function(id,msg){
	var rand = Math.floor(Math.random()*manager.totalShards);
	manager.broadcastEval(`
		if(this.shard.id==${rand}){
			this.fetchUser('${id}')
			.then(user => {
				if(user!=undefined)
					user.send(\`${msg}\`)
					.catch(err => console.error(err));
			}).catch(err => console.error(err));
		}
	`);
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
	manager.broadcastEval(`
		var channel = this.channels.get('${id}');
		if(channel!=undefined)
			channel.send(\`${msg}\`);
	`);
}

exports.con = function(){
	return con;
}
