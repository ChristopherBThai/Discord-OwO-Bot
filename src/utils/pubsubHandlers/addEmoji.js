/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */


exports.handle = async function(main, message){
	// Parse info
	let {loc,buffer,guild,name,userID,callbackID,url} = JSON.parse(message);
	if(!guild||!name||!userID||!callbackID||!url||loc==undefined) return;

	// Grab guild
	guild = main.bot.guilds.get(guild);
	if(!guild) return;

	//Check if the bot has permission
	if(!guild.members.get(main.bot.user.id).permission.has("manageEmojis")){
		main.pubsub.publish("addEmojiCallback",{error:true,callbackID});
	}else{
		try{
			let data = buffer;
			if(!data){
				data = await main.DataResolver.urlToBufferString(url);
			}
			await guild.createEmoji({name,image:data},"Requested by "+userID);
			if(buffer)
				main.pubsub.publish("addEmojiCallback",{callbackID,loc});
			else
				main.pubsub.publish("addEmojiCallback",{buffer:data,callbackID,loc});
		}catch(err){
			main.pubsub.publish("addEmojiCallback",{error:true,callbackID});
		}
	}
}

