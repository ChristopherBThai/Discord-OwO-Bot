const request = require('request');
const global = require('./global');
const disabled = true;

exports.give = function (msg, receiver, amount) {
	if (disabled) return;
	const info = {
		senderId: msg.author.id,
		senderName: global.getUniqueName(msg.author),
		receiverId: receiver.id,
		receiverName: global.getUniqueName(receiver),
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
		senderName: global.getUniqueName(sender),
		receiverId: receiver.id,
		receiverName: global.getUniqueName(receiver),
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
		senderName: global.getUniqueName(msg.author),
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
		senderName: global.getUniqueName(msg.author),
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
