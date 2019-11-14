/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
var client,pubsub;
var auth = require('../../../tokens/owo-auth.json');
var admin;
var logChannel = "469352773314412555";
var modLogChannel = "471579186059018241";

/**
 * Sends a msg to channel
 */
exports.send = function(msg){
	return function(content,del,file,opt){
		if(del)
			return msg.channel.createMessage(content,file)
				.then(message => setTimeout(function(){
					try{message.delete();}catch(e){}
				},del))
		else
			return msg.channel.createMessage(content,file)
	}
}

/**
 * Sends a msg to channel
 */
exports.reply = function(msg){
	return function(emoji,content,del,file,opt){
		let username = msg.author.username;
		let tempContent = {};
		if(typeof content === "string")
			tempContent.content = `**${emoji} | ${username}**${content}`;
		else{
			tempContent = {...content};
			tempContent.content = `**${emoji} | ${username}**${content.content}`;
		}

		if(del)
			return msg.channel.createMessage(tempContent,file)
				.then(message => setTimeout(function(){
					try{message.delete();}catch(e){}
				},del))
		else
			return msg.channel.createMessage(tempContent,file)
	}
}

/**
 * Sends a msg to channel
 */
exports.error = function(errorEmoji,msg){
	return function(content,del,file,opt){
		let username = msg.author.username;
		let emoji = errorEmoji;
		let tempContent = {};
		if(typeof content === "string")
			tempContent.content = `**${emoji} | ${username}**${content}`;
		else{
			tempContent = {...content};
			tempContent.content = `**${emoji} | ${username}**${content.content}`;
		}

		if(del)
			return msg.channel.createMessage(tempContent,file)
				.then(message => setTimeout(function(){
					try{message.delete();}catch(e){}
				},del))
		else
			return msg.channel.createMessage(tempContent,file)
	}
}

/**
 * DM a user
 */
exports.msgUser = async function(id,msg){
	id = id.match(/[0-9]+/)[0];
	var user = await client.users.fetch(id,false).catch((err)=>{});
	var success;
	if(user)
		await user.send(msg)
		.then(success = {username:user.username,id:user.id,tag:user.tag})
		.catch(err => success = false);
	return success;
}

/**
 * Sends a message to an admin
 */
exports.msgAdmin = async function (message){
	if(admin==undefined)
		admin = await client.users.fetch(auth.admin,true);
	if(admin!=undefined)
		admin.send(message)
			.catch(err => console.error(err));
}

exports.msgChannel = async function (channel,msg,options){
	if(!msg||!channel) return;
	channel = channel.match(/[0-9]+/)[0];
	let message = await client.createMessage(channel,msg);

	// Add reactions if there are any
	if(options&&options.react){
		for(let i in options.react){
			await message.addReaction(options.react[i]);
		}
	}
}

exports.msgLogChannel = async function (msg){
	if(!msg) return;
	client.createMessage(logChannel,msg);
}

exports.msgModLogChannel = async function (msg){
	if(!msg) return;
	client.createMessage(modLogChannel,msg);
}

exports.init = function(main){
	client = main.bot;
	pubsub = main.pubsub;
}
