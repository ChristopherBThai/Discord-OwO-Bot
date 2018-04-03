const debug = false;
if(debug)
	var auth = require('../tokens/scuttester-auth.json');
else 
	var auth = require('../tokens/owo-auth.json');
var login = require('../tokens/owo-login.json');

const Discord = require("discord.js");
const client = new Discord.Client();
const DBL = require("dblapi.js");
const dbl = new DBL(auth.dbl);

const global = require("./methods/global.js");

const ranking = require("./methods/ranking.js");
const me = require("./methods/me.js");
const helper = require("./methods/helper.js");
const cowoncy = require("./methods/cowoncy.js");
const vote = require("./methods/vote.js");
const ship = require("./methods/ship.js");
const disable = require("./methods/disable.js");
const weeb = require("./methods/weebjs.js");
const zoo = require("./methods/zoo.js");
const rep = require("./methods/rep.js");
const slots = require("./methods/slots.js");
const battle = require("./methods/battle.js");
const battleuser = require("./methods/battleuser.js");
const lootbox = require("./methods/lootbox.js");
const lottery = require("./methods/lottery.js");
const other = require("./methods/other.js");
const feedback = require("./methods/feedback.js");
const admin = require("./methods/admin.js");

var emotes = require('./json/emotes.json');
var prefix = "owo";

