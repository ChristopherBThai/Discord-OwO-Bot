/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["disable"],

	args:"{command1, command2, ...}",

	desc:"Disable a command in the current channel. You can list multiple commands to disable multiple at once.",

	example:["owo disable hunt battle zoo","owo disable all"],

	related:["owo enable"],

	permissions:["sendMessages"],

	cooldown:1000,
	half:100,
	six:500,

	execute: function(p){
		/* Checks if the user has permission */
		if(!p.msg.member.permission.has('manageChannels')){
			p.send("**🚫 | "+p.msg.author.username+"**, You are not an admin!",3000);
			return;
		}

		let msg=p.msg,con=p.con;

		/* Parse commands */
		let commands = p.args.slice();
		for(let i = 0;i<commands.length;i++)
			commands[i] = commands[i].toLowerCase();

		/* If the user wants to disable all commands */
		if(commands.includes("all")){
			let list = "("+msg.channel.id+",'all'),";
			for(var key in p.mcommands){
				if(key!="disable"&&key!="enable")
					list += "("+msg.channel.id+",'"+key+"'),";
			}
			list = list.slice(0,-1);
			let sql = "INSERT IGNORE INTO disabled (channel,command) VALUES "+list+";";
			con.query(sql,function(err,rows,field){
				if(err){console.error(err);return;}
				p.send("**⚙ | All** commands have been **disabled** for this channel!");
			});
			return;
		}

		/* Construct query statement */
		let sql = "INSERT IGNORE INTO disabled (channel,command) VALUES ";
		let validCommand = false;
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
			let enabled = Object.keys(p.mcommands);
			let disabled = [];
			let all = false;

			for(let i=0;i<rows.length;i++){
				let command = rows[i].command;
				if(command == 'all') all = true;
				if(enabled.includes(command)){
					disabled.push(command);
					enabled.splice(enabled.indexOf(command),1);
				}
			}

			if(all){
				disabled = Object.keys(p.mcommands);
				enabled = [];
			}

			if(enabled.length==0) enabled.push("NONE");
			if(disabled.length==0) disabled.push("NONE");

			let desc = "**❎ Disabled Commands for this channel:**";
			desc += "\n`"+disabled.join("`  `")+"`";
			desc += "\n**✅ Enabled Commands for this channel:**";
			desc += "\n`"+enabled.join("`  `")+"`";

			let embed = {
				"color":4886754,
				"description":desc
			}
			p.send({embed});
		});
	}

})
