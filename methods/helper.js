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
	const embed = "This bot will count how many times you type 'owo'! Spamming 'owo' will not count!!!\nThere are three types of rankings\n\t1. Users in server\n\t2. Users globally\n\t3. Guilds globally\n\n**Commands**"+ 
			"\n```md\n< owo help \n>\tDisplays this commands list!"+
			"\n\n< owo top [global|guild] {count}\n>\tDisplays the ranking of OwOs\n>\te.g `owo top global`, `owo top 25`, `owo top guild 25`"+
			"\n\n< owo me|guild\n>\tdisplays your or your guild's ranking"+
			"\n\n< owo {question}?\n>\treplies as a yes/no answer\n>\te.g. `owo Am I cute?`"+
			"\n\n< owo feedback|suggestion|report {message}\n>\tsends a message to an admin who will reply back\n>\te.g `owo feedback I love this bot!`"+
			"\n\n< owo disablerank|enablerank\n>\tdisables/enables the command 'owo rank' on the current channel"+
			"\n\n< owo link\n>\tWant to add the bot to another server?? :D```"+
			"\n```# Remove brackets when typing commands\n# [] = optional arguments\n# {} = optional user input```";
	channel.send(embed);
}

/**
 * Shows a link to invite this bot
 * @param {discord.Channel}	channel - The channel the message was sent in
 *
 */
exports.showLink = function(channel){
	const embed = {
		"title":"OwO! Click me to invite me to your server!",
		"url":"https://discordapp.com/oauth2/authorize?client_id=408785106942164992&permissions=2048&scope=bot",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
	};
	channel.send({embed});
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
				"url": "https://discordapp.com/api/oauth2/authorize?client_id=408785106942164992&permissions=2048&scope=bot",
				"icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"fields": [{"name":"Current Guild",
					"value":"```md\n<channelID: "+msg.channel.id+">\n<guildID:   "+msg.guild.id+">```"},
				{"name": "Global information",
					"value": "```md\n<TotalOwOs:  "+rows[0].total+">\n<OwOUsers:   "+rows[0].user+">```"},
				{"name": "Bot Information",
					"value": "```md\n<Guilds:    "+client.guilds.size+">\n<Channels:  "+client.channels.size+">\n<Users:     "+client.users.size+">``````md\n<Ping:       "+client.ping+"ms>\n<UpdatedOn:  "+client.readyAt+">\n<Uptime:     "+client.uptime+">```"
				}]
		};
		msg.channel.send({embed});
	});
}