client.on('message',msg => {

	//Special admin commands via DM
	if(msg.author.id===auth.admin&&msg.channel.type==="dm"){
		var adminMsg = msg.content.trim().split(/ +/g);
		const adminCommand = adminMsg.shift().toLowerCase();

		//Reply to a feedback/report/suggestion
		if(adminCommand === 'reply'&&global.isInt(adminMsg[0])){
			feedback.reply(mysql, con, msg, adminMsg);
		}

		else if(adminCommand === 'channel'){
			admin.msgChannel(client,msg.author,adminMsg.shift(),adminMsg.join(' '));
		}

		else if(adminCommand === 'send'){
			admin.send(client,con,msg,adminMsg);
		}

		else if(adminCommand === 'lift'){
			admin.timeout(con,msg,adminMsg);
		}
	}

	//Ignore if its a bot or DM
	if(msg.author.bot||msg.channel.type!=="text") return;

	//Check if command
	var args = "";
	var isMention = false;;
	var isCommand = false;
	//Check for 'owo' prefix
	if(msg.content.toLowerCase().indexOf(prefix) === 0){
		args = msg.content.slice(prefix.length).trim().split(/ +/g);
		isCommand = true;
	}else if(msg.mentions.users.has(client.user.id)){
		args = msg.content.substring(msg.content.indexOf(" ")).trim().split(/ +/g);;
		isMention = true;
		isCommand = true;
	}

	//OwO what's this?
	if(msg.content.replace(/[hs'?]|\s/g,"").toLowerCase()==="owowatti"){
		isCommand = false;
		msg.channel.send("*owo intensifies*");
	}

	//Commands
	if(isCommand){
		const command = args.shift().toLowerCase();

		//Admin commands
		if(msg.author.id===auth.admin&&command === "giveall"){
			clog(command,args,msg);
			admin.giveall(con,msg,args);
		}

		//Checks if the command is disabled
		else (global.isDisabled(command,execute,executeOther,msg,args,isMention));
	}

	//Add point if they said owo
	else if(msg.content.toLowerCase().includes('owo')||msg.content.toLowerCase().includes('uwu')) ranking.addPoint(con,msg);

});

function execute(command,msg,args,isMention){

	clog(command,args,msg);

	//Displays user ranking
	if (command === 'my' || command === 'me'){
		me.display(con, msg, args);
	}else if(command === 'guild' || command === 'server'){
		me.display(con, msg, ["guild"]);
	}

	//Displays top ranking
	else if (command === 'top' || command === 'rank'){
		ranking.display(con, msg, args);
	}

	//Slots!
	else if (command === 'slot' || command === 'slots'){
		slots.slots(con,msg,args);
	}

	//Lottery!
	else if (command === 'lottery' || command === 'bet'){
		if(args.length==0)
			lottery.display(con,msg,args);
		else
			lottery.bet(con,msg,args);
	}

	//reply the question with yes or no
	else if(command === '8b' || command === '8ball' || command === 'ask'){
			other.eightball(con,msg,isMention,prefix);
	}

	//Cowoncy
	else if (command === 'cowoncy'||command === 'credit'||command === 'money'||command === 'cash'||command === 'balance'||command === 'currency'){
		cowoncy.display(con,msg);
	}

	//Give rep 
	else if(command === 'rep'||command === 'cookie'||command === 'feed'){
		if(args.length==0)
			rep.display(con,msg);
		else
			rep.give(con,client,msg,args);
	}

	//emotes
	else if(emotes.sEmote[command]!=undefined&&args.length==0){weeb.sEmote(msg,command);}

	//emotes + user
	else if(emotes.uEmote[command]!=undefined&&args.length==1){weeb.uEmote(client,msg,args,command);}

	//Ships user
	else if(command === 'ship'){
		ship.ship(msg,args);
	}

	//Battle!
	else if(command === 'fight'||command === 'battle'){
		battle.execute_b(mysql,con,msg,args);
	}

	//Accept a battle from a user
	else if(command === 'acceptbattle'||command === "ab"){
		battleuser.accept(con,msg,args);
	}

	//Declines a battle from a user
	else if(command === 'declinebattle'||command === "db"){
		battleuser.decline(con,msg,args);
	}

	//Battle pets
	else if(command === 'pet'||command === 'pets'){
		battle.execute_p(mysql,con,msg,args);
	}

	else if(command === 'lootbox'||command === 'box'){
		lootbox.open(msg,args);
	}

	//Give cowoncy
	else if(command === 'send' || command === 'give'){
		cowoncy.give(con,msg,args);
	}

	//Daily cowoncy
	else if (command === 'daily'){cowoncy.daily(con,msg);}

	//Daily vote
	else if (command === 'vote'){vote.link(msg);}

	//Catch an animals
	else if (command === 'catch'||command === 'hunt'){
		zoo.catch(con,msg);
	}

	//SHows the zoo
	else if (command === 'zoo'){zoo.display(con,msg);}

	//Define a word
	else if (command === 'define'){other.define(msg,args.join(" "));}

	//Grab type of pics
	else if(command === 'image'||command === 'pic'){
		if(args.length==0)
			weeb.getTypes(msg);
		else
			weeb.getImage(msg,args);
	}
	//Grab type of gif 
	else if(command === 'gif'){
		if(args.length==0)
			weeb.getTypes(msg);
		else
			weeb.getGif(msg,args);
	}

	//Sends feedback to admin
	else if(command === 'feedback'|| command === 'suggestion' || command === 'report'){
		feedback.send(mysql, con,msg, client.users.get(auth.admin), command, args.join(' '));
	}

	//Displays all the commands
	else if(command === "help" || command === "command" || command === "commands"){
		if(args.length>0)
			if(args[0]=="compact"||args[0]=="mobile"||args[0]=="simple"){helper.showCompactHelp(msg.channel);
			}else{helper.describe(msg,args[0].toLowerCase());}
		else
			helper.showHelp(msg.channel);
	}

	//Display link for discord invite
	else if(command === "invite" || command === "link"){
		helper.showLink(msg);
	}

	//Display link for discord invite
	else if(command === "guildlink" || command === "serverlink"){
		helper.guild(msg);
	}

	//Ping pong!
	else if(command === "ping"){
		msg.channel.send("Pong! | *"+(Math.round(100*client.ping)/100.0)+"ms*");

	}

	//Disable a command
	else if(command === "disable"){
		if(msg.member.permissions.hasPermission('MANAGE_CHANNELS'))
			disable.disable(con,msg,args[0]);
		else
			msg.channel.send("Nu! You're not an admin!")
				.then(message => message.delete(3000));
	}

	//Disable a command
	else if(command === "enable"){
		if(msg.member.permissions.hasPermission('MANAGE_CHANNELS'))
			disable.enable(con,msg,args[0]);
		else
			msg.channel.send("Nu! You're not an admin!")
				.then(message => message.delete(3000));
	}

	//Displays info
	else if(command === "stats" || command === "stat"){
		helper.showStats(client,con,msg);
	}

	//If not a command...
	else{ }
}

function executeOther(command,msg,args,isMention){
	ranking.addPoint(con,msg);
	if(isMention && msg.content.toLowerCase().match(/\bkiss\b/))
		msg.channel.send("*blushes* >///<\n*muah!!!*");
	else if(isMention && msg.content.toLowerCase().match(/\bhug\b/))
		msg.channel.send("awww there there...\n*hugs*");
	else if(isMention && (msg.content.toLowerCase().match(/\bpat\b/)||msg.content.toLowerCase().match(/\bpat\b/)))
		msg.channel.send("uwu\ny-yyou're going to mess up my hair..!!");
	else if(isMention && msg.content.toLowerCase().match(/\bslap\b/))
		msg.channel.send("nuu uwu...\nthat's not nice...");
	else if(msg.content === "<@408785106942164992>")
		msg.channel.send("*OwO What's this?!*  Do you need me? Type *owo help* for help!");
}


//Discord login
client.login(auth.token);

//Establish mysql connection
var mysql = require('mysql');
var con = mysql.createConnection({
	host: "localhost",
	user: login.user,
	password: login.pass,
	database: "owo",
	supportBigNumbers: true,
	bigNumberStrings: true,
	multipleStatements: true,
	charset: "utf8mb4"
});

//Display log when connected to mysql
con.connect(function(err){
	if(err) throw err;
	console.log("Connected!");
	lottery.con(con);
	global.con(con);
});

//=============================================================================Console Logs===============================================================

//When the bot client starts
client.on('ready',()=>{
	console.log('Logged in as '+client.user.tag+'!');
	console.log('Bot has started, with '+client.users.size+' users, in '+client.channels.size+' channels of '+client.guilds.size+' guilds.');
	if(!debug){
		setInterval(() => {
			dbl.postStats(client.guilds.size,client.shards.id,client.shards.total);
		}, 3200000);
	}
	global.init(client);
});

//When bot disconnects
client.on('disconnect', function(erMsg, code) {
	    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
	    client.connect();
});

//When bot reconnecting
client.on('reconnecting', () => {
	    console.log('--------------- Bot is reconnecting ---------------');
});

//When bot resumes 
client.on('reconnecting', function(replayed) {
	    console.log('--------------- Bot has resumed ---------------');
});

//When bot joins a new guild
client.on("guildCreate", guild => {
	console.log('New guild joined: '+guild.name+' (id: '+guild.id+'). This guild has '+guild.memberCount+' members!');
	client.user.setActivity('with '+client.guilds.size+' Servers! OwO | \n\'OwO help\' for help!');
	updateActivity();
});

//When bot is kicked from a guild
client.on("guildDelete", guild => {
	console.log('I have been removed from: '+guild.name+' (id: '+guild.id+')');
	client.user.setActivity('with '+client.guilds.size+' Servers! OwO | \n\'OwO help\' for help!');
	updateActivity();
});

function clog(command,args,msg){
	console.log("\x1b[0m\x1b[4mCommand\x1b[0m: %s\x1b[0m \x1b[36m{%s}\x1b[0m \x1b[0m%s\x1b[36m[%s][%s][%s]",command,args,msg.author.username,msg.guild.name,msg.channel.name,msg.channel.id); 
}

function updateActivity(){
	client.shard.fetchClientValues('guilds.size')
		.then(results => {
			client.user.setActivity(`with ${results.reduce((prev, val) => prev + val, 0)} Servers! | 'owo help' for help!`);
		})
		.catch(err => console.error(err));
}
