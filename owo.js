const Discord = require("discord.js");
const client = new Discord.Client();
const ranking = require("./methods/ranking.js");
const me = require("./methods/me.js");
const helper = require("./methods/helper.js");
const other	= require("./methods/other.js");
const feedback = require("./methods/feedback.js");
const admin = require("./methods/admin.js");
var auth = require('../tokens/owo-auth.json');
var login = require('../tokens/owo-login.json');
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
	if(msg.content.replace(/[hs'?]|\s/g,"")==="owowatti"){
		isCommand = false;
		msg.channel.send("*owo*");
	}

	//Commands
	if(isCommand){
		const command = args.shift().toLowerCase();

		//Displays top ranking
		if (command === 'top'||command === 'ranking'||command === 'rank'){
			ranking.display(con, client, msg, args);
		}

		//Displays user's ranking
		else if (command === 'me' || command === 'profile'){
			me.display(con, client, msg, args, msg.author.id, true);
		}

		//Displays guild's ranking
		else if (command === 'guild' || command === 'server'){
			me.display(con, client, msg, args, msg.guild.id, false);
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

		//reply the question with yes or no
		else if(msg.content[msg.content.length-1] === '?'){
				other.eightball(con,msg,isMention,prefix);
			if(Math.floor(Math.random()*100)===0){
				msg.channel.send("**WAIT!** I Changed my mind!");
				other.eightball(con,msg,isMention,prefix);
			}
			isCommand = false;
			console.log("Command: ? {"+args+"} ["+msg.guild.name+"]["+msg.channel.name+"]["+msg.channel.id+"]"+msg.author.username);
		}

		//Kisses a user
		else if(command === 'kiss'){
			other.kiss(msg,args);

		}

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

		//If not a command...
		else{ 
			ranking.addPoint(con,msg);
			isCommand = false;
			if(isMention && args.length==0)
				msg.channel.send("*OwO What's this?!*  Do you need me? Type *owo help* for help!");
		}

		//Display the command to logs
		if(isCommand)
			console.log("Command: "+command+" {"+args+"} ["+msg.guild.name+"]["+msg.channel.name+"]["+msg.channel.id+"]"+msg.author.username);
	}

	//Add point if they said owo
	else if(msg.content.toLowerCase().includes('owo')) ranking.addPoint(con,msg);

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


