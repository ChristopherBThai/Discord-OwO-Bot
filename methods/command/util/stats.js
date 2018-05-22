const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["stats","stat","info"],

	args:"",

	desc:"Some bot stats!",

	example:[],

	related:[],

	cooldown:60000,
	half:100,
	six:500,

	execute: async function(p){
		var con=p.con,client=p.client,msg=p.msg;
		var sql = "SELECT COUNT(*) user,sum(count) AS total FROM user;";
		sql += "SELECT SUM(common) AS common, SUM(uncommon) AS uncommon, SUM(rare) AS rare, SUM(epic) AS epic, SUM(mythical) AS mythical, SUM(legendary) AS legendary FROM animal_count;"
		sql += "SELECT command FROM disabled WHERE channel = "+msg.channel.id+";";
		
		var guilds = await client.shard.fetchClientValues('guilds.size')
		var channels = await client.shard.fetchClientValues('channels.size')
		var users = await client.shard.fetchClientValues('users.size')
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
				"color": 4886754,
				"timestamp": new Date(),
				"author": {"name": "OwO Bot Information",
					"url": "https://discordapp.com/api/oauth2/authorize?client_id=408785106942164992&permissions=444480&scope=bot",
					"icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
				"fields": [{"name":"Current Guild",
						"value":"```md\n<userID:  "+msg.author.id+">\n<channelID: "+msg.channel.id+">\n<guildID:   "+msg.guild.id+">``````md\n< Disabled commands >\n"+disabled+"```"},
					{"name": "Global information",
						"value": "```md\n<TotalOwOs:  "+rows[0][0].total+">\n<OwOUsers:   "+rows[0][0].user+">``````md\n<animalsCaught: "+totalAnimals+">\n<common: "+rows[1][0].common+">\n<uncommon: "+rows[1][0].uncommon+">\n<rare: "+rows[1][0].rare+">\n<epic: "+rows[1][0].epic+">\n<mythical: "+rows[1][0].mythical+">\n<legendary: "+rows[1][0].legendary+">```"},
					{"name": "Bot Information",
						"value": "```md\n<Guilds:    "+guilds+">\n<Channels:  "+channels+">\n<Users:     "+users+">``````md\n<Ping:       "+client.ping+"ms>\n<UpdatedOn:  "+client.readyAt+">\n<Uptime:     "+client.uptime+">```"
					}]
			};
			msg.channel.send({embed})
				.catch(err => msg.channel.send("**🚫 |** I don't have permission to send embedded links! :c")
					.catch(err => console.error(err)));
		});
	}

})
