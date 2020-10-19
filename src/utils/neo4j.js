const request = require('request');

let neo4j_auth;

try {
	neo4j_auth = require('../../../tokens/owo-neo4j.json');
} catch (err) {
	console.error("'../tokens/owo-neo4j.json' not found. Skipping neo4j logging");
}

neo4j_auth = null;

exports.give = function(msg, receiver, amount) {
	if (!neo4j_auth) return;
	const info = {
		senderId: msg.author.id,
		senderName: `${msg.author.username}#${msg.author.discriminator}`,
		receiverId: receiver.id,
		receiverName: `${receiver.username}#${receiver.discriminator}`,
		serverId: msg.channel.guild.id,
		serverName: msg.channel.guild.name,
		channelId: msg.channel.id,
		channelName: msg.channel.name,
		transactionAmount: amount,
		transactionTime: Date.now(),
		password: neo4j_auth.password
	}
	request({
		method:'POST',
		uri:`${neo4j_auth.url}/give`,
		json:true,
		body: info,
	},(error,res,body)=>{
		if(error) console.error(error);
	});
}

exports.battle = function(msg, sender, receiver, amount) {
	if (!neo4j_auth) return;
	const info = {
		senderId: sender.id,
		senderName: `${sender.username}#${sender.discriminator}`,
		receiverId: receiver.id,
		receiverName: `${receiver.username}#${receiver.discriminator}`,
		serverId: msg.channel.guild.id,
		serverName: msg.channel.guild.name,
		channelId: msg.channel.id,
		channelName: msg.channel.name,
		transactionAmount: amount,
		transactionTime: Date.now(),
		password: neo4j_auth.password
	}
	request({
		method:'POST',
		uri:`${neo4j_auth.url}/battle`,
		json:true,
		body: info,
	},(error,res,body)=>{
		if(error) console.error(error);
	});
}

exports.drop = function(msg, amount) {
	if (!neo4j_auth) return;
	const info = {
		senderId: msg.author.id,
		senderName: `${msg.author.username}#${msg.author.discriminator}`,
		serverId: msg.channel.guild.id,
		serverName: msg.channel.guild.name,
		channelId: msg.channel.id,
		channelName: msg.channel.name,
		transactionAmount: amount,
		transactionTime: Date.now(),
		password: neo4j_auth.password
	}
	request({
		method:'POST',
		uri:`${neo4j_auth.url}/drop`,
		json:true,
		body: info,
	},(error,res,body)=>{
		if(error) console.error(error);
	});
}

exports.pickup = function(msg, amount) {
	if (!neo4j_auth) return;
	const info = {
		senderId: msg.author.id,
		senderName: `${msg.author.username}#${msg.author.discriminator}`,
		serverId: msg.channel.guild.id,
		serverName: msg.channel.guild.name,
		channelId: msg.channel.id,
		channelName: msg.channel.name,
		transactionAmount: amount,
		transactionTime: Date.now(),
		password: neo4j_auth.password
	}
	request({
		method:'POST',
		uri:`${neo4j_auth.url}/pickup`,
		json:true,
		body: info,
	},(error,res,body)=>{
		if(error) console.error(error);
	});
}
