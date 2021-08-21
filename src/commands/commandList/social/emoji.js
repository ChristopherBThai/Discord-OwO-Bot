/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const baseURL = "https://cdn.discordapp.com/emojis/";
const permissions = require('../../../data/permissions.json');
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';
const stealEmoji = '🕵️';
const errorEmoji = '';

module.exports = new CommandInterface({

	alias:["emoji","enlarge","jumbo"],

	args:"{setguild|unsetguild|previous|emoji1 emoji2 emoji3...}",

	desc:"Enlarge an emoji! You can list multiple emojis are use the 'previous' keyword to enlarge an emoji from the message above you!\nYou can also steal emojis if you use 'owo emoji setguild'.",

	example:["owo emoji previous","owo emoji setguild"],

	related:[],

	permissions:["sendMessages","embedLinks","addReactions"],

	group:["social"],

	cooldown:7000,
	half:100,
	six:500,

	execute: async function(p){
		/* Look at previous message */
		if(p.args.length==0||p.args[0]&&(p.args[0].toLowerCase()=="prev"||p.args[0].toLowerCase()=="previous"||p.args[0].toLowerCase()=="p")){
			let msgs = await p.msg.channel.getMessages(10);
			if(!msgs){
				p.errorMsg(", There are no emojis! >:c",3000);
				return;
			}
			let emojis = "";
			for(let i in msgs){
				emojis += msgs[i].content;
			}

			emojis = parseIDs(emojis);
			if(emojis.length==0) p.errorMsg(", There are no emojis! I can only look at the previous 10 messages! >:c",3000);
			else await display(p,emojis);

		// Set emoji steal guild
		}else if(["setguild","setserver","set","setsteal"].includes(p.args[0].toLowerCase())){
			setServer(p);

		// unset emoji steal guild
		}else if(["unsetguild","unsetserver","unset","unsetsteal"].includes(p.args[0].toLowerCase())){
			unsetServer(p);

		/* Look at current message */
		}else{
			let text = p.args.join(" ");
			let emojis = parseIDs(text);
			if(emojis.length==0)
				p.errorMsg(", There are no emojis! >:c",3000);
			else
				await display(p,emojis);
		}

	}

})

function parseIDs(text){
	let emojis = [];

	let parsedEmojis = text.match(/<a?:[a-z0-9_]+:[0-9]+>/gi);

	for(let i in parsedEmojis){
		let emoji = parsedEmojis[i];
		let name = emoji.match(/:[a-z0-9_]+:/gi)[0].substr(1).slice(0,-1);
		let id = emoji.match(/:[0-9]+>/gi)[0].substr(1).slice(0,-1);
		let gif = (emoji.match(/<a:/gi)?true:false);
		let url = baseURL+id+(gif?".gif":".png");
		emojis.push({name,id,gif,url});
	}

	return emojis;
}

async function display(p, emojis){
	let loc = 0;
	let embed = createEmbed(p, loc, emojis);
	let msg = await p.send({embed});

	// Check if user set stealing
	let sql = `SELECT emoji_steal.guild FROM emoji_steal INNER JOIN user ON emoji_steal.uid = user.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	let canSteal = (await p.query(sql))[0]?.guild;

	// Add reactions
	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);
	if(canSteal) await msg.addReaction(stealEmoji);

	// Create reaction collector
	let filter = (emoji, userId) => {
		if(emoji.name == stealEmoji && userId != p.client.user.id){
			return true;
		}else return ([nextPageEmoji,prevPageEmoji].includes(emoji.name) && userId == p.msg.author.id);
	}
	let collector = p.reactionCollector.create(msg, filter, {idle:120000});

	// Logic to respond to reactions
	const emojiAdders = [];
	collector.on('collect', async function(emoji,userId){
		if(emoji.name===nextPageEmoji&&loc+1<emojis.length) {
			loc++;
			await msg.edit({embed: createEmbed(p, loc, emojis, emojiAdders)});
		}else if(emoji.name===prevPageEmoji&&loc>0){
			loc--;
			await msg.edit({embed: createEmbed(p, loc, emojis, emojiAdders)});
		}else if(emoji.name===stealEmoji){
			if (!emojiAdders[loc]) emojiAdders[loc] = new p.EmojiAdder(p, emojis[loc].name, emojis[loc].url);
			try {
				if (await emojiAdders[loc].addEmoji(userId)) {
					await msg.edit({embed: createEmbed(p, loc, emojis, emojiAdders)});
				}
			} catch (err) {
				if (!emojiAdders[loc].successCount) {
					await msg.edit({embed: createEmbed(p, loc, emojis, emojiAdders)});
				}
			}
		}
	});

	collector.on('end',async function(collected){
		const embed = createEmbed(p, loc, emojis, emojiAdders)
		embed.color = 6381923;
		await msg.edit({content:"This message is now inactive",embed});
	});

}

function createEmbed(p, loc, emojis, emojiAdders){
	const emoji = emojis[loc];

	const embed = {
		"author":{
			"name":"Enlarged Emojis!",
			"url":emoji.url,
			"icon_url":p.msg.author.avatarURL
		},
		"description":`\`${emoji.name}\` \`${emoji.id}\``,
		"color":p.config.embed_color,
		"image":{
			"url":emoji.url
		},
		"url":emoji.url,
		"footer":{
			"text": "page "+(loc+1)+"/"+(emojis.length)
		}
	}

	const emojiAdder = emojiAdders?.[loc];
	if (emojiAdder) {
		if (emojiAdder.successCount) {
			embed.footer.text += " - Successfully stolen"+(emojiAdder.successCount>1 ? ' x'+emojiAdder.successCount : '');
			embed.color = 65280;
		} else {
			embed.footer.text += " - Failed to steal"+(emojiAdder.failureCount>1 ? ' x'+emojiAdder.failureCount : '');
			embed.color = 16711680;
		}
	}

	return embed;
}

async function setServer(p){
	// Check if the user has emoji permissions
	if(!p.msg.member.permissions.has('manageEmojis')){
		p.errorMsg(", you do not have permissions to edit emojis on this server!",3000);
		return;
	}

	// Check if the bot has permissions
	if(!p.msg.channel.guild.members.get(p.client.user.id).permissions.has("manageEmojis")){
		p.errorMsg(", I don't have permissions to add emojis! Please give me permission or reinvite me!\n"+p.config.invitelink);
		return;
	}
	

	let sql = `INSERT INTO emoji_steal (uid,guild) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),${p.msg.channel.guild.id}) ON DUPLICATE KEY UPDATE guild = ${p.msg.channel.guild.id};`;
	try{
		await p.query(sql);
	}catch(e){
		if(e.code=="ER_BAD_NULL_ERROR"){
			sql = `INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0);`+sql;
			await p.query(sql);
		}
	}

	p.replyMsg(stealEmoji,", stolen emojis will now be sent to this server!");
}

async function unsetServer(p){
	let sql = `DELETE FROM emoji_steal WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	await p.query(sql);
	p.replyMsg(stealEmoji,", your server has been unset for stealing!");
}
