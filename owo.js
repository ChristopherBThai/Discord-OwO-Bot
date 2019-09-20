/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

//const tracer = require('dd-trace').init()
const debug = false;
if(!debug) var tracer = require('dd-trace').init()
const whitelist = ['409959187229966337','420104212895105044','552384921914572802']
if(debug) var auth = require('../tokens/scuttester-auth.json');
else var auth = require('../tokens/owo-auth.json');

const login = require('../tokens/owo-login.json');
const config = require('./json/botConfig.json');

const Discord = require("discord.js");
const client = new Discord.Client(config.client);
client.login(auth.token);
require("./overrides/index.js").override(client);

const DBL = require("dblapi.js");
const dbl = new DBL(auth.dbl);

const mysql = require('./util/mysql.js');
const uncaughtHandler = require('./handler/uncaughtHandler.js');
const CommandClass = require('./methods/command.js');
const command = new CommandClass(client,dbl);
const macro = require('../tokens/macro.js');
const logger = require('./util/logger.js');
const patreon = require('./util/patreon.js');
const broadcastHandler = require('./handler/broadcastHandler');
const levels = require('./util/levels.js');

const modChannel = ["471579186059018241","596220958730223619"];

client.on('message',msg => {
	//Ignore if bot
	if(msg.author.bot) return;

	/* Ignore guilds if in debug mode */
	//else if(debug&&msg.guild&&!whitelist.includes(msg.guild.id)) return;

	else if(modChannel.includes(msg.channel.id)) command.executeMod(msg);

	else if(msg.author.id==auth.admin) command.executeAdmin(msg);

	else if(msg.channel.type==="dm") macro.verify(msg,msg.content.trim());

	else 
		command.execute(msg);
	levels.giveXP(msg);
});

//=============================================================================Console Logs===============================================================

//When the bot client starts
client.on('ready',()=>{
	console.log('Logged in as '+client.user.tag+'!');
	console.log('Bot has started, with '+client.users.size+' users, in '+client.channels.size+' channels of '+client.guilds.size+' guilds.');
	if(!debug){
		logger.increment("ready");
		setInterval(() => {
			dbl.postStats(client.guilds.size,client.shard.ids[0],client.shard.count);
		}, 3200000)
	}
});

//When bot disconnects
client.on('shardDisconnected', (event,shardID) => {
	let code = erMsg.code;
	console.log('----- ['+shardID+'] Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
	client.destroy().then(client.login(auth.token));
	if(!debug)
		logger.increment("disconnect");

});

//When bot reconnecting
client.on('shardReconnecting', (id) => {
	console.log('['+id+']--------------- Bot is reconnecting ---------------');
});

//When bot resumes
client.on('shardResumed', function(replayed,shardID) {
	console.log('['+shardID+']--------------- Bot has resumed ---------------');
	if(!debug)
		logger.increment("reconnecting");
});

//When bot joins a new guild
client.on("guildCreate", guild => {
	//console.log('New guild joined: '+guild.name+' (id: '+guild.id+'). This guild has '+guild.memberCount+' members!');
	updateActivity();
	if(!debug)
		logger.increment("guildcount");
});

//When bot is kicked from a guild
client.on("guildDelete", guild => {
	//console.log('I have been removed from: '+guild.name+' (id: '+guild.id+')');
	updateActivity();
	if(!debug)
		logger.decrement("guildcount");
});

//Check patreons
client.on("guildMemberUpdate", (oldMember,newMember) => {
	patreon.update(oldMember,newMember);
});
client.on("guildMemberRemove", (member) => {
	patreon.left(member);
});

client.on('error',(err) => {
	console.error(new Date());
	console.error(err.Error);
	console.error(err.errno);
});

function updateActivity(){
	client.shard.fetchClientValues('guilds.size')
		.then(results => {
			client.user.setActivity(`with ${results.reduce((prev, val) => prev + val, 0)} Servers! | 'owo help' for help!`);
		})
		.catch(err => console.error(err));
}

process.on('message',message => {
	broadcastHandler.handle(client,message)
});


process.on('unhandledRejection', (reason, promise) => {
	uncaughtHandler.handle(reason,"unhandledRejection",client);
});

process.on('uncaughtException', err => {
	uncaughtHandler.handle(err,"uncaughtException",client);
});

client.on('rateLimit',function(info){
	logger.increment("rateLimit",['limit:'+info.limit,'timeout:'+info.timeout,'route:'+info.route]);
});

client.on('debug',(msg) => {
	//console.log(msg);
});
