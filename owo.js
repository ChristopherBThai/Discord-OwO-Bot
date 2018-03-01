//var auth = require('../tokens/owo-auth.json');
var auth = require('../tokens/scuttester-auth.json');
var login = require('../tokens/owo-login.json');


const Discord = require("discord.js");
const client = new Discord.Client();
//const DBL = require("dblapi.js");
//const dbl = new DBL(auth.dbl);

const ranking = require("./methods/ranking.js");
const me = require("./methods/me.js");
const helper = require("./methods/helper.js");
const cowoncy = require("./methods/cowoncy.js");
const zoo = require("./methods/zoo.js");
const slots = require("./methods/slots.js");
const other = require("./methods/other.js");
const feedback = require("./methods/feedback.js");
const admin = require("./methods/admin.js");

var prefix = "owo";

client.on('message',msg => {
	//Special admin commands via DM
	if(msg.author.id===auth.admin&&msg.channel.type==="dm"){
		var adminMsg = msg.content.trim().split(/ +/g);
		const adminCommand = adminMsg.shift().toLowerCase();

		//Reply to a feedback/report/suggestion
		if(adminCommand === 'reply'&&helper.isInt(adminMsg[0])){
			feedback.reply(mysql, con, client, msg, adminMsg);
		}

		//Grabs info of bot
		else if(adminCommand === 'info'){
			admin.info(client,msg);
		}

		else if(adminCommand === 'channel'){
			admin.msgChannel(client,msg.author,adminMsg.shift(),adminMsg.join(' '));
		}

		else if(adminCommand === 'send'){
			admin.send(client,con,msg,adminMsg);
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

		//Displays user ranking
		if (command === 'my' || command === 'me'){
			me.display(con, client, msg, args);
		}

		//Displays top ranking
		else if (command === 'top' || command === 'rank'){
			ranking.display(con, client, msg, args);
		}

		//Displays user's ranking
		else if (command === 'profile' ||
			command === 'guild' || command === 'server' ||
			command === 'zoorank' || command === 'rankzoo' ||
			command === 'moneyrank'){
			msg.channel.send("Some commands have changed! Check `owo help`!");
		}

		//Removes channel to use owo ranking (Admins only)
		else if(command === 'removerank'||command=== 'disablerank'){
			if(msg.member.permissions.hasPermission('MANAGE_CHANNELS')){
				other.disable(con, msg.channel.id);
				msg.channel.send("'owo rank' has been **disabled** for this channel!");			
			} else
				msg.channel.send("*OwO What's this?* You're not and admin!");
		}

		//Adds channel to use owo ranking (Admins only)
		else if(command === 'addrank'||command === 'enablerank'){
			if(msg.member.permissions.has('MANAGE_CHANNELS')){
				other.enable(con, msg.channel.id);
				msg.channel.send("'owo rank' has been **enabled** for this channel!");			
			}else
				msg.channel.send("*OwO What's this?* You're not and admin!");
		}

		//Slots!
		else if (command === 'slot' || command === 'slots'){
			slots.slots(con,msg,args);

		}

		//reply the question with yes or no
		else if(msg.content[msg.content.length-1] === '?'){
				other.eightball(con,msg,isMention,prefix);
			if(Math.floor(Math.random()*100)===0){
				msg.channel.send("**WAIT!** I Changed my mind!");
				other.eightball(con,msg,isMention,prefix);
			}
			isCommand = false;
			clog("?",args,msg);
		}

		//Cowoncy
		else if (command === 'cowoncy'||command === 'credit'||command === 'money'||command === 'cash'||command === 'balance'){
			cowoncy.display(con,client,msg);
		}

		//Daily cowoncy
		else if (command === 'daily'){
			cowoncy.daily(con,msg);
		}

		//Catch an animals
		else if (command === 'catch'||command === 'hunt'){
			clog(command,args,msg);
			isCommand = false;
			zoo.catch(con,msg);
		}

		//SHows the zoo
		else if (command === 'zoo'){
			zoo.display(con,msg);
		}

		//Define a word
		else if (command === 'define'){
			other.define(msg,args.join(" "));
		}

		//Kisses a user
		else if(command === 'kiss'){other.kiss(msg,args);}
		//Hugs a user
		else if(command === 'hug'){other.hug(msg,args);}
		//Spanks a user
		else if(command === 'spank'){other.spank(msg,args);}
		//Slaps a user
		else if(command === 'slap'){other.slap(msg,args);}
		

		//Sends feedback to admin
		else if(command === 'feedback'|| command === 'suggestion' || command === 'report'){
			feedback.send(mysql, con,msg, client.users.get(auth.admin), command, args.join(' '));
		}

		//Displays all the commands
		else if(command === "help" || command === "command"){
			helper.showHelp(msg.channel);
		}

		//Display link for discord invite
		else if(command === "invite" || command === "link"){
			helper.showLink(msg.channel);
		}

		//Ping pong!
		else if(command === "ping"){
			msg.channel.send("Pong! | *"+(Math.round(100*client.ping)/100.0)+"ms*");

		}

		//Displays info
		else if(command === "stats" || command === "stat"){
			helper.showStats(client,con,msg);
		}

		//If not a command...
		else{ 
			ranking.addPoint(con,msg);
			isCommand = false;
			if(isMention && msg.content.toLowerCase().includes("kiss"))
				msg.channel.send("*blushes* >///<\n*muah!!!*");
			else if(isMention && msg.content.toLowerCase().includes("hug"))
				msg.channel.send("awww there there...\n*hugs*");
			else if(isMention && (msg.content.toLowerCase().includes("pat")||msg.content.toLowerCase().includes("pet")))
				msg.channel.send("uwu\ny-yyou're going to mess up my hair..!!");
			else if(isMention && msg.content.toLowerCase().includes("slap"))
				msg.channel.send("nuu uwu...\nthat's not nice...");
			else if(msg.content === "<@408785106942164992>")
				msg.channel.send("*OwO What's this?!*  Do you need me? Type *owo help* for help!");
		}

		//Display the command to logs
		if(isCommand)
			clog(command,args,msg);
	}

	//Add point if they said owo
	else if(msg.content.toLowerCase().includes('owo')||msg.content.toLowerCase().includes('uwu')) ranking.addPoint(con,msg);

});

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
	multipleStatements: true
});

