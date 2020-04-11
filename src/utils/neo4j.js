const request = require('request');

let neo4j_auth;

try {
	neo4j_auth = require('../../../tokens/owo-neo4j.json');
} catch (err) {
	console.error("'../tokens/owo-neo4j.json' not found. Skipping neo4j logging");
}

exports.give = function(msg, receiver, amount) {
	return;
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
