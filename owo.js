const Discord = require("discord.js");
const client = new Discord.Client();
var auth = require('../tokens/owo-auth.json');
var login = require('../tokens/owo-login.json');
var prefix = "owo";

var eightballCount = 38;

client.on('message',msg => {
	//Special admin commands via DM
	if(msg.author.id===auth.admin&&msg.channel.type==="dm"){
		var adminMsg = msg.content.trim().split(/ +/g);
		const adminCommand = adminMsg.shift().toLowerCase();

		//Reply to a feedback/report/suggestion
		if(adminCommand === 'reply'&&isInt(adminMsg[0])){
			var feedbackId = parseInt(adminMsg.shift());
			replyFeedback(msg.channel,feedbackId,adminMsg.join(' '));
			console.log("Admin Command: "+adminCommand+" "+feedbackId+" {"+adminMsg+"}");
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
			getRankingValid(msg.channel.id,msg.guild.members,msg.channel,args);
		}

		//Removes channel to use owo ranking (Admins only)
		else if(command === 'removerank'||command=== 'disablerank'){
			if(msg.member.permissions.hasPermission('MANAGE_CHANNELS')){
				disable(msg.channel.id);
				msg.channel.send("'owo rank' has been **disabled** for this channel!");			
			} else
				msg.channel.send("*OwO What's this?* You're not and admin!");
		}

		//Adds channel to use owo ranking (Admins only)
		else if(command === 'addrank'||command === 'enablerank'){
			if(msg.member.permissions.has('MANAGE_CHANNELS')){
				enable(msg.channel.id);
				msg.channel.send("'owo rank' has been **enabled** for this channel!");			
			}else
				msg.channel.send("*OwO What's this?* You're not and admin!");
		}

		//reply the question with yes or no
		else if(msg.content[msg.content.length-1] === '?'){
			eightball(msg,isMention);
			isCommand = false;
			console.log("Command: ? {"+args+"} by "+msg.author.username+"["+msg.guild.name+"]["+msg.channel.name+"]");
		}

		//Sends feedback to admin
		else if(command === 'feedback'|| command === 'suggestion' || command === 'report'){
			feedback(msg.author,command,args.join(' '),client.users.get(auth.admin),msg.channel);
		}

		//Displays all the commands
		else if(command === "help"){
			showHelp(msg.channel);
		}

		//Display link for discord invite
		else if(command === "invite" || command === "link"){
			showLink(msg.channel);
		}

		//If not a command...
		else{ 
			addPoint(msg.author.id,msg);
			isCommand = false;
			if(isMention)
				msg.channel.send("*OwO What's this?!*  Do you need me? Type *owo help* for help!");
		}

		//Display the command to logs
		if(isCommand)
			console.log("Command: "+command+" {"+args+"} by "+msg.author.username+"["+msg.guild.name+"]["+msg.channel.name+"]");
	}

	//Add point if they said owo
	else if(msg.content.toLowerCase().includes('owo')) addPoint(msg.author.id,msg);
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

//=======================================================================Ranking System===========================================

//Adds an owo point if 10s has passed for each user
function addPoint(id,msg){
	var sql = "INSERT INTO user (id,count,lasttime) VALUES ("+id+",1,NOW()) ON DUPLICATE KEY UPDATE count = IF(TIMESTAMPDIFF(SECOND,lasttime,NOW())>10,count+1,count),lasttime = NOW();";
	try{
		con.query(sql,function(err,result){
			if(err){ throw err; return;}
			if(msg.channel.type==="text")
				console.log(""+msg.author.username+"["+msg.guild.name+"]["+msg.channel.name+"] typed '"+msg+"'");
			else
				console.log(""+msg.author.username+" [DM] typed "+msg);
		});
	}catch(err){

	}
}

//Checks if args are valid for ranking
function getRankingValid(channel,members,chat,args){
	//Check if its disabled
	var sql = "SELECT * FROM blacklist WHERE id = "+channel+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var length = rows.length;
		console.log("	Blacklist count: "+rows.length);
		if(rows.length>0){
			chat.send("'owo rank' is disabled on this channel!");
			return;
		}else{
			//check for args
			var global = false;
			var count = 5;
			if(args.length==1||args.length==2){
				for(var i in args){
					if(args[i]=== "global")
						global = true;
					else if(isInt(args[i]))
						count = parseInt(args[i]);
				}
				if (count>25) count = 25;
				else if (count<1) count = 5;
			}
			if(global)
				getGlobalRanking(members,chat,count);
			else
				getRanking(members,chat,count);	
		}
	});
}

