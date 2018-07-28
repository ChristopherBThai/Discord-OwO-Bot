var client;
var auth = require('../../tokens/owo-auth.json');
var admin;
var logChannel = "469352773314412555";
var modLogChannel = "471579186059018241";

/**
 * Sends a msg to channel
 */
exports.send = function(msg){
	return function(message,del,embed){
		if(del)
			msg.channel.send(message,embed)
				.then(message => message.delete(del))
				.catch(err => console.error(err));
		else
			msg.channel.send(message,embed)
				.catch(err => console.error(err));
	}
}

/**
 * DM a user
 */
exports.msgUser = async function(id,msg){
	id = id.match(/[0-9]+/)[0];
	var user = await client.fetchUser(id,true);
	var success;
	if(user)
		await user.send(msg)
		.then(success = {username:user.username,id:user.id})
		.catch(err => success = false);
	return success;
}

/**
 * Sends a message to an admin
 */
exports.msgAdmin = async function (message){
	if(admin==undefined)
		admin = await client.fetchUser(auth.admin,true);
	if(admin!=undefined)
		admin.send(message)
			.catch(err => console.error(err));
}

exports.msgLogChannel = async function (message){
	if(!message) return;
	message = message.replace(/`/g,"\\`");
	client.shard.broadcastEval(`
		var channel = this.channels.get('${logChannel}');
		if(channel!=undefined)
			channel.send(\`${message}\`);
	`);
}

exports.msgModLogChannel = async function (message){
	if(!message) return;
	message = message.replace(/`/g,"\\`");
	client.shard.broadcastEval(`
		var channel = this.channels.get('${modLogChannel}');
		if(channel!=undefined)
			channel.send(\`${message}\`);
	`);
}

exports.client = function(tClient){
	client = tClient;
}
