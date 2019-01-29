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
			return msg.channel.send(message,embed)
				.then(message => message.delete(del))
				.catch(err => console.error(err));
		else
			return msg.channel.send(message,embed)
				.catch(err => console.error(err));
	}
}

/**
 * Sends a msg to channel
 */
exports.reply = function(msg){
	return function(emoji,message,del,embed){
		var username = msg.author.username;
		if(del)
			msg.channel.send(`**${emoji} | ${username}**`+message,embed)
				.then(message => message.delete(del))
				.catch(err => console.error(err));
		else
			msg.channel.send(`**${emoji} | ${username}**`+message,embed)
				.catch(err => console.error(err));
	}
}

/**
 * Sends a msg to channel
 */
exports.error = function(errorEmoji,msg){
	return function(message,del,embed){
		var username = msg.author.username;
		var emoji = errorEmoji;
		if(del)
			msg.channel.send(`**${emoji} | ${username}**`+message,embed)
				.then(message => message.delete(del))
				.catch(err => console.error(err));
		else
			msg.channel.send(`**${emoji} | ${username}**`+message,embed)
				.catch(err => console.error(err));
	}
}

/**
 * DM a user
 */
exports.msgUser = async function(id,msg){
	id = id.match(/[0-9]+/)[0];
	var user = await client.fetchUser(id,false).catch((err)=>{});
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

exports.msgChannel = async function (id,message,options){
	if(!message||!id) return;
	id = id.match(/[0-9]+/)[0];
	process.send({
		type:"sendChannel",
		to:id,
		msg:message,
		options
	});
}

exports.msgLogChannel = async function (message){
	if(!message) return;
	process.send({
		type:"sendChannel",
		to:logChannel,
		msg:message
	});
}

exports.msgModLogChannel = async function (message){
	if(!message) return;
	process.send({
		type:"sendChannel",
		to:modLogChannel,
		msg:message
	});
}

exports.client = function(tClient){
	client = tClient;
}
