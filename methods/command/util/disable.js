const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["disable"],

	args:"{command1, command2, ...}",

	desc:"Disable a command in the current channel. You can list multiple commands to disable multiple at once.",

	example:["owo disable hunt battle zoo","owo disable all"],

	related:["owo enable"],

	cooldown:1000,
	half:100,
	six:500,

	execute: function(p){
		/* Checks if the user has permission */
		if(!p.msg.member.permissions.has('MANAGE_CHANNELS')){
			p.send("**🚫 | "+p.msg.author.username+"**, You are not an admin!",3000);
			return;
		}

		var msg=p.msg,con=p.con;

		/* Parse commands */
		var commands = p.args.slice();
		for(let i = 0;i<commands.length;i++)
			commands[i] = commands[i].toLowerCase();

		/* If the user wants to disable all commands */
		if(commands.includes("all")){
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

		/* Construct query statement */
		var sql = "INSERT IGNORE INTO disabled (channel,command) VALUES ";
		var validCommand = false;
		for(let i=0;i<commands.length;i++){
			/* Convert command name to proper name */
			let command = p.aliasToCommand[commands[i]];
			if(command&&command!="disabled"&&command!="enable"){
				validCommand = true;
				sql += "("+msg.channel.id+",'"+command+"'),";
			}
		}
		sql = sql.slice(0,-1) + ";";
		if(!validCommand) sql = "";
		sql += "SELECT * FROM disabled WHERE channel = "+msg.channel.id+";";

		/* Query */
		con.query(sql,function(err,rows,field){
			if(err){console.error(err);return;}

			if(validCommand)
				rows = rows[1];

			/* Construct message */
			var enabled = Object.keys(p.mcommands);
			var disabled = [];

			for(let i=0;i<rows.length;i++){
				let command = rows[i].command;
				if(enabled.includes(command)){
					disabled.push(command);
					enabled.splice(enabled.indexOf(command),1);
				}
			}

			if(enabled.length==0) enabled.push("NONE");
			if(disabled.length==0) disabled.push("NONE");

			const embed = {
				"color":4886754,
				"fields": [{
					"name": "❎ Disabled Commands for this channel:",
					"value": "`"+disabled.join("`  `")+"`",
					},{
					"name": "✅ Enabled Commands for this channel:",
					"value": "`"+enabled.join("`  `")+"`",
				}]
			}
			p.send({embed});
		});
	}

})
