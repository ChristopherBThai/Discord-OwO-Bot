const Discord = require("discord.js");
const client = new Discord.Client();
const ranking = require("./methods/ranking.js");
const helper = require("./methods/helper.js");
const other	= require("./methods/other.js");
const feedback = require("./methods/feedback.js");
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

	//Commands
	if(isCommand){
		const command = args.shift().toLowerCase();

		//Displays top ranking
		if (command === 'ranking'||command === 'rank'){
			ranking.display(con, client, msg, args);
		}

		//Displays user's ranking
		else if (command === 'me' || command === 'profile'){
			//showMe(msg,args);
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
				eightball(con, msg, isMention);
			}
			isCommand = false;
			console.log("Command: ? {"+args+"} by "+msg.author.username+"["+msg.guild.name+"]["+msg.channel.name+"]");
		}

		//Sends feedback to admin
		else if(command === 'feedback'|| command === 'suggestion' || command === 'report'){
			feedback.send(mysql, con,msg, client.users.get(auth.admin), command, args.join(' '));
		}

		//Displays all the commands
		else if(command === "help"){
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
			if(isMention)
				msg.channel.send("*OwO What's this?!*  Do you need me? Type *owo help* for help!");
		}

		//Display the command to logs
		if(isCommand)
			console.log("Command: "+command+" {"+args+"} by "+msg.author.username+"["+msg.guild.name+"]["+msg.channel.name+"]");
	}

	//Add point if they said owo
	else if(msg.content.toLowerCase().includes('owo')) ranking.addPoint(msg.author.id,msg);
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
	bigNumberStrings: true
});

//Display log when connected to mysql
con.connect(function(err){
	if(err) throw err;
	console.log("Connected!");
});
//=======================================================================Show me===========================================

//Checks if args are valid for ranking
function getMeValid(channel,members,chat,args){
	//Check if its disabled
	var sql = "SELECT * FROM blacklist WHERE id = "+channel+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var length = rows.length;
		console.log("	Blacklist count: "+rows.length);
		if(rows.length>0){
			chat.send("'owo me' is disabled on this channel!");
			return;
		}else{
			//check for args
			var global = false;
			if(args.length==1&&args[0]=== "global"){
				getGlobalMe(members,chat);
			}else
				getMe(members,chat);	
		}
	});
}

//Displays guild ranking
function getMe(members,chat,oid){
	//Grabs top 5
	var sql = "SELECT * FROM user WHERE id IN ( ";
	members.keyArray().forEach(function(ele){
		sql = sql + ele + ",";
	});
	sql = sql.slice(0,-1) + " ) ORDER BY count DESC LIMIT "+count+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< "+member.get(oid).nickname+"'s OwO Ranking >\n\n";
		rows.forEach(function(ele){
			var id = String(ele.id);
			var nickname = members.get(id).nickname;
			var name = "";
			if(nickname)
				name = nickname+" ("+members.get(id).user.username+")";
			else
				name = ""+members.get(id).user.username;
			if(oid===id)

				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
			else
			rank++;
		});
		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		chat.send(embed);

	});
	console.log("	Displaying top "+count);
}

//Displays global ranking
function getGlobalRanking(members,chat,count){
	//Grabs top 5
	var sql = "SELECT * FROM user ORDER BY count DESC LIMIT "+count+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global OwO Rankings >\n\n";
		rows.forEach(function(ele){
			var id = String(ele.id);
			var user = client.users.get(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Discord";
			else
				name = ""+user.username;
			embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
			rank++;
		});
		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		chat.send(embed);
	});
	console.log("	Displaying top "+count+" global");
}



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


