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
		
		var guilds = await client.shard.fetchClientValues('guilds.size');
		guildsTotal = guilds.reduce((prev,val) => prev + val);
		var channels = await client.shard.fetchClientValues('channels.size');
		channelsTotal = channels.reduce((prev,val) => prev + val);
		var users = await client.shard.fetchClientValues('users.size');
		usersTotal = users.reduce((prev,val) => prev + val);
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
						"value":"```md\n<userID:  "+msg.author.id+">\n<channelID: "+msg.channel.id+">\n<guildID:   "+msg.guild.id+">```"},
					{"name": "Global information",
						"value": "```md\n<TotalOwOs:  "+p.global.toFancyNum(rows[0][0].total)+">\n<OwOUsers:   "+p.global.toFancyNum(rows[0][0].user)+">``````md\n<animalsCaught: "+p.global.toFancyNum(totalAnimals)+">\n<common: "+p.global.toFancyNum(rows[1][0].common)+">\n<uncommon: "+p.global.toFancyNum(rows[1][0].uncommon)+">\n<rare: "+p.global.toFancyNum(rows[1][0].rare)+">\n<epic: "+p.global.toFancyNum(rows[1][0].epic)+">\n<mythical: "+p.global.toFancyNum(rows[1][0].mythical)+">\n<legendary: "+p.global.toFancyNum(rows[1][0].legendary)+">```"},
					{"name": "Bot Information",
						"value": "```md\n<Guilds:    "+p.global.toFancyNum(guildsTotal)+">\n<Channels:  "+p.global.toFancyNum(channelsTotal)+">\n<Users:     "+p.global.toFancyNum(usersTotal)+">``````md\n<Ping:       "+client.ping+"ms>\n<UpdatedOn:  "+client.readyAt+">\n<Uptime:     "+client.uptime+">```"
					}]
			};
			msg.channel.send({embed})
				.catch(err => msg.channel.send("**🚫 |** Hrmm.. something went wrong.. :c")
					.catch(err => console.error(err)));
		});
	}

})
