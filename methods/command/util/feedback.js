const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const sender = require('../../../util/sender.js');

const feedbackChannel = "519778148888346635";
const supportGuild = "420104212895105044";

module.exports = new CommandInterface({
	
	alias:["feedback","question","report","suggest"],

	args:"{msg}",

	desc:"Send a message to an admin!",

	example:["owo feedback Thanks for the bot!"],

	related:[],

	cooldown:300000,
	half:15,
	six:30,
	bot:true,

	execute: function(p){
		var message = p.args.join(" ");
		if(!message||message === ''){
			p.send("**🚫 |** Silly **"+p.msg.author.username+"**, you need to add a message!",3000);
			return;
		}
		if(p.command!="suggest"&&message.length > 250){
			p.send("**🚫 |** Sorry, "+p.msg.author.username+"! Messages must be under 250 character!!!",3000);
			return;
		}else if(message.length > 1500){
			p.send("**🚫 |** Sorry, "+p.msg.author.username+"! Suggestions must be under 1500 character!!!",3000);
			return;
		}
		if(p.command == "suggest"){
			suggest(p,message);
			return;
		}
		var sql = "INSERT INTO feedback (type,message,sender) values ('"+p.command+"',?,"+p.msg.author.id+");";
		sql = p.mysql.mysql.format(sql,message);
		p.con.query(sql,function(err,rows,field){
			if(err){console.error(err);return;}
			var avatar = "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png";
			const embed = {
				"color": 10590193,
				"timestamp": new Date(),
				"thumbnail":{"url":avatar},
				"author": {
					"name": "OwO Bot Support",
					"icon_url":avatar
				},
				"fields": [
					{
						"name":"A user sent a feedback!",
						"value": "==============================================="
					},{
						"name": "Message ID",
						"value": rows.insertId,
						"inline": true
					},{
						"name": "Message Type",
						"value": p.command,
						"inline": true
					},{
						"name": "From "+p.msg.author.username+" ("+p.msg.author.id+")",
						"value": "```"+message+"```\n\n==============================================="
					}
				]
			};
			p.send("**📨 |** *OwO What's this?!*  "+p.msg.author+", Thanks for the "+p.command+"!");
			sender.msgAdmin({embed});
		});
	}

})

function suggest(p,message){
	const embed = {
		"color": p.config.embed_color,
		"timestamp": new Date(),
		"author": {
			"name": p.msg.author.username+"'s suggestion",
			"icon_url":p.msg.author.avatarURL,
		},
		"description":message,
		"footer": {
			"text": p.msg.author.id
		},
	};
	p.sender.msgChannel(feedbackChannel,{embed},{react:['👍','🔁','👎']});

	if(p.msg.guild.id==supportGuild)
		p.send("**📨 |** *OwO What's this?!*  "+p.msg.author+", Thanks for the suggestion!\n"+p.config.emoji.blank+" **|** Abuse of this command will result in a ban.");
	else
		p.send("**📨 |** *OwO What's this?!*  "+p.msg.author+", Thanks for the suggestion! Your suggestion can be viewed in our server! Come join!\n"+p.config.emoji.blank+" **|** Abuse of this command will result in a ban.\n"+p.config.emoji.blank+" **|** "+p.config.guildlink);
}

