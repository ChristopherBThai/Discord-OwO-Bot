const Discord = require("discord.js");
const client = new Discord.Client();
var auth = require('../tokens/owo-auth.json');
var login = require('../tokens/owo-login.json');
var prefix = "owo";

client.on('message',msg => {
	//Ignore if its a bot
	if(msg.author.bot) return;

	//Check for 'owo' prefix
	if(msg.content.indexOf(prefix) ===0){

		//Grabs command and args
		const args = msg.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		var isCommand = true;


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

		//Displays all the commands
		else if(command === "help"){
			msg.channel.send("*OwO Sorry!* Master hasn't implemented it yet!");
		}

		else{ addPoint(msg.member.id); isCommand = false;}

		if(isCommand)
			console.log("Command: "+command+" {"+args+"}");
	}

	//Add point if they said owo
	else if(msg.content.toLowerCase().includes('owo')) addPoint(msg.member.id);
	
	else if(msg.mentions.users.has(client.user.id)) msg.channel.send("*OwO What's this?!*  Do you need me?");
});

client.login(auth.token);

var mysql = require('mysql');
var con = mysql.createConnection({
	host: "localhost",
	user: login.user,
	password: login.pass,
	database: "owo",
	supportBigNumbers: true,
	bigNumberStrings: true
});


con.connect(function(err){
	if(err) throw err;
	console.log("Connected!");
});

//=======================================================================Ranking System===========================================

function addPoint(id){
	var sql = "INSERT INTO user (id,count) VALUES ("+id+",1) ON DUPLICATE KEY UPDATE count = count +1;"
	con.query(sql,function(err,result){
		if(err) throw err;
		console.log("success for "+id);
	});
}

function getRankingValid(channel,members,chat,args){
	//Check if its disabled
	var sql = "SELECT * FROM blacklist WHERE id = "+channel+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var length = rows.length;
		console.log("Blacklist count: "+rows.length);
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
	console.log("Displaying top "+count);
}

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
	console.log("Displaying top "+count+" global");
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

