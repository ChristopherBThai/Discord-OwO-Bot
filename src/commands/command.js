/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const requireDir = require('require-dir');
const dir = requireDir('./commandList',{recurse:true});

const CommandInterface = require('./CommandInterface.js');

const commands = {};
const adminCommands = {};
const modCommands = {};

const aliasToCommand = {};
const mcommands = {};

class Command {

	constructor(main){
		this.main = main;
		this.prefix = main.prefix;
		initCommands();
	}

	async execute(msg){
		// Parse content info
		let args;
		if(msg.content.toLowerCase().indexOf(this.prefix) === 0)
			args = msg.content.slice(this.prefix.length).trim().split(/ +/g);
		else{
			//if user said owo/uwu
			if(msg.content.toLowerCase().includes('owo')||msg.content.toLowerCase().includes('uwu')){
				executeCommand(this.main,initParam(msg,"points",[],this.main));
			}
			return;
		}

		//Get command name
		let command = args.shift().toLowerCase();

		//  Check if that command exists
		if(!commands[command]) {
			executeCommand(this.main,initParam(msg,"points",[],this.main));
			return;
		}

		//Init params to pass into command
		let param = initParam(msg,command,args,this.main);

		//Execute the command
		await executeCommand(this.main,param);
	}

	async executeAdmin(msg){
		let args;
		if(msg.content.toLowerCase().indexOf(this.prefix) === 0)
			args = msg.content.slice(this.prefix.length).trim().split(/ +/g);
		else {
			this.execute(msg);
			return;
		}

		let command = args.shift().toLowerCase();

		let param = initParam(msg,command,args,this.main);

		if(msg.channel.type==1){
			if(adminCommands[command]&&adminCommands[command].dm)
				adminCommands[command].execute(param);
		}else{
			if(adminCommands[command]&&!adminCommands[command].dm)
				adminCommands[command].execute(param);
			else
				this.execute(msg);
		}
	}

	async executeMod(msg){
		let args;
		if(msg.content.toLowerCase().indexOf(this.prefix) === 0)
			args = msg.content.slice(this.prefix.length).trim().split(/ +/g);
		else return;

		let command = args.shift().toLowerCase();
		let param = initParam(msg,command,args,this.main);

		if(modCommands[command]) modCommands[command].execute(param);

	}
}

async function executeCommand(main,p){
	let {ban,cooldown,logger} = main;

	// Check if the command/user/channel is banned
	if(!(await ban.check(p,p.commandAlias))) return;

	// Check for cooldowns 
	if(!(await cooldown.check(p,p.commandAlias))) return;

	// Execute command
	await commands[p.command].execute(p);

	// Log stats to datadog api
	let dm = p.msg.channel.type==1;
	logger.increment("command",['command:'+p.commandAlias,'id:'+p.msg.author.id,'guild:'+(dm?p.msg.channel.id:p.msg.channel.guild.id),'channel:'+p.msg.channel.id,'dm:'+dm]);
}

/**
 * Reads and initializes the commands
 * Will sort them by type and aliases
 */
function initCommands(){
	let addCommand = function(command){
		let alias = command.alias;
		let name = alias[0];
		if(alias){
			for(let i=0;i<alias.length;i++){
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

	let addAdminCommand = function(command){
		let alias = command.alias;
		let name = alias[0];
		if(alias){
			for(let i=0;i<alias.length;i++){
				adminCommands[alias[i]] = command;
				if(command.mod) modCommands[alias[i]] = command;
			}
		}
	}
	for(var key in dir){
		if(dir[key] instanceof CommandInterface){
			if(dir[key].admin||dir[key].mod)
				addAdminCommand(dir[key]);
			else
				addCommand(dir[key]);
		}else{
			for(var key2 in dir[key]){
				if(dir[key][key2] instanceof CommandInterface){
					if(dir[key][key2].admin||dir[key][key2].mod)
						addAdminCommand(dir[key][key2]);
					else
						addCommand(dir[key][key2]);
				}
			}
		}
	}
}

/**
 * Initializes the resources/utilities required for each command
 */
function initParam(msg,command,args,main){
	let param = {
		"msg":msg,
		"args":args,
		"command":command,
		"client":main.bot,
		"dbl":main.dbl,
		"mysql":main.mysql,
		"con":main.mysql.con,
		"redis":main.redis,
		"query":main.query,
		"send":main.sender.send(msg),
		"replyMsg":main.sender.reply(msg),
		"errorMsg":main.sender.error(main.config.emoji.invalid,msg),
		"sender":main.sender,
		"global":main.global,
		"aliasToCommand":aliasToCommand,
		"commandAlias":aliasToCommand[command],
		"commands":commands,
		"mcommands":mcommands,
		"logger":main.logger,
		"log":main.logger.log,
		"config":main.config,
		"fetch":main.fetch,
		"pubsub":main.pubsub,
		"DataResolver":main.DataResolver,
		"quest":function(questName,count,extra){main.questHandler.increment(msg,questName,count,extra).catch(console.error)},
		"reactionCollector":main.reactionCollector
	};
	param.setCooldown = function(cooldown){
		main.cooldown.setCooldown(param,aliasToCommand[command],cooldown);
	}
	param.getMention = function(id){
		id = id.match(/[0-9]+/);
		if(!id) return;
		id = id[0];
		for(let i in param.msg.mentions){
			let tempUser = param.msg.mentions[i];
			if(tempUser.id == id){
				return tempUser;
			}
		}
	}
	return param;
}

module.exports = Command;
