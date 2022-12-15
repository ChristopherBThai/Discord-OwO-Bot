/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const request = require('request');
const disabled = true;
const { NEO4J_HOST, NEO4J_PASS } = process.env;

exports.give = function(msg, receiver, amount) {
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
		password: NEO4J_PASS
	};
	request({
		method: 'POST',
		uri: `${NEO4J_HOST}/give`,
		json:true,
		body: info
	}, (error) => {
		if (error) console.error(error);
	});
};

exports.battle = function(msg, sender, receiver, amount) {
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
		password: NEO4J_PASS
	};
	request({
		method: 'POST',
		uri: `${NEO4J_HOST}/battle`,
		json: true,
		body: info
	}, (error) => {
		if (error) console.error(error);
	});
};

exports.drop = function(msg, amount) {
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
		password: NEO4J_PASS
	};
	request({
		method: 'POST',
		uri: `${NEO4J_HOST}/drop`,
		json: true,
		body: info
	}, (error) => {
		if (error) console.error(error);
	});
};

exports.pickup = function(msg, amount) {
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
		password: NEO4J_PASS
	};
	request({
		method: 'POST',
		uri: `${NEO4J_HOST}/pickup`,
		json: true,
		body: info,
	}, (error) => {
		if (error) console.error(error);
	});
};
