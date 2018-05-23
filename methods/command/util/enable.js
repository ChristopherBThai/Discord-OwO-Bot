const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["enable"],

	args:"{command}",

	desc:"Enable a command in the current channel",

	example:["owo enable hunt","owo enable all"],

	related:["owo disable"],

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
				list += "('"+key+"'),";
			}
			list = list.slice(0,-1);
			var sql = "DELETE FROM disabled WHERE channel = "+msg.channel.id+" AND command IN ("+list+");";
			con.query(sql,function(err,rows,field){
				if(err){console.error(err);return;}
				p.send("**⚙ | All** commands have been **enable** for this channel!");
			});
			return;
		}
		command = p.aliasToCommand[command];
		if(command == undefined)
			return;
		if(command=="disable"||command=="enable"){
			p.send("**🚫 |** You cant enable that silly!");
			return;
		}
		var sql = "DELETE FROM disabled WHERE channel = "+msg.channel.id+" AND command = '"+command+"';";
		con.query(sql,function(err,rows,field){
			if(err){console.error(err);return;}
			p.send("**⚙ |** The command **"+command+"** has been **enabled** for this channel!");
		});
	}

})