//Displays guild ranking
function getRanking(members,chat,count){
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
		var embed = "```md\n< Top "+count+" OwO Rankings >\n\n";
		rows.forEach(function(ele){
			var id = String(ele.id);
			var nickname = members.get(id).nickname;
			var name = "";
			if(nickname)
				name = nickname+" ("+members.get(id).user.username+")";
			else
				name = ""+members.get(id).user.username;
			embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
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

//=============================================================================Enable/Disable Rank===============================================================

//Blacklists a channel for 'owo rank'
function disable(id){
	var sql = "INSERT IGNORE INTO blacklist (id) VALUES ("+id+");"

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
}

//Remove from blacklist
function enable(id){
	var sql = "DELETE FROM blacklist WHERE id = "+id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
}


//=============================================================================EightBall===============================================================

//Eightball, replies as a yes/no answer
function eightball(msg,isMention){
	var id = Math.ceil(Math.random()*eightballCount);
	var sql = "SELECT answer FROM eightball WHERE id = "+id+";";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		var question = msg.content;
		if(isMention)
			question = question.substring(question.indexOf(" ")+1);
		else
			question = question.substring(prefix.length+1);
			
		msg.channel.send("**"+msg.author+" asked:**  "+question+
			"\n**Answer:**  "+rows[0].answer);
		console.log("	question: "+question);
		console.log("	answer: "+rows[0].answer);

		if(Math.floor(Math.random()*100)===0){
			msg.channel.send("**WAIT!** I Changed my mind!");
			eightball(msg,isMention);
		}
	});
}

//=============================================================================Feedback===============================================================

//Sends the feedback to admin's DM
function feedback(sender,type,message,admin,channel){
	if(!message||message === ''){
		channel.send("Silly "+sender + ", you need to add a message!"); 
		return;
	}
	var sql = "INSERT INTO feedback (type,message,sender) values ('"+
		type+"',?,"+
		sender.id+");";
	message = message.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, ':emoji:')
	sql = mysql.format(sql,message);
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		const embed = {
			"color": 10590193,
			"timestamp": new Date(),
			"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"author": {
				"name": "OwO Bot Support",
				"icon_url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"
			},
			"fields": [
				{
					"name":"A user sent a feedback!",
					"value": "==============================================="
				},{
					"name": "Message ID",
					"value": rows.insertId,
					"inline": true
				},{
					"name": "Message Type",
					"value": type,
					"inline": true
				},{
					"name": "From "+sender.username,
					"value": message+"\n\n==============================================="
				}
			]
		};
		channel.send("*OwO What's this?!*  "+sender+", Thanks for the "+type+"!");
		admin.send({embed});
		console.log("	New "+type+" sent to admin's DM");
	});
}

//Replies to feedback
function replyFeedback(dm,feedbackId,reply){
	var sql = "SELECT type,message,sender FROM feedback WHERE id = "+feedbackId+";";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		var user = client.users.get(String(rows[0].sender));
		const embed = {
			"color": 10590193,
			"timestamp": new Date(),
			"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"author": {
				"name": "OwO Bot Support",
				"icon_url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"
			},
			"fields": [
				{
					"name":"Thank you for your feedback!",
					"value": "==============================================="
				},{
					"name": "Message ID",
					"value": feedbackId,
					"inline": true
				},{
					"name": "Message Type",
					"value": rows[0].type,
					"inline": true
				},{
					"name": "Your Message",
					"value": rows[0].message
				},{
					"name": "Reply from Admin",
					"value": reply+"\n\n==============================================="
				}
			]
		};

		user.send({embed});
		dm.send("Replied to user "+user.username);
		console.log("	Replied to a feedback["+feedbackId+"] for "+user.username);
	});
}


//=============================================================================Helpers===============================================================

//Checks if a value is an int
function isInt(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}

//Shows the help commands
function showHelp(channel){
	const embed = {
		"title":"OwO Bot Commands List",
		"url":"https://discordapp.com/oauth2/authorize?client_id=408785106942164992&permissions=2048&scope=bot",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
		"footer":{"text":"owo has a 10 second cooldown for counting"},
		"description": "\n**owo help** - Displays this commands list!"+
			"\n\n**owo rank [global] {count}** - displays the ranking of OwOs \ne.g `owo rank global`, `owo rank 25`, `owo rank global 25`"+
			"\n\n**owo {question}?** - replies as a yes/no answer \ne.g. `owo Am I cute?`"+
			"\n\n**owo feedback|suggestion|report {message}** - sends a message to an admin who will reply back \ne.g `owo feedback I love this bot!`"+
			"\n\n**owo disablerank|removerank** - disables the command 'owo rank' on the current channel"+
			"\n\n**owo enablerank|addrank** - enables the command 'owo rank' on the current channel\n"
	};
	channel.send({embed});
}

//Gives bot invite link
function showLink(channel){
	const embed = {
		"title":"OwO! Click me to invite me to your server!",
		"url":"https://discordapp.com/oauth2/authorize?client_id=408785106942164992&permissions=2048&scope=bot",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
	};
	channel.send({embed});
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


