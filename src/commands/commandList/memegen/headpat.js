/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const request = require('request');
const imagegenAuth = require('../../../../../tokens/imagegen.json');

module.exports = new CommandInterface({

	alias:["headpat"],

	args:"@user",

	desc:"Create a headpat emoji! You can add it to server if you have used `owo emoji set`",

	example:[],

	related:["owo emoji"],

	permissions:["sendMessages","embedLinks","attachFiles"],

	group:["memegeneration"],

	cooldown:30000,
	half:100,
	six:500,
	bot:true,

	execute: async function(p){
		user = p.getMention(p.args[0]);
		if (!user && p.args.length > 0) {
			p.errorMsg(", you must tag a user!", 5000);
			p.setCooldown(5);
			return;
		} else if (!user) {
			user = p.msg.author
		}

		try {
			const uuid = await fetchImage(p, user);
			const url = `${imagegenAuth.imageGenUrl}/img/${uuid}.gif`
			await display(p, url, user);
		} catch (err) {
			p.errorMsg(", Failed to generate gif. Try again later.", 3000);
			p.setCooldown(5);
		}
	}

})

async function display (p, url, user) {
	const emojiName = `${user.username.replace(/[^\w]/gi,'')}_pat`
	let embed = createEmbed(p, url, user, emojiName);
	let msg = await p.send({embed});

	// Check if user set stealing
	let sql = `SELECT emoji_steal.guild FROM emoji_steal INNER JOIN user ON emoji_steal.uid = user.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	let canSteal = (await p.query(sql))[0]?.guild;

	// Add reactions
	if(canSteal) await msg.addReaction(p.config.emoji.steal);

	// Create reaction collector
	let filter = (emoji, userId) => emoji.name == p.config.emoji.steal && userId != p.client.user.id;
	const collector = p.reactionCollector.create(msg, filter, {idle:120000});
	const emojiAdder = new p.EmojiAdder(p, emojiName, url);

	collector.on('collect', async function (emoji, userId) {
		try {
			if (await emojiAdder.addEmoji(userId)) {
				await msg.edit({embed: createEmbed(p, url, user, emojiName, emojiAdder)});
			}
		} catch (err) {
			if (!emojiAdder.successCount) {
				await msg.edit({embed: createEmbed(p, url, user, emojiName, emojiAdder)});
			}
		}
	});

	collector.on('end',async function(collected){
		const embed = createEmbed(p, url, user, emojiName, emojiAdder);
		embed.color = 6381923;
		await msg.edit({content:"This message is now inactive",embed});
	});
}

function createEmbed (p, url, user, emojiName, emojiAdder) {
	const embed = {
		"author":{
			"name": `${p.msg.author.username} pats ${user.username}!`,
			"url": url,
			"icon_url": p.msg.author.avatarURL
		},
		"description":`\`${emojiName}\``,
		"color":p.config.embed_color,
		"image":{
			"url":url
		},
		"url":url,
		"footer":{}
	}

	if (emojiAdder) {
		if (emojiAdder.successCount) {
			embed.footer.text = "Emoji added!"+(emojiAdder.successCount>1 ? ' x'+emojiAdder.successCount : '');
			embed.color = 65280;
		} else {
			embed.footer.text = "Failed to add emoji"+(emojiAdder.failureCount>1 ? ' x'+emojiAdder.failureCount : '');
			embed.color = 16711680;
		}
	}

	return embed
}

async function fetchImage (p, user) {
	const info = {
		avatarLink: user.dynamicAvatarURL("png", 128),
		password: imagegenAuth.password
	}

	return new Promise( (resolve, reject) => {
		try {
			let req = request({
				method:'POST',
				uri:imagegenAuth.imageApiUri+"/headpat",
				json:true,
				body: info,
			},(error,res,body)=>{
				if(error){
					reject();
					return;
				}
				if(res.statusCode==200)
					resolve(body);
				else
					reject();
			});
		} catch (err) {
			reject();
		}
	});

}

