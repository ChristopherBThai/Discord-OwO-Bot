//+========================================+
//||					  ||
//||		HELPER METHODS		  ||
//||					  ||
//+========================================+

const global = require('./global.js');
var help = require('../json/help.json');

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
			"\n# Social"+
			"\n< owo rep {@user} >\t\t\t  "+help.rep.desc_short+
			"\n< owo pet|slap|hug|etc {@user} > "+help.pet.desc_short+
			"\n# Utility"+
			"\n< owo feedback {message} >\t   "+help.feedback.desc_short+
			"\n< owo stats >\t\t\t\t\t"+help.stats.desc_short+
			"\n< owo link >\t\t\t\t\t "+help.link.desc_short+
			"\n< owo guildlink >\t\t\t\t"+help.guildlink.desc_short+
			"\n< owo disable|enable {command}>  "+help.disable.desc_short+"```"+
			"```md\n< owo help {command} >\t\t   For more information on a command!\n> Remove brackets when typing commands\n> [] = optional arguments\n> {} = optional user input```";
	channel.send(embed);
}

exports.showCompactHelp = function(channel){
	var text = "**Compact Command List**"+
		"\n\n**Main:** `top`  `my`"+
		"\n**Economy:** `money`  `give`  `daily`  `vote`"+
		"\n**Fun:** `zoo`  `hunt`  `slots`  `lottery`  `8b`  `define`  `gif`  `pic`"+
		"\n**Social:** `rep`  `pet`  `hug`  `kiss`"+
		"\n**Utility:** `feedback`  `stats`  `link`  `guildlink`  `disable`  `enable`  `help`"+
		"\n\nUse `owo help {command}` for further details!"+
		"\nUse `owo {command}` to execute a command!";
	channel.send(text);
}

/**
 * Shows description of a command
 */
exports.describe = function(msg,command){
	var name = command;
	command = global.validCommand(command);
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
exports.guild = function(msg){
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
	var sql = "SELECT COUNT(*) user,sum(count) AS total FROM user;";
	sql += "SELECT SUM(common) AS common, SUM(uncommon) AS uncommon, SUM(rare) AS rare, SUM(epic) AS epic, SUM(mythical) AS mythical, SUM(legendary) AS legendary FROM animal_count;"
	sql += "SELECT command FROM disabled WHERE channel = "+msg.channel.id+";";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		var totalAnimals = parseInt(rows[1][0].common)+parseInt(rows[1][0].uncommon)+parseInt(rows[1][0].rare)+parseInt(rows[1][0].epic)+parseInt(rows[1][0].mythical)+parseInt(rows[1][0].legendary);
		var disabled = "";
		for(i in rows[2]){
			disabled += rows[2][i].command+", ";
		}
		disabled = disabled.slice(0,-2);
		if(disabled=="")
			disabled = "no disabled commands";

		const embed = {
		"description": "Here's a little bit of information! If you need help with commands, type `owo help`.",
			"color": 1,
			"timestamp": new Date(),
			"author": {"name": "OwO Bot Information",
				"url": "https://discordapp.com/api/oauth2/authorize?client_id=408785106942164992&permissions=444480&scope=bot",
				"icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"fields": [{"name":"Current Guild",
					"value":"```md\n<userID:  "+msg.author.id+">\n<channelID: "+msg.channel.id+">\n<guildID:   "+msg.guild.id+">``````md\n< Disabled commands >\n"+disabled+"```"},
				{"name": "Global information",
					"value": "```md\n<TotalOwOs:  "+rows[0][0].total+">\n<OwOUsers:   "+rows[0][0].user+">``````md\n<animalsCaught: "+totalAnimals+">\n<common: "+rows[1][0].common+">\n<uncommon: "+rows[1][0].uncommon+">\n<rare: "+rows[1][0].rare+">\n<epic: "+rows[1][0].epic+">\n<mythical: "+rows[1][0].mythical+">\n<legendary: "+rows[1][0].legendary+">```"},
				{"name": "Bot Information",
					"value": "```md\n<Guilds:    "+client.guilds.size+">\n<Channels:  "+client.channels.size+">\n<Users:     "+client.users.size+">``````md\n<Ping:       "+client.ping+"ms>\n<UpdatedOn:  "+client.readyAt+">\n<Uptime:     "+client.uptime+">```"
				}]
		};
		msg.channel.send({embed})
			.catch(err => msg.channel.send("I don't have permission to send embedded links! :c"));
	});
}


