//+=========================================+
//||					   ||
//||		RANKING METHODS		   ||
//||					   ||
//+=========================================+

/**
 * Adds an owo point if 10s has passed for each user
 * @param {mysql.Connection}	con - Mysql.createConnection()
 * @param {discord.Message}	msg - Discord's message
 *
 */
exports.addPoint = function(con,msg){
	var id = msg.author.id;
	var guild = msg.guild;
	var text = msg.content.replace(/(\n)+/g," | ");
	try{
		var sql = "SELECT id FROM timeout WHERE id = "+id+" AND TIMESTAMPDIFF(HOUR,time,NOW()) < penalty"
		con.query(sql,function(err,result){
			if(err) throw err;
			if(result[0]!=null||result[0]!=undefined){
				//console.log("\x1b[0m----%s\x1b[36m[%s][%s][%s]",msg.author.username+" typed '"+text+"'",msg.guild,msg.channel.name,msg.channel.id); 
			}else{
				sql = "SET @add = 0;SET @diff = TIMESTAMPDIFF(SECOND,(SELECT lasttime FROM user WHERE id = "+id+"),NOW());"+
				"UPDATE user SET spamcount = IF(ABS(previnterval-@diff)<=1,spamcount+1,0),previnterval = IF(@diff>10000 AND @diff>9,0,@diff),spamintervalcount = IF(TIMESTAMPDIFF(MINUTE,spaminterval,NOW())>=30,0,spamintervalcount+1), spaminterval = IF(TIMESTAMPDIFF(MINUTE,spaminterval,NOW())>=30,NOW(),spaminterval),spamintervallongcount = IF(TIMESTAMPDIFF(DAY,spamintervallong,NOW())>=1,0,spamintervallongcount+1), spamintervallong = IF(TIMESTAMPDIFF(DAY,spamintervallong,NOW())>=1,NOW(),spamintervallong) WHERE id = "+id+";"+
				"INSERT INTO user (id,count,lasttime) VALUES ("+id+",1,NOW()) ON DUPLICATE KEY UPDATE count = count + IF(@diff>10 AND spamcount < 11 AND spamintervalcount < 100 AND spamintervallongcount < 1200,@add:=1,@add:=0),lasttime = IF(@diff>10 AND spamcount < 11,NOW(),lasttime);"+
				"INSERT INTO guild (id,count) VALUES ("+guild.id+",1) ON DUPLICATE KEY UPDATE count = count + @add;SELECT spamcount,spamintervalcount,spamintervallongcount FROM user WHERE id = "+id+";"+
				"INSERT INTO cowoncy (id,money) VALUES ("+id+",1) ON DUPLICATE KEY UPDATE money = money + @add;";
				con.query(sql,function(err,result){
					if(err){ throw err; return;}
					var spam = result[5][0].spamcount;
					var spam2 = result[5][0].spamintervalcount;
					var spam3 = result[5][0].spamintervallongcount;
					if(msg.channel.type==="text")
						console.log("\x1b[0m%s\x1b[36m[%s][%s][%s]",msg.author.username+" typed '"+text+"'",msg.guild,msg.channel.name,msg.channel.id); 
					else
						console.log("[DM]"+msg.author.username+" typed "+text);
					if(spam>=10||spam2>=100||spam3>1200){
						console.log("\x1b[36m%s\x1b[0m","    Spam detected!");
						var penalty = 1;
						if(spam3>1200)
							penalty = 5;
						sql = "INSERT INTO timeout (id,time,count,penalty) VALUES ("+id+",NOW(),1,1) ON DUPLICATE KEY UPDATE time = NOW(),count=count+1,penalty = penalty + "+penalty+";SELECT penalty FROM timeout WHERE id = "+id+";UPDATE user SET spamintervallongcount = 0,spamintervalcount = 0,spamcount = 0 WHERE id = "+id+";";
						con.query(sql,function(err,rows,fields){
							console.log("\x1b[36m%s\x1b[0m","    Putting user in timeout for "+rows[1][0].penalty+"H");
							msg.author.send("***OwO What's This?!?***\nYou have been timed out for "+rows[1][0].penalty+"H due to spam or macros! \nIf you feel like this is a mistake, use `owo feedback` in a channel to get it fixed!");
						});
					}

				});
			}
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
	var channel = msg.channel;
	//Check if its disabled
	var sql = "SELECT * FROM blacklist WHERE id = "+channel.id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var length = rows.length;
		if(rows.length>0){
			channel.send("Command is disabled on this channel!");
			console.log("\x1b[36m%s\x1b[0m","    Command disabled");
			return;
		}else{
			//check for args
			var global = false;

			var points = false;
			var guild = false;
			var money = false;
			var zoo = false;

			var invalid = false;
			var count = 5;

			for(var i in args){
				if(!points&&!guild&&!money&&!zoo){
					if(args[i]=== "points"||args[i]==="point"||args[i]==="p")
						points = true;
					else if(args[i]==="guild"||args[i]==="server"||args[i]==="s"||args[i]==="g")
						guild = true;
					else if(args[i]=== "zoo"||args[i]==="z")
						zoo = true;
					else if(args[i]=== "cowoncy"||args[i]==="money"||args[i]==="m"||args[i]==="c")
						money = true;
					else if(args[i]==="global"||args[i]==="g") 
						global = true;
					else
						invalid = true;
				}else if(args[i]==="global"||args[i]==="g") global = true;
				else if(isInt(args[i])) count = parseInt(args[i]);
				else invalid = true;
			}
			if (count>25) count = 25;
			else if (count<1) count = 5;

			if(invalid)
				msg.channel.send("Invalid ranking type!");
			else if(global){
				if(points)
					getGlobalRanking(con,client,msg,count);
				else if(guild)
					getGuildRanking(con,client,msg,count);
				else if(zoo)
					getGlobalZooRanking(con,client,msg,count);
				else if(money)
					getGlobalMoneyRanking(con,client,msg,count);
				else
					getGlobalRanking(con,client,msg,count);
			}else{
				if(points)
					getRanking(con,client,msg,count);
				else if(guild)
					getGuildRanking(con,client,msg,count);
				else if(zoo)
					getZooRanking(con,client,msg,count);
				else if(money)
					getMoneyRanking(con,client,msg,count);
				else
					getRanking(con,client,msg,count);
			}
		}
	});
}

/**
 * displays guild ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.User[]}	members	- Guild's members
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getRanking(con, client, msg, count){
	var userids = getids(msg.guild.members);
	var channel = msg.channel;
	var guildId = msg.guild.id;

	//Grabs top 5
	var sql = "SELECT * FROM user WHERE id IN ( "+userids+ " ) ORDER BY count DESC LIMIT "+count+";";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE id IN ("+userids+") AND count > u.count) AS rank FROM user u WHERE u.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" OwO Rankings for "+client.guilds.get(guildId)+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tyou said owo "+rows[1][0].count+" times!\n\n";
		}
		rows[0].forEach(function(ele){
			var id = String(ele.id);
			var nickname = msg.guild.members.get(id).nickname;
			var name = "";
			if(nickname)
				name = nickname+" ("+msg.guild.members.get(id).user.username+")";
			else
				name = ""+msg.guild.members.get(id).user.username;
			name = name.replace("discord.gg","discord,gg");
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
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalRanking(con, client, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM user ORDER BY count DESC LIMIT "+count+";";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global OwO Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Global Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tyou said owo "+rows[1][0].count+" times!\n\n";
		}
		rows[0].forEach(function(ele){
			var id = String(ele.id);
			var user = client.users.get(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
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
 * displays guild ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGuildRanking(con, client, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM guild ORDER BY count DESC LIMIT "+count+";";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = "+msg.guild.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Guild OwO Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Guild Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tcollectively said owo "+rows[1][0].count+" times!\n\n";
		}
		rows[0].forEach(function(ele){
			var id = String(ele.id);
			var guild = client.guilds.get(id);
			var name = "";
			if(guild === undefined || guild.name=== undefined)
				name = "Guild Left Bot";
			else
				name = ""+guild.name;
			name = name.replace("discord.gg","discord,gg");
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
 * displays zoo ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getZooRanking(con, client, msg, count){
	var channel = msg.channel;
	var users = getids(msg.guild.members);
	//Grabs top 5
	var sql = "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points DESC LIMIT "+count+";";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) AND id IN ("+users+")) AS rank FROM animal_count a WHERE a.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Zoo Rankings for "+client.guilds.get(msg.guild.id)+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Zoo Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\t"+rows[1][0].points+" zoo points: ";
			if(rows[1][0].legendary>0)
				embed += "L-"+rows[1][0].legendary+", ";
			embed += "M-"+rows[1][0].mythical+", ";
			embed += "E-"+rows[1][0].epic+", ";
			embed += "R-"+rows[1][0].rare+", ";
			embed += "U-"+rows[1][0].uncommon+", ";
			embed += "C-"+rows[1][0].common+"\n\n";

		}
		rows[0].forEach(function(ele){
			var id = String(ele.id);
			var user = client.users.get(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
			if(ele.legendary>0)
				embed += "L-"+ele.legendary+", ";
			embed += "M-"+ele.mythical+", ";
			embed += "E-"+ele.epic+", ";
			embed += "R-"+ele.rare+", ";
			embed += "U-"+ele.uncommon+", ";
			embed += "C-"+ele.common+"\n";
			rank++;
		});
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
	console.log("	Displaying top "+count+" zoo");
}

/**
 * displays global zoo ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalZooRanking(con, client, msg, count){
	channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points FROM animal_count ORDER BY points DESC LIMIT "+count+";";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) ) AS rank FROM animal_count a WHERE a.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global Zoo Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Zoo Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\t"+rows[1][0].points+" zoo points: ";
			if(rows[1][0].legendary>0)
				embed += "L-"+rows[1][0].legendary+", ";
			embed += "M-"+rows[1][0].mythical+", ";
			embed += "E-"+rows[1][0].epic+", ";
			embed += "R-"+rows[1][0].rare+", ";
			embed += "U-"+rows[1][0].uncommon+", ";
			embed += "C-"+rows[1][0].common+"\n\n";

		}
		rows[0].forEach(function(ele){
			var id = String(ele.id);
			var user = client.users.get(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
			if(ele.legendary>0)
				embed += "L-"+ele.legendary+", ";
			embed += "M-"+ele.mythical+", ";
			embed += "E-"+ele.epic+", ";
			embed += "R-"+ele.rare+", ";
			embed += "U-"+ele.uncommon+", ";
			embed += "C-"+ele.common+"\n";
			rank++;
		});
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
	console.log("	Displaying top "+count+" global zoo");
}

/**
 * displays cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getMoneyRanking(con, client, msg, count){
	var users = getids(msg.guild.members);
	var channel = msg.channel;
	var sql = "SELECT * FROM cowoncy WHERE id IN ("+users+") ORDER BY money DESC LIMIT "+count+";";
	sql +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE id IN ("+users+") AND money > c.money) AS rank FROM cowoncy c WHERE c.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Cowoncy Rankings for "+client.guilds.get(msg.guild.id)+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tCowoncy: "+rows[1][0].money+"\n\n";
		}
		rows[0].forEach(function(ele){
			var id = String(ele.id);
			var user = client.users.get(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
			rank++;
		});
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
	console.log("	Displaying top "+count+" cowoncy");
}


/**
 * displays global cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalMoneyRanking(con, client, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM cowoncy ORDER BY money DESC LIMIT "+count+";";
	sql +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > c.money) AS rank FROM cowoncy c WHERE c.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global Cowoncy Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tCowoncy: "+rows[1][0].money+"\n\n";
		}
		rows[0].forEach(function(ele){
			var id = String(ele.id);
			var user = client.users.get(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
			rank++;
		});
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
	console.log("	Displaying top "+count+" global cowoncy");
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
 * Grabs all id from guild
 */
function getids(members){
	var result = "";
	members.keyArray().forEach(function(ele){
		result += ele + ",";
	});
	return result.slice(0,-1);
}

