/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
let client, pubsub, admin;
const auth = require('../../../tokens/owo-auth.json');
const logChannel = "739393782805692476";
const modLogChannel = "471579186059018241";

/**
 * Sends a msg to channel
 */
exports.send = function(msg){
	return function(content,del,file,opt){
		let maxLength = 2000;
		let maxSends = 15;
		let sendCount = 0;
		if(typeof content === "string"&&content.length>=maxLength){
			let prepend = '';
			let append = '';
			if (opt && opt.split) {
				prepend = opt.split.prepend ? opt.split.prepend : '';
				append = opt.split.append ? opt.split.append : '';
			}
			let fragments = content.split("\n");
			let total = content.startsWith(prepend) ? '' : prepend;
			for(let i in fragments){
				if(sendCount>=maxSends){
					// Do not send more than 10 messages
				}else if(total.length+fragments[i].length+append.length>=maxLength){
					if(total===""){
						return createMessage(msg, "ERROR: The message is too long to send");
					}else{
						createMessage(msg, total.endsWith(append) ? total : total + append);
						total = prepend + fragments[i];
						sendCount++;
					}
				}else{
					total += "\n"+fragments[i];
				}
			}
			if(total!==""){
				return createMessage(msg, total);
			}
		}else if(del)
			return createMessage(msg, content, file, del)
		else
			return createMessage(msg, content,file)
	}
}

async function createMessage (msg, content, file, del) {
	if (msg.interaction) {
		if (typeof content === "string") {
			content = { content }
		}
		if (content.embed) {
			content.embeds = [ content.embed ];
			delete content.embed;
		}
		return msg.createMessage(content, file, del);
	} else {
		if (del) {
			const sentMsg = await msg.channel.createMessage(content, file);
			setTimeout(() => {
				sentMsg.delete().catch(() => {console.error(`[${sentMsg.id}] Failed to delete message`)});
			}, del);
			return sentMsg;
		} else {
			return msg.channel.createMessage(content, file);
		}
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

		if(typeof content === "string"&&tempContent.content.length>=2000){
			content = tempContent.content;
			let split = content.split("\n");
			let total = "";
			for(let i in split){
				if(total.length+split[i].length>=2000){
					if(total===""){
						return createMessage(msg, "ERROR: The message is too long to send");
					}else{
						createMessage(msg, total);
						total = split[i];
					}
				}else{
					total += "\n"+split[i];
				}
			}
			if(total!==""){
				return createMessage(msg, total);
			}
		}else if(del)
			return createMessage(msg, tempContent, file, del)
		else
			return createMessage(msg, tempContent, file)
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
			return createMessage(msg, tempContent, file, del)
		else
			return createMessage(msg, tempContent, file)
	}
}

/**
 * DM a user
 */
exports.msgUser = async function(id,msg){
	id = id.match(/[0-9]+/)[0];
	let channel;
	try{
		channel = await client.getDMChannel(id);
	}catch(err){
		return;
	}
	let user = await channel.recipient;
	try{
		if(channel) await channel.createMessage(msg);
	}catch(err){
		// just enough to error log
		return {
			dmError: true,
			id: user.id,
			username: user.username,
			discriminator: user.discriminator
		}
	}
	
	return user;
}

/**
 * Sends a message to an admin
 */
exports.msgAdmin = async function (message){
	if(admin==undefined)
		admin = await client.getDMChannel(auth.admin,true);
	if(admin)
		admin.createMessage(message);
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
