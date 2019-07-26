/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const baseURL = "https://cdn.discordapp.com/emojis/";
const permissions = require('../../../json/permissions.json');
const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';
const stealEmoji = '🕵';
const errorEmoji = '';
const successMsg = "Successfully stolen"
const failureMsg = "Failed to steal"

module.exports = new CommandInterface({

	alias:["emoji","enlarge","jumbo"],

	args:"{setguild|unsetguild|previous|emoji1 emoji2 emoji3...}",

	desc:"Enlarge an emoji! You can list multiple emojis are use the 'previous' keyword to enlarge an emoji from the message above you!\nYou can also steal emojis if you use 'owo emoji setguild'.",

	example:["owo emoji previous","owo emoji setguild"],

	related:[],

	cooldown:7000,
	half:100,
	six:500,

	execute: async function(p){
		/* Look at previous message */
		if(p.args.length==0||p.args[0]&&(p.args[0].toLowerCase()=="prev"||p.args[0].toLowerCase()=="previous"||p.args[0].toLowerCase()=="p")){
			let msgs = (await p.msg.channel.messages.fetch({limit:10,before:p.msg.id})).array();
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

async function display(p,emojis){
	let loc = 0;
	let embed = createEmbed(p,loc,emojis);
	let msg = await p.send({embed});

	// Check if user set stealing
	let sql = `SELECT emoji_steal.guild FROM emoji_steal INNER JOIN user ON emoji_steal.uid = user.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	let canSteal;
	if(result[0]){
		canSteal = result[0].guild;
	}

	let saved = {};
	let save = function(loc,id,message){
		if(!saved[loc]) saved[loc] = {success:[],failure:[]};
		if(message==successMsg){
			saved[loc].success.push(id);
		}else if(!saved[loc].failure.includes(id)){
			saved[loc].failure.push(id);
		}
		embed = createEmbed(p,loc,emojis,saved);
		msg.edit({embed});
	}

	/* Add a reaction collector to update the pages */
	await msg.react(prevPageEmoji);
	await msg.react(nextPageEmoji);
	if(canSteal) await msg.react(stealEmoji);

	let filter = (reaction,user) => {
		// I need to deal with the steal in the filter since the Discord.Js does not return the user id on 'collect'
		if(reaction.emoji.name==stealEmoji){

			// if user has already stolen the emoji, ignore
			if(saved[loc]&&saved[loc].success.includes(user.id)) return;

			let sql = `SELECT emoji_steal.guild FROM emoji_steal INNER JOIN user ON emoji_steal.uid = user.uid WHERE id = ${user.id};`;
			p.query(sql).then(function(result){
				if(!result[0])
					return;

				// Parse steal server id
				let guild = result[0].guild;


				//Save the emoji
				let name = emojis[loc].name;
				let url = emojis[loc].url;
				addEmoji(p,name,url,guild,loc,user.id,save);
			});

		}

		return (reaction.emoji.name===nextPageEmoji||reaction.emoji.name===prevPageEmoji||(canSteal&&reaction.emoji.name===stealEmoji))&&user.id==p.msg.author.id;
	}
	let collector = await msg.createReactionCollector(filter,{time:120000});


	/* Flip the page if reaction is pressed */
	collector.on('collect', async function(r,c){
		/* Save the animal's action */
		if(r.emoji.name===nextPageEmoji&&loc+1<emojis.length) {
			loc++;
			embed = createEmbed(p,loc,emojis,saved);
			await msg.edit({embed});
		}
		if(r.emoji.name===prevPageEmoji&&loc>0){
			loc--;
			embed = createEmbed(p,loc,emojis,saved);
			await msg.edit({embed});
		}
	});

	collector.on('end',async function(collected){
		embed = createEmbed(p,loc,emojis,saved);
		embed.color = 6381923;
		await msg.edit("This message is now inactive",{embed});
	});

}

function createEmbed(p,loc,emojis,saved={}){
	let emoji = emojis[loc];
	if(!emoji) emoji = p.client.user.avatarURL();

	let embed = {
		"author":{
			"name":"Enlarged Emojis!",
			"url":emoji.url,
			"icon_url":p.msg.author.avatarURL()
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

	let message = saved[loc];
	if(message){
		if(message.success.length){
			embed.footer.text += " - "+successMsg+(message.success.length>1?' x'+message.success.length:'');
			embed.color = 65280;
		}else{
			embed.footer.text += " - "+failureMsg+(message.failure.length>1?' x'+message.failure.length:'');
			embed.color = 16711680;
		}
	}

	return embed;
}

async function setServer(p){
	// Check if the user has emoji permissions
	if(!p.msg.member.hasPermission('MANAGE_EMOJIS')){
		p.errorMsg(", you do not have permissions to edit emojis on this server!",3000);
		return;
	}

	// Check if the bot has permissions
	if(!p.msg.guild.me.hasPermission('MANAGE_EMOJIS')){
		let link = await p.client.generateInvite(permissions);
		p.errorMsg(", I don't have permissions to add emojis! Please give me permission or reinvite me!\n"+link);
		return;
	}
	

	let sql = `INSERT INTO emoji_steal (uid,guild) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),${p.msg.guild.id}) ON DUPLICATE KEY UPDATE guild = ${p.msg.guild.id};`;
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

async function addEmoji(p,name,url,guild,loc,id,callback){
	let result = await p.client.shard.broadcastEval(`(function(client){
		let guild = client.guilds.get('${guild}');
		if(guild==undefined) return;
		if(!guild.me.hasPermission('MANAGE_EMOJIS')) return;
		guild.emojis.create('${url}','${name}');
		return guild.emojis.size;
	}(this))`);
	let emoji;
	for(let i in result){
		if(result[i]) emoji = result[i];
	}

	if(!emoji||!p.global.isInt(emoji)){
		callback(loc,id,failureMsg);
		return;
	}

	setTimeout(async function(){
		let result = await p.client.shard.broadcastEval(`(function(client){
			let guild = client.guilds.get('${guild}');
			if(guild==undefined) return;
			return guild.emojis.size;
		}(this))`);
		let after;
		for(let i in result){
			if(result[i]) after= result[i];
		}

		if(!p.global.isInt(after)||emoji==after){
			callback(loc,id,failureMsg);
			return;
		}

		callback(loc,id,successMsg);
		
	},1000);
}
