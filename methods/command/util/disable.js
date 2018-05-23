const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["disable"],

	args:"{command}",

	desc:"Disable a command in the current channel",

	example:["owo disable hunt","owo disable all"],

	related:["owo enable"],

	cooldown:1000,
	half:100,
	six:500,

	execute: function(p){
		if(!p.msg.member.permissions.has('MANAGE_CHANNELS')){
			p.send("**🚫 | "+p.msg.author.username+"**, You are not an admin!",3000);
			return;
		}
		var msg=p.msg,con=p.con;
		var command = p.args[0];
		if(command == "all"){
			var list = "";
			for(var key in p.mcommands){
				if(key!="disable"&&key!="enable")
					list += "("+msg.channel.id+",'"+key+"'),";
			}
			list = list.slice(0,-1);
			var sql = "INSERT IGNORE INTO disabled (channel,command) VALUES "+list+";";
			con.query(sql,function(err,rows,field){
				if(err){console.error(err);return;}
				p.send("**⚙ | All** commands have been **disabled** for this channel!");
			});
			return;
		}
		command = p.aliasToCommand[command];
		if(command == undefined)
			return;
		if(command=="disable"||command=="enable"){
			p.send("You cant disable that silly!",3000);
			return;
		}
		var sql = "INSERT IGNORE INTO disabled (channel,command) VALUES ("+msg.channel.id+",'"+command+"');";
		con.query(sql,function(err,rows,field){
			if(err){console.error(err);return;}
			p.send("**⚙ |** The command **"+command+"** has been **disabled** for this channel!");
		});
	}

})
