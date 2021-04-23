/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
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
const commandGroups = {};

class Command {

	constructor (main) {
		this.main = main;
		this.prefix = main.prefix;
		initCommands();
	}

	async execute (msg, raw) {
		// Parse content info
		let args = await checkPrefix(this.main, msg);
		if (!args) {
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

		// Make sure user accepts rules first
		if (!(await acceptedRules(this.main, msg))) {
			executeCommand(this.main,initParam(msg,"rule",[],this.main));
			return;
		}

		// Init params to pass into command
		let param = initParam(msg,command,args,this.main);

		// Parse user raw data, so our cache is up to date
		this.checkRaw(raw);

		// Execute the command
		await executeCommand(this.main,param);
	}

	async executeAdmin (msg, raw){
		let args;
		if(msg.content.toLowerCase().indexOf(this.prefix) === 0)
			args = msg.content.slice(this.prefix.length).trim().split(/ +/g);
		else {
			this.execute(msg, raw);
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
				this.execute(msg, raw);
		}
	}

	async executeMod (msg){
		let args;
		if(msg.content.toLowerCase().indexOf(this.prefix) === 0)
			args = msg.content.slice(this.prefix.length).trim().split(/ +/g);
		else return;

		let command = args.shift().toLowerCase();
		let param = initParam(msg,command,args,this.main);

		if(modCommands[command]) modCommands[command].execute(param);

	}

	checkRaw (raw) {
		if (raw?.author) {
			this.updateUser(raw.author);
		}
		raw?.mentions?.forEach(user => this.updateUser(user));
	}

	updateUser (rawUser) {
		const user = this.main.bot.users.get(rawUser.id);
		let update = false;
		if (user && (user.username !== rawUser.username || user.avatar !== rawUser.avatar || user.discriminator !== rawUser.discriminator)) {
			update = true;
		}
		if (!user || update) {
			this.main.bot.users.update(rawUser, this.main.bot);
		}
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

	// Log stats to statsd
	logger.command(p.commandAlias, p.msg);
}

/**
 * Reads and initializes the commands
 * Will sort them by type and aliases
 */
function initCommands(){
	let groupCommand = function(command, name) {
		let groups = command.group;
		if (groups && groups.length) {
			for (let i in groups) {
				let group = groups[i];
				if (!commandGroups[group]) commandGroups[group] = [];
				commandGroups[group].push(name);
			}
		} else {
			if (!commandGroups['undefined']) commandGroups['undefined'] = [];
			commandGroups['undefined'].push(name);
		}
	}

	let addCommand = function(command){
		let alias = command.alias;
		let name = alias[0];
		if(alias){
			for(let i=0;i<alias.length;i++){
				commands[alias[i]] = command;
				if(command.distinctAlias){
					aliasToCommand[alias[i]] = alias[i];
					groupCommand(command,alias[i]);
					mcommands[alias[i]] = {
						botcheck:command.bot,
						cd:command.cooldown,
						ban:12,
						half:command.half,
						six:command.six,
						group:command.group
					};
				}else
					aliasToCommand[alias[i]] = name;
			}
		}
		if(!command.distinctAlias)
			groupCommand(command, name);
			mcommands[name] = {
				botcheck:command.bot,
				cd:command.cooldown,
				ban:12,
				half:command.half,
				six:command.six,
				group:command.group
			};
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
		"startTransaction": main.mysqlhandler.startTransaction,
		"redis":main.redis,
		"query":main.query,
		"send":main.sender.send(msg),
		"replyMsg":main.sender.reply(msg),
		"errorMsg":main.sender.error(main.config.emoji.invalid,msg),
		"sender":main.sender,
		"macro":main.macro,
		"global":main.global,
		"aliasToCommand":aliasToCommand,
		"commandAlias":aliasToCommand[command],
		"commands":commands,
		"mcommands":mcommands,
		"commandGroups":commandGroups,
		"logger":main.logger,
		"log":main.logger.log,
		"config":main.config,
		"fetch":main.fetch,
		"pubsub":main.pubsub,
		"DataResolver":main.DataResolver,
		"EmojiAdder":main.EmojiAdder,
		"quest":function(questName,count,extra){main.questHandler.increment(msg,questName,count,extra).catch(console.error)},
		"reactionCollector":main.reactionCollector,
		"dateUtil":main.dateUtil,
		"neo4j":main.neo4j
	};
	param.setCooldown = function(cooldown){
		main.cooldown.setCooldown(param,aliasToCommand[command],cooldown);
	}
	param.getMention = function(id){
		if(!id) return;
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
	param.getRole = function(id){
		id = id.match(/[0-9]+/);
		if(!id) return;
		id = id[0];
		return param.msg.channel.guild.roles.get(id);
	}
	param.replaceMentions = function(text) {
		if (!text) return;
		let userMentions = text.match(/<@!?\d+>/g);
		let roleMentions = text.match(/<@&\d+>/g);

		for (let i in userMentions) {
			let mention = userMentions[i];
			let user = param.getMention(mention);
			if (user) text = text.replace(mention, '@' + user.username);
		}

		for (let i in roleMentions) {
			let mention = roleMentions[i];
			let role = param.getRole(mention);
			if (role) text = text.replace(mention, '@' + role.name);
		}
		return text;
	}
	return param;
}

async function checkPrefix(main, msg) {
	const content = msg.content.toLowerCase();
	if (content.startsWith(main.prefix)){
		return msg.content.slice(main.prefix.length).trim().split(/ +/g);
	}

	if (!msg.channel.guild) return;

	// If prefix isn't saved, fetch it
	if (msg.channel.guild.prefix === undefined) {
		let prefix = await main.redis.hget(msg.channel.guild.id,"prefix");
		if (prefix) msg.channel.guild.prefix = prefix;
		else msg.channel.guild.prefix = false;
	}

	// check with custom prefix
	if (msg.channel.guild.prefix && content.startsWith(msg.channel.guild.prefix)) {
		return msg.content.slice(msg.channel.guild.prefix.length).trim().split(/ +/g);
	}
}

async function acceptedRules(main, msg) {
	if (!msg.author.acceptedRules) {
		let sql = `SELECT rules.* FROM rules INNER JOIN user ON user.uid = rules.uid WHERE id = ${msg.author.id};`;
		let result = await main.mysqlhandler.query(sql);
		msg.author.acceptedRules = !!result[0];
	}
	return msg.author.acceptedRules;
}

module.exports = Command;