//Display log when connected to mysql
con.connect(function(err){
	if(err) throw err;
	console.log("Connected!");
});

//=============================================================================Console Logs===============================================================

//When the bot client starts
client.on('ready',()=>{
	console.log('Logged in as '+client.user.tag+'!');
	console.log('Bot has started, with '+client.users.size+' users, in '+client.channels.size+' channels of '+client.guilds.size+' guilds.');
	client.user.setActivity('with '+client.guilds.size+' Servers! OwO | \n\'OwO help\' for help!');
	setInterval(() => {
		dbl.postStats(client.guilds.size);
	}, 3200000);
});

//When bot joins a new guild
client.on("guildCreate", guild => {
	console.log('New guild joined: '+guild.name+' (id: '+guild.id+'). This guild has '+guild.memberCount+' members!');
	client.user.setActivity('with '+client.guilds.size+' Servers! OwO | \n\'OwO help\' for help!');
});

//When bot is kicked from a guild
client.on("guildDelete", guild => {
	console.log('I have been removed from: '+guild.name+' (id: '+guild.id+')');
	client.user.setActivity('with '+client.guilds.size+' Servers! OwO | \n\'OwO help\' for help!');
});

function clog(command,args,msg){
	console.log("\x1b[0m\x1b[4mCommand\x1b[0m: %s\x1b[0m \x1b[36m{%s}\x1b[0m \x1b[0m%s\x1b[36m[%s][%s][%s]",command,args,msg.author.username,msg.guild.name,msg.channel.name,msg.channel.id); 
}
