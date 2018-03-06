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
			"\n< owo money\n>\tDisplays how much cowoncy you have!"+
			"\n< owo give {@user} {amount}\n>\tGive someone your cowoncy!"+
			"\n< owo daily\n>\tGrab your free daily cowoncy!"+
			"\n< owo vote\n>\tVote for OwO bot to get free daily cowoncy!"+
			"\n# Fun"+
			"\n< owo zoo\n>\tDisplays your zoo!"+
			"\n< owo hunt\n>\tFetch animals for your zoo!"+
			"\n< owo slots {amount}\n>\tGamble your cowoncy!!"+
			"\n< owo lottery {amount}\n>\t24H Lottery! Feeling lucky?"+
			"\n< owo 8b {question}\n>\treplies as a yes/no answer\n>\te.g. `owo 8b Am I cute?`"+
			"\n< owo define {word}\n>\tdefines a word!\n>\te.g. `owo define discord`"+
			"\n# Utility"+
			"\n< owo feedback|suggestion|report {message}\n>\tsends a message to an admin who will reply back\n>\te.g `owo feedback I love this bot!`"+
			"\n< owo stats\n>\tGrab some bot stats!"+
			"\n< owo link\n>\tWant to add the bot to another server?? :D"+
			"\n< owo guildlink\n>\tCome join our server!```"+
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
