const Discord = require("discord.js");
const client = new Discord.Client();
var auth = require('../tokens/owo-auth.json');
var login = require('../tokens/owo-login.json');
var prefix = "owo";

var eightballCount = 29;

client.on('message',msg => {
	//Special admin commands via DM
	if(msg.author.id===auth.admin&&msg.channel.type==="dm"){
		var adminMsg = msg.content.trim().split(/ +/g);
		const adminCommand = adminMsg.shift().toLowerCase();

		//Reply to a feedback/report/suggestion
		if(adminCommand === 'reply'&&isInt(adminMsg[0])){
			var feedbackId = parseInt(adminMsg.shift());
			replyFeedback(feedbackId,adminMsg.join(' '));
		}
	}

	//Ignore if its a bot or DM
	if(msg.author.bot||msg.channel.type!=="text") return;

	//Check if command
	var args = "";
	var isMention = false;;
	var isCommand = false;
	//Check for 'owo' prefix
	if(msg.content.indexOf(prefix) === 0){
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
			if(msg.member.permissions.hasPermission('MANAGE_CHANNELS')){
				enable(msg.channel.id);
				msg.channel.send("'owo rank' has been **enabled** for this channel!");			
			}else
				msg.channel.send("*OwO What's this?* You're not and admin!");
		}

		//reply the question with yes or no
		else if(msg.content[msg.content.length-1] === '?'){
			eightball(msg,isMention);
			isCommand = false;
			console.log("Command: eightball");
		}

		//Sends feedback to admin
		else if(command === 'feedback'|| command === 'suggestion' || command === 'report'){
			feedback(msg.author,command,args.join(' '),client.users.get(auth.admin),msg.channel);
		}

		//Displays all the commands
		else if(command === "help"){
			showHelp(msg.channel);
		}

		//If not a command...
		else{ 
			addPoint(msg.author.id);
			isCommand = false;
			if(isMention)
				msg.channel.send("*OwO What's this?!*  Do you need me?");
		}

		//Display the command to logs
		if(isCommand)
			console.log("Command: "+command+" {"+args+"}");
	}

	//Add point if they said owo
	else if(msg.content.toLowerCase().includes('owo')) addPoint(msg.author.id);
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

//Adds an owo point
function addPoint(id){
	var sql = "INSERT INTO user (id,count) VALUES ("+id+",1) ON DUPLICATE KEY UPDATE count = count +1;"
	con.query(sql,function(err,result){
		if(err) throw err;
		console.log("success for "+id);
	});
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
		rows.forEach(function(ele){
			var id = String(ele.id);
			var nickname = members.get(id).nickname;
			var name = "";
			if(nickname)
				name = nickname+" *("+members.get(id).user.username+")*";
			else
				name = ""+members.get(id).user.username;
			ranking.push({
				"name": rank+". "+name,
				"value": "said *OwO*  __"+ele.count+"__ times!"
			});
			rank++;
		});
		const embed = {
			"color": 4886754,
			"timestamp":new Date(),
			"fields": ranking
		};
		chat.send("**Top "+count+" *OwO* Rankings**",{ embed });
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
		rows.forEach(function(ele){
			var id = String(ele.id);
			var name = ""+client.users.get(id).username;
			ranking.push({
				"name": rank+". "+name,
				"value": "said *OwO*  __"+ele.count+"__ times!"
			});
			rank++;
		});
		const embed = {
			"color": 4886754,
			"timestamp":new Date(),
			"fields": ranking
		};
		chat.send("**Top "+count+" *OwO* Global Rankings**",{ embed });
	});
	console.log("	Displaying top "+count+" global");
}

//=============================================================================Enable/Disable Rank===============================================================

//Blacklists a channel
function disable(id){
	var sql = "INSERT IGNORE INTO blacklist (id) VALUES ("+id+");"

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
}

function enable(id){
	var sql = "DELETE FROM blacklist WHERE id = "+id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
}


//=============================================================================EightBall===============================================================

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

//=============================================================================Console Logs===============================================================

client.on('ready',()=>{
	console.log('Logged in as '+client.user.tag+'!');
	console.log('Bot has started, with '+client.users.size+' users, in '+client.channels.size+' channels of '+client.guilds.size+' guilds.');
	client.user.setActivity('with '+client.users.size+' Users! OwO');
});

client.on("guildCreate", guild => {
	console.log('New guild joined: '+guild.name+' (id: '+guild.id+'). This guild has '+guild.memberCount+' members!');
	client.user.setActivity('with '+client.users.size+' Users! OwO');
});

client.on("guildDelete", guild => {
	console.log('I have been removed from: '+guild.name+' (id: '+guild.id+')');
	client.user.setActivity('with '+client.users.size+' Users! OwO');
});

//=============================================================================Helpers===============================================================

function isInt(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}

function showHelp(channel){
	const embed = {
		"title":"OwO Bot Commands List",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
		"description": "\n**owo help** - Displays this commands list!"+
			"\n\n**owo rank [global] {count}** - displays the ranking of OwOs e.g *'owo rank global' 'owo rank 25' 'owo rank global 25'*"+
			"\n\n**owo disablerank|removerank** - disables the command 'owo rank' on the current channel"+
			"\n\n**owo enablerank|addrank** - enables the command 'owo rank' on the current channel"+
			"\n\n**owo {question}?** - replies as a yes/no answer e.g. *'owo Am I cute?'*"+
			"\n\n**owo feedback|suggestion|report {message}** - sends a message to an admin who will reply back e.g *'owo feedback I love this bot!'*"
	};
	channel.send({embed});
}

//Sends the feedback to admin's DM
function feedback(sender,type,message,admin,channel){
	if(!message||message === ''){
		channel.send("Silly "+sender + ", you need to add a message!"); 
		return;
	}
	var sql = "INSERT INTO feedback (type,message,sender) values ('"+
		type+"',?,"+
		sender.id+");";
	sql = mysql.format(sql,message);
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		admin.send("**ID:**  "+rows.insertId+
			"\n**From:**  "+sender.username+
			"\n**Type:**  "+type+
			"\n**Message:**  "+message);
		console.log("	New "+type+" sent to admin's DM");
	});
}

//Replies to feedback
function replyFeedback(feedbackId,reply){
	var sql = "SELECT type,message,sender FROM feedback WHERE id = "+feedbackId+";";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		client.users.get(String(rows[0].sender)).send("**Thank you for your "+rows[0].type+"!**"+
			"\n**"+rows[0].type+" ID:**  "+feedbackId+
			"\n**Your "+rows[0].type+":**  "+rows[0].message+
			"\n**My Response:**  "+reply+
			"\n*do not reply*");
		console.log("	Replied to a feedback["+feedbackId+"]");
	});
}

