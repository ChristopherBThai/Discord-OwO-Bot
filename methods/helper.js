//+========================================+
//||					  ||
//||		HELPER METHODS		  ||
//||					  ||
//+========================================+


/**
 * Checks if its an integer
 * @param {string}	value - value to check if integer
 *
 */
exports.isInt = function(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}

/**
 * Shows the help message
 * @param {discord.Channel}	channel - The channel the message was sent in
 *
 */
exports.showHelp = function(channel){
	const embed = "This bot will count how many times you type 'owo'! Spamming 'owo' will not count!!!\nThere are multiple rankings for points, cowoncy, and zoo!\n\n**Commands**"+ 
			"\n```md\n# Main Commands"+
			"\n< owo top points|guild|zoo|money [global] {count}\n>\tDisplays the top rankings!\n>\te.g `owo top zoo global`, `owo top points 25`, `owo top money global 25`"+
			"\n< owo my points|guild|zoo|money [global]\n>\tdisplays your ranking\n>\tYou can also shorten the words like `owo my z g`"+
			"\n# Economy"+
			"\n< owo money >\t\t\t\t\tDisplays how much cowoncy you have!"+
			"\n< owo give {@user} {amount} >\tGive someone your cowoncy!"+
			"\n< owo daily >\t\t\t\t\tGrab your free daily cowoncy!"+
			"\n< owo vote >\t\t\t\t\t Vote for OwO bot to get free daily cowoncy!"+
			"\n# Fun"+
			"\n< owo zoo >\t\t\t\t\t  Displays your zoo!"+
			"\n< owo hunt >\t\t\t\t\t Fetch animals for your zoo!"+
			"\n< owo slots {amount} >\t\t   Gamble your cowoncy!!"+
			"\n< owo lottery {amount} >\t\t 24H Lottery! Feeling lucky?"+
			"\n< owo 8b {question} >\t\t\tReplies as a yes/no answer"+
			"\n< owo define {word} >\t\t\tDefines a word!"+
			"\n< owo gif|pic {type} >\t\t   Grabs a Image!"+
			"\n< owo pet|slap|hug|etc {@user} > Hug someone~!"+
			"\n# Utility"+
			"\n< owo feedback {message} >\t   Sends a message to an admin"+
			"\n< owo stats >\t\t\t\t\tGrab some bot stats!"+
			"\n< owo link >\t\t\t\t\t Want to add the bot to another server?? :D"+
			"\n< owo guildlink >\t\t\t\tCome join our server!```"+
			"\n```# Remove brackets when typing commands\n# [] = optional arguments\n# {} = optional user input```";
	channel.send(embed);
}

/**
 * Shows a link to invite this bot
 * @param {discord.Channel}	channel - The channel the message was sent in
 *
 */
exports.showLink = function(msg){
	var channel = msg.channel;
	const embed = {
		"title":"OwO! Click me to invite me to your server!",
		"url":"https://discordapp.com/api/oauth2/authorize?client_id=408785106942164992&permissions=444480&scope=bot",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
	};
	channel.send({embed})
		.catch(err => channel.send("I don't have permission to send embedded links! :c"));
}


/**
 * Link for support guild
 *
 */
exports.guild= function(msg){
	var channel = msg.channel;
	const embed = {
		"title":"OwO! Click me to join the support channel!",
		"url":"https://discord.gg/VKesv7J",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
	};
	channel.send({embed})
		.catch(err => channel.send("I don't have permission to send embedded links! :c"));
}

/**
 * Show bot's info
 * @param {mysql.connection}	con
 * @param {discord.message}	msg
 */
exports.showStats = function(client, con, msg){
	var sql = "SELECT COUNT(*) user, "+
		"sum(count) total "+
		"FROM user";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		const embed = {
		"description": "Here's a little bit of information! If you need help with commands, type `owo help`.",
			"color": 1,
			"timestamp": new Date(),
			"author": {"name": "OwO Bot Information",
				"url": "https://discordapp.com/api/oauth2/authorize?client_id=408785106942164992&permissions=444480&scope=bot",
				"icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"fields": [{"name":"Current Guild",
					"value":"```md\n<channelID: "+msg.channel.id+">\n<guildID:   "+msg.guild.id+">```"},
				{"name": "Global information",
					"value": "```md\n<TotalOwOs:  "+rows[0].total+">\n<OwOUsers:   "+rows[0].user+">```"},
				{"name": "Bot Information",
					"value": "```md\n<Guilds:    "+client.guilds.size+">\n<Channels:  "+client.channels.size+">\n<Users:     "+client.users.size+">``````md\n<Ping:       "+client.ping+"ms>\n<UpdatedOn:  "+client.readyAt+">\n<Uptime:     "+client.uptime+">```"
				}]
		};
		msg.channel.send({embed})
			.catch(err => msg.channel.send("I don't have permission to send embedded links! :c"));
	});
}
