/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const requireDir = require('require-dir');
const dir = requireDir('./command',{recurse:true});

const CommandInterface = require('./commandinterface');

const sender = require('../utils/sender.js');
const Error = require("../handler/errorHandler.js");
const mysqlHandler = require("../handler/mysqlHandler.js");
const questHandler = new (require("../handler/questHandler.js"))();

const logger = require('../utils/logger.js');
const mysql = require('../utils/mysql.js');
const con = mysql.con;
const global = require('../utils/global.js');
const config = require('../json/botConfig.json');

const macro = require('../../tokens/macro.js');
const ban = require('../utils/ban.js');

const prefix = config.prefix;
var query;

//Commands (including alias)
var commands = {};
//Change alias to main command name
var aliasToCommand = {};
//Only main command names
var mcommands = {};
//Admin commands
var adminCommands = {};
var modCommands = {};

class Command {

	//Grabs all commands in ./command/
	constructor(main){
		/*
		this.client = Client;
		this.dbl = dbl;
		global.client(Client);
		sender.client(Client);
		global.con(con);
		macro.con(con);
		macro.sender(sender);
		macro.global(global);
		query = new mysqlHandler(con).query;
		*/
		for(var key in dir){
			if(dir[key] instanceof CommandInterface)
				addCommand(dir[key]);
			else
				for(var key2 in dir[key])
					if(dir[key][key2] instanceof CommandInterface)
						addCommand(dir[key][key2]);
		}
		macro.commands(mcommands);
	}

	execute(msg){
		//Gets command arguments
		let args;
		if(msg.content.toLowerCase().indexOf(prefix) === 0)
			args = msg.content.slice(prefix.length).trim().split(/ +/g);
		else{
			if(msg.content.toLowerCase().includes('owo')||msg.content.toLowerCase().includes('uwu')){
				executeCommand(initParam(msg,"points",[],this.client,this.dbl));
			}
			return;
		}

		//Get command name
		var command = args.shift().toLowerCase();

		//Init params to pass into command
		var param = initParam(msg,command,args,this.client,this.dbl);

		//Execute the command
		if(commands[command]){
			executeCommand(param);
		}else{
			param.command = "points";
			param.args = [];
			executeCommand(param);
		}
	}

	executeAdmin(msg){
		var args;
		if(msg.content.toLowerCase().indexOf(prefix) === 0)
			args = msg.content.slice(prefix.length).trim().split(/ +/g);
		else {this.execute(msg);return;}

		var command = args.shift().toLowerCase();
		var param = initParam(msg,command,args,this.client,this.dbl);

		if(msg.channel.type==="dm"){
			if(adminCommands[command]&&adminCommands[command].dm)
				adminCommands[command].execute(param);
		}else{
			if(adminCommands[command]&&!adminCommands[command].dm)
				adminCommands[command].execute(param);
			else
				this.execute(msg);
		}
	}

	executeMod(msg){
		var args;
		if(msg.content.toLowerCase().indexOf(prefix) === 0)
			args = msg.content.slice(prefix.length).trim().split(/ +/g);
		else return;

		var command = args.shift().toLowerCase();
		var param = initParam(msg,command,args,this.client,this.dbl);

		if(modCommands[command]) modCommands[command].execute(param);
	}


}

function addCommand(command){
	var alias = command.alias;
	var name = alias[0];
	if(command.admin||command.mod){
		for(var i=0;i<alias.length;i++){
			adminCommands[alias[i]] = command;
			if(command.mod)
				modCommands[alias[i]] = command;
		}
		return;
	}
	if(alias){
		for(var i=0;i<alias.length;i++){
			commands[alias[i]] = command;
			if(command.distinctAlias){
				aliasToCommand[alias[i]] = alias[i];
				mcommands[alias[i]] = {botcheck:command.bot,cd:command.cooldown,ban:12,half:command.half,six:command.six};
			}else
				aliasToCommand[alias[i]] = name;
		}
	}
	if(!command.distinctAlias)
		mcommands[name] = {botcheck:command.bot,cd:command.cooldown,ban:12,half:command.half,six:command.six};
}

function executeCommand(param){
	let command = param.command;
	let msg = param.msg;
	let name = aliasToCommand[command];
	ban.check(con,msg,param.client,name,function(){
		macro.check(msg,aliasToCommand[command],async function(){
			try{
				let result = await commands[command].execute(param);
			}catch(err){
				console.error(err);
			}
			logger.increment("command",['command:'+aliasToCommand[command],'id:'+msg.author.id]);
		});
	},false);
}

function initParam(msg,command,args,client,dbl){
	let param = {
		"msg":msg,
		"args":args,
		"command":command,
		"client":client,
		"dbl":dbl,
		"mysql":mysql,
		"con":con,
		"query":query,
		"send":sender.send(msg),
		"replyMsg":sender.reply(msg),
		"errorMsg":sender.error(config.emoji.invalid,msg),
		"sender":sender,
		"Error":Error,
		"global":global,
		"aliasToCommand":aliasToCommand,
		"commandAlias":aliasToCommand[command],
		"commands":commands,
		"mcommands":mcommands,
		"logger":logger,
		"log":logger.log,
		"config":config,
		"quest":function(questName,count,extra){questHandler.increment(msg,questName,count,extra).catch(console.error)},
		"setCooldown":function(cooldown){macro.setCooldown(msg.author.id,aliasToCommand[command],commands[command].cooldown,cooldown);}
	};
	return param;
}
module.exports = Command;
