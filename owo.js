const debug = false;
const testingGuild = '409959187229966337';
const supportGuild = '420104212895105044';
if(debug) var auth = require('../tokens/scuttester-auth.json');
else var auth = require('../tokens/owo-auth.json');

const login = require('../tokens/owo-login.json');
const config = require('./json/botConfig.json');

const Discord = require("discord.js");
const client = new Discord.Client(config.client);
const DBL = require("dblapi.js");
const dbl = new DBL(auth.dbl);

const CommandClass = require('./methods/command.js');
const command = new CommandClass(client,dbl);
const macro = require('../tokens/macro.js');
const logger = require('./util/logger.js');
const patreon = require('./util/patreon.js');
const broadcastHandler = require('./handler/broadcastHandler');

const modChannel = "471579186059018241";

client.on('message',msg => {
	//Ignore if bot
	if(msg.author.bot) return;

	/* Ignore guilds if in debug mode */
	//else if(debug&&msg.guild.id!=testingGuild&&msg.guild.id!=supportGuild) return;

	else if(msg.channel.id==modChannel) command.executeMod(msg);

	else if(msg.author.id==auth.admin) command.executeAdmin(msg);

	else if(msg.channel.type==="dm") macro.verify(msg,msg.content.trim());

	else command.execute(msg);
});

//Discord login
client.login(auth.token);

//=============================================================================Console Logs===============================================================

//When the bot client starts
client.on('ready',()=>{
	console.log('Logged in as '+client.user.tag+'!');
	console.log('Bot has started, with '+client.users.size+' users, in '+client.channels.size+' channels of '+client.guilds.size+' guilds.');
	if(!debug){
		logger.increment("ready");
		setInterval(() => {
			dbl.postStats(client.guilds.size,client.shard.id,client.shard.count);
		}, 3200000)
	}
});

//When bot disconnects
client.on('disconnect', function(erMsg, code) {
	console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
	//client.connect();
	if(!debug)
		logger.increment("disconnect");
});

//When bot reconnecting
client.on('reconnecting', () => {
	console.log('--------------- Bot is reconnecting ---------------');
});

//When bot resumes 
client.on('reconnecting', function(replayed) {
	console.log('--------------- Bot has resumed ---------------');
	if(!debug)
		logger.increment("reconnecting");
});

//When bot joins a new guild
client.on("guildCreate", guild => {
	console.log('New guild joined: '+guild.name+' (id: '+guild.id+'). This guild has '+guild.memberCount+' members!');
	updateActivity();
	if(!debug)
		logger.increment("guildcount");
});

//When bot is kicked from a guild
client.on("guildDelete", guild => {
	console.log('I have been removed from: '+guild.name+' (id: '+guild.id+')');
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
	console.error(new Date());
	console.error('Unhandled Rejection at:', reason.stack || reason);
});

process.on('uncaughtException', err => {
	console.error(new Date());
	console.error(`Caught exception: ${err}`);
});
