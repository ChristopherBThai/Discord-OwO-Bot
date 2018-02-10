//+=========================================+
//||					   ||
//||		RANKING METHODS		   ||
//||					   ||
//+==========================================+

/**
 * Adds an owo point if 10s has passed for each user
 * @param {mysql.Connection}	con - Mysql.createConnection()
 * @param {discord.Message}	msg - Discord's message
 *
 */
exports.addPoint = function(con,msg){
	var id = msg.author.id;
	var guild = msg.guild;
	var sql = "SET @add = 0;"+
		"INSERT INTO user (id,count,lasttime) VALUES ("+id+",1,NOW()) ON DUPLICATE KEY UPDATE count = count + IF(TIMESTAMPDIFF(SECOND,lasttime,NOW())>10,@add:=1,@add:=0),lasttime = NOW();"+
		"INSERT INTO guild (id,count) VALUES ("+guild.id+",1) ON DUPLICATE KEY UPDATE count = count + @add";
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

/**
 * Check for valid arguments to display leaderboards
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg 	- Discord's message
 * @param {string[]}		args 	- Command arguments
 */
exports.display = function(con, client, msg, args){
	var members = msg.guild.members;
	var channel = msg.channel;
	//Check if its disabled
	var sql = "SELECT * FROM blacklist WHERE id = "+channel.id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var length = rows.length;
		console.log("	Blacklist count: "+rows.length);
		if(rows.length>0){
			channel.send("'owo rank' is disabled on this channel!");
			return;
		}else{
			//check for args
			var global = false;
			var guild = false;
			var count = 5;
			if(args.length==1||args.length==2){
				for(var i in args){
					if(args[i]=== "global")
						global = true;
					if(args[i]==="guild"||args[i]==="server")
						guild = true;
					else if(isInt(args[i]))
						count = parseInt(args[i]);
				}
				if (count>25) count = 25;
				else if (count<1) count = 5;
			}
			if(global&&!guild)
				getGlobalRanking(con, client, channel, count);
			else if(guild&&!global)
				getGuildRanking(con, client, channel, count);
			else if(!guild&&!global)
				getRanking(con, client, msg.guild.id, members, channel, count);	
		}
	});
}

/**
 * displays guild ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.User[]}	members	- Guild's members
 * @param {discord.Channel}	channel - Current channel
 * @param {int} 		count 	- number of ranks to display
 */
function getRanking(con, client, guildId, members, channel, count){
	//Grabs top 5
	var sql = "SELECT * FROM user WHERE id IN ( ";
	members.keyArray().forEach(function(ele){
		sql = sql + ele + ",";
	});
	sql = sql.slice(0,-1) + " ) ORDER BY count DESC LIMIT "+count+";";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = "+guildId+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" OwO Rankings for "+client.guilds.get(guildId)+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Guild Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tcollectively said owo "+rows[1][0].count+" times!\n\n";
		}
		rows[0].forEach(function(ele){
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
		embed += ("\n*Spamming owo will not count!!!* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);

	});
	console.log("	Displaying top "+count);
}

/**
 * displays global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Channel}	channel - Current channel
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalRanking(con, client, channel, count){
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
				name = "User Left Bot";
			else
				name = ""+user.username;
			embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
			rank++;
		});
		var date = new Date();
		embed += ("\n*Spamming owo will not count!!!* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
	console.log("	Displaying top "+count+" global");
}

/**
 * Checks if its an integer
 * @param {string}	value - value to check if integer
 *
 */
function isInt(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}

/**
 * displays guild ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Channel}	channel - Current channel
 * @param {int} 		count 	- number of ranks to display
 */
function getGuildRanking(con, client, channel, count){
	//Grabs top 5
	var sql = "SELECT * FROM guild ORDER BY count DESC LIMIT "+count+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Guild OwO Rankings >\n\n";
		rows.forEach(function(ele){
			var id = String(ele.id);
			var guild = client.guilds.get(id);
			var name = "";
			if(guild === undefined || guild.name=== undefined)
				name = "Guild Left Bot";
			else
				name = ""+guild.name;
			embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
			rank++;
		});
		var date = new Date();
		embed += ("\n*Spamming owo will not count!!!* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
	console.log("	Displaying top "+count+" guilds");
}

/**
 * Checks if its an integer
 * @param {string}	value - value to check if integer
 *
 */
function isInt(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}
