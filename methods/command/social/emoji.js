const CommandInterface = require('../../commandinterface.js');

const baseURL = "https://cdn.discordapp.com/emojis/";
const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';

module.exports = new CommandInterface({
	
	alias:["emoji","enlarge","jumbo"],

	args:"{previous|emoji1 emoji2 emoji3...}",

	desc:"Enlarge an emoji! You can list multiple emojis are use the 'previous' keyword to enlarge an emoji from the message above you!",

	example:[],

	related:[],

	cooldown:7000,
	half:100,
	six:500,

	execute: async function(p){
		/* Invalid arguments */
		if(p.args.length==0){
			p.errorMsg(", Invalid arguments! Please list the emojis!");
			return;

		/* Look at previous message */
		}else if(p.args[0]&&(p.args[0].toLowerCase()=="prev"||p.args[0].toLowerCase()=="previous")){
			let msgs = (await p.msg.channel.fetchMessages({limit:5,before:p.msg.id})).array();
			if(!msgs){
				p.errorMsg(", There are no emojis! >:c");
				return;
			}
			let emojis = "";
			for(let i in msgs){
				emojis += msgs[i].content;
			}

			emojis = parseIDs(emojis);
			if(!emojis) p.errorMsg(", There are no emojis! >:c");
			else await display(p,emojis);

		/* Look at current message */
		}else{
			let text = p.args.join(" ");
			let emojis = parseIDs(text);
			if(emojis.length==0)
				p.errorMsg(", There are no emojis! >:c");
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

	/* Add a reaction collector to update the pages */
	await msg.react(prevPageEmoji);
	await msg.react(nextPageEmoji);

	let filter = (reaction,user) => (reaction.emoji.name===nextPageEmoji||reaction.emoji.name===prevPageEmoji)&&user.id===p.msg.author.id;
	let collector = await msg.createReactionCollector(filter,{time:120000});
	
	/* Flip the page if reaction is pressed */
	collector.on('collect', async function(r){
		/* Save the animal's action */
		if(r.emoji.name===nextPageEmoji&&loc+1<emojis.length) {
			loc++;
			embed = createEmbed(p,loc,emojis);
			await msg.edit({embed});
		}
		if(r.emoji.name===prevPageEmoji&&loc>0){
			loc--;
			embed = createEmbed(p,loc,emojis);
			await msg.edit({embed});
		}
	});

	collector.on('end',async function(collected){
		embed = createEmbed(p,loc,emojis);
		embed.color = 6381923;
		await msg.edit("This message is now inactive",{embed});
	});

}

function createEmbed(p,loc,emojis){
	let emoji = emojis[loc];
	let embed = {
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
	return embed;
}



