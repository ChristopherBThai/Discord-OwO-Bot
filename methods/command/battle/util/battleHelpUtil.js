const pages = ["https://i.imgur.com/cJ9F3DM.png","https://i.imgur.com/uHyENGL.png","https://i.imgur.com/QjYt5Xv.png","https://i.imgur.com/mFWT5wg.png","https://i.imgur.com/G3zfrc6.png","https://i.imgur.com/9LXG4qy.png"];
const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';

exports.help = async function(p,page=0){
	/* Make sure we don't over or under shoot the page */
	if(page<0) page = 0;
	if(page>=pages.length) page = pages.length-1;

	/* Construct embed message */
	let embed = {
		"author":{
			"name":"Guide to battle!"
		},
		"description":"Have any questions? Please feel free to ask in our server!\n"+p.config.guildlink,
		"color":p.config.embed_color,
		"image":{
			"url":pages[page]
		},
		"footer":{
			"text": "page "+(page+1)+"/"+(pages.length)
		}
	}

	/* Send our initial message */
	let msg = await p.send({embed});

	/* Add a reaction collector to update the pages */
	await msg.react(prevPageEmoji);
	await msg.react(nextPageEmoji);
	let filter = (reaction,user) => (reaction.emoji.name===nextPageEmoji||reaction.emoji.name===prevPageEmoji)&&user.id===p.msg.author.id;
	let collector = await msg.createReactionCollector(filter,{time:60000});
	
	/* Flip the page if reaction is pressed */
	collector.on('collect', async function(r){
		/* Save the animal's action */
		if(r.emoji.name===nextPageEmoji&&page+1<pages.length) {
			page++;
			embed.image.url = pages[page];
			embed.footer.text = "page "+(page+1)+"/"+(pages.length);
			await msg.edit({embed});
		}
		if(r.emoji.name===prevPageEmoji&&page>0){
			page--;
			embed.image.url = pages[page];
			embed.footer.text = "page "+(page+1)+"/"+(pages.length);
			await msg.edit({embed});
		}
	});

	collector.on('end',async function(collected){
		embed.color = 6381923;
		await msg.edit("This message is now inactive",{embed});
	});
}
