const request = require('request');
const disabled = true;

exports.give = function (msg, receiver, amount) {
	if (disabled) return;
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
		password: process.env.NEO4J_PASS,
	};
	request(
		{
			method: 'POST',
			uri: `${process.env.NEO4J_HOST}/give`,
			json: true,
			body: info,
		},
		(error) => {
			if (error) console.error(error);
		}
	);
};

exports.battle = function (msg, sender, receiver, amount) {
	if (disabled) return;
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
		password: process.env.NEO4J_PASS,
	};
	request(
		{
			method: 'POST',
			uri: `${process.env.NEO4J_HOST}/battle`,
			json: true,
			body: info,
		},
		(error) => {
			if (error) console.error(error);
		}
	);
};

exports.drop = function (msg, amount) {
	if (disabled) return;
	const info = {
		senderId: msg.author.id,
		senderName: `${msg.author.username}#${msg.author.discriminator}`,
		serverId: msg.channel.guild.id,
		serverName: msg.channel.guild.name,
		channelId: msg.channel.id,
		channelName: msg.channel.name,
		transactionAmount: amount,
		transactionTime: Date.now(),
		password: process.env.NEO4J_PASS,
	};
	request(
		{
			method: 'POST',
			uri: `${process.env.NEO4J_HOST}/drop`,
			json: true,
			body: info,
		},
		(error) => {
			if (error) console.error(error);
		}
	);
};

exports.pickup = function (msg, amount) {
	if (disabled) return;
	const info = {
		senderId: msg.author.id,
		senderName: `${msg.author.username}#${msg.author.discriminator}`,
		serverId: msg.channel.guild.id,
		serverName: msg.channel.guild.name,
		channelId: msg.channel.id,
		channelName: msg.channel.name,
		transactionAmount: amount,
		transactionTime: Date.now(),
		password: process.env.NEO4J_PASS,
	};
	request(
		{
			method: 'POST',
			uri: `${process.env.NEO4J_HOST}/pickup`,
			json: true,
			body: info,
		},
		(error) => {
			if (error) console.error(error);
		}
	);
};
