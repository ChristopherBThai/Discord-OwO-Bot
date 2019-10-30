/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';
const ud = require('urban-dictionary');
var count = 0;

module.exports = new CommandInterface({

	alias:["define"],

	args:"{word}",

	desc:"I shall define thy word!",

	example:["owo define tsundere"],

	related:[],

	permissions:["SEND_MESSAGES","EMBED_LINKS","ADD_REACTIONS"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		var word = p.args.join(" ");
		if(word==""){
			p.send("**🚫 |** Silly human! Makes sure to add a word to define!",3000);
			return;
		}
		try{
			await ud.term(word, function(error,entries,tags,sounds){
				try{
				if(error){
					p.send("**🚫 |** I couldn't find that word! :c",3000);
				}else{
					let pages = [];
					let count = 1;
					for(let i=0;i<entries.length;i++){
						let def = entries[i].definition;
						let url = entries[i].permalink;
						let example = "\n*``"+entries[i].example+" ``*";
						let result = def+example;
						let run = true;
						do{
							let print = "";
							if(result.length>1700){
								print = result.substring(0,1700);
								result = result.substring(1700);
							}else{
								print = result;
								run = false;
							}
							var embed = {
								"description": print,
								"color": p.config.embed_color,
								"author": {
									"name": "Definition of '"+entries[0].word+"'",
									"icon_url": p.msg.author.avatarURL()
									},
								"url":url,
								"footer":{
									"text": "Definition "+(count)+"/"+(entries.length)
								}
							};
							pages.push({embed});
						}while(run);
						count++;
					}
					display(p,pages);
				}
				}catch(err){console.error(err);}
			});
		}catch(err){}
	}

})

async function display(p,pages){
	let loc = 0;
	let msg = await p.send(pages[loc]);

	/* Add a reaction collector to update the pages */
	await msg.react(prevPageEmoji);
	await msg.react(nextPageEmoji);

	let filter = (reaction,user) => (reaction.emoji.name===nextPageEmoji||reaction.emoji.name===prevPageEmoji)&&user.id===p.msg.author.id;
	let collector = await msg.createReactionCollector(filter,{time:120000});

	/* Flip the page if reaction is pressed */
	collector.on('collect', async function(r){
		/* Save the animal's action */
		if(r.emoji.name===nextPageEmoji&&loc+1<pages.length) {
			loc++;
			await msg.edit(pages[loc]);
		}
		if(r.emoji.name===prevPageEmoji&&loc>0){
			loc--;
			await msg.edit(pages[loc]);
		}
	});

	collector.on('end',async function(collected){
		embed = pages[loc];
		embed.embed.color = 6381923;
		await msg.edit("This message is now inactive",embed);
	});
}
