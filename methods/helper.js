//+========================================+
//||					  ||
//||		HELPER METHODS		  ||
//||					  ||
//+========================================+
var help = require('../help.json');
var commands = {};


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
			"\n< owo top "+help.rank.args+"\n>\t"+help.rank.desc_short+"\n>\te.g `owo top zoo global`, `owo top points 25`, `owo top money global 25`"+
			"\n< owo my "+help.my.args+"\n>\t"+help.my.desc_short+"\n>\tYou can also shorten the words like `owo my z g`"+
			"\n# Economy"+
			"\n< owo money "+help.money.args+">\t\t\t\t\t"+help.money.desc_short+
			"\n< owo give "+help.give.args+" >\t"+help.give.desc_short+
			"\n< owo daily >\t\t\t\t\t"+help.daily.desc_short+
			"\n< owo vote >\t\t\t\t\t "+help.vote.desc_short+
			"\n# Fun"+
			"\n< owo zoo >\t\t\t\t\t  "+help.zoo.desc_short+
			"\n< owo hunt >\t\t\t\t\t "+help.hunt.desc_short+
			"\n< owo slots {amount} >\t\t   "+help.slots.desc_short+
			"\n< owo lottery {amount} >\t\t "+help.lottery.desc_short+
			"\n< owo 8b {question} >\t\t\t"+help.b8.desc_short+
			"\n< owo define {word} >\t\t\t"+help.define.desc_short+
			"\n< owo gif|pic {type} >\t\t   "+help.gif.desc_short+
			"\n< owo pet|slap|hug|etc {@user} > "+help.pet.desc_short+
			"\n# Utility"+
			"\n< owo feedback {message} >\t   "+help.feedback.desc_short+
			"\n< owo stats >\t\t\t\t\t"+help.stats.desc_short+
			"\n< owo link >\t\t\t\t\t "+help.link.desc_short+
			"\n< owo guildlink >\t\t\t\t"+help.guildlink.desc_short+"```"+
			"```md\n< owo help {command} >\t\t   For more information on a command!\n> Remove brackets when typing commands\n> [] = optional arguments\n> {} = optional user input```";
	channel.send(embed);
}

/**
 * Shows description of a command
 */
exports.describe = function(msg,command){
	var name = command;
	command = help[commands[command]]
	if(command == undefined){
		msg.channel.send("Could not find that command :c")
			.then(message => message.delete(3000));
		return;
	}
	var desc = "\n# Description\n"+command.desc_long;
	var example = "";
	var related = "";
	var title= "< owo "+name+" ";
	if(command.args!="")
		title+= command.args+" >";
	else
		title += ">";
	if(command.example[0]!=undefined){
		example = "\n# Example Command(s)\n";
		for(i in command.example){
			example += command.example[i]+" , ";
		}
		example = example.substr(0,example.length-3);
	}
	if(command.related[0]!=undefined){
		related = "\n# Related Command(s)\n";
		for(i in command.related){
			related += command.related[i]+" , ";
		}
		related = related.substr(0,related.length-3);
	}
	var text = "```md\n"+title+"``````md"+desc+example+related+"``````md\n> Remove brackets when typing commands\n> [] = optional arguments\n> {} = optional user input```";
	msg.channel.send(text);
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

/**
 * Maps alts to their command names
 */
exports.init = function(){
	for(var key in help){
		var alt = help[key].alt;
		commands[help[key].name] = key;
		for(i in alt){
			commands[alt[i]] = key;
		}
	}
}
