const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["feedback","question","report","suggest"],

	args:"{msg}",

	desc:"Send a message to an admin!",

	example:["owo feedback Thanks for the bot!"],

	related:[],

	cooldown:60000,
	half:15,
	six:30,
	bot:true,

	execute: function(p){
		var message = p.args.join(" ");
		if(!message||message === ''){
			p.send("**🚫 |** Silly **"+p.msg.author.username+"**, you need to add a message!",3000);
			return;
		}
		if(message.length > 250){
			p.send("**🚫 |** Sorry, "+p.msg.author.username+"! Messages must be under 250 character!!!",3000);
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

