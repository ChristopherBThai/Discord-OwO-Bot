//+=========================================+
//||					   ||
//||		ME METHODS		   ||
//||					   ||
//+==========================================+

const global = require('./global.js');

/**
 * Check for valid arguments to display leaderboards
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg 	- Discord's message
 * @param {string[]}		args 	- Command arguments
 */
exports.display = function(con, client, msg, args){
	var channel = msg.channel;
	var id = msg.author.id;
	//Check if its disabled
	var sql = "SELECT * FROM blacklist WHERE id = "+channel.id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var length = rows.length;
		console.log("	Blacklist count: "+rows.length);
		if(rows.length>0){
			channel.send("This command is disabled on this channel!");
			return;
		}else{
			var global = false;
			var invalid = false;
			var points = false;
			var guild = false;
			var zoo = false;
			var money = false;

			for(var i in args){
				if(!points&&!guild&&!money&&!zoo){
					if(args[i]=== "points"||args[i]==="point"||args[i]==="p")
						points = true;
					else if(args[i]==="guild"||args[i]==="server"||args[i]==="g"||args[i]==="s")
						guild = true;
					else if(args[i]=== "zoo"||args[i]==="z")
						zoo = true;
					else if(args[i]=== "cowoncy"||args[i]==="money"||args[i]==="c"||args[i]==="m")
						money = true;
					else if(args[i]==="global"||args[i]==="g") 
						global = true;
					else
						invalid = true;
				}else if(args[i]==="global"||args[i]==="g") global = true;
				else invalid = true;
			}
			
			if(invalid)
				msg.channel.send("Wrong arguments! :c Go check `owo help`!");
			else if(global){
				if(points)
					getGlobalPointRanking(con,client,msg,id);
				else if(guild)
					getGuildRanking(con,client,msg,msg.guild.id);
				else if(zoo)
					getGlobalZooRanking(con,client,msg,id);
				else if(money)
					getGlobalMoneyRanking(con,client,msg,id);
				else
					getGlobalPointRanking(con,client,msg,id);
			}else{
				if(points)
					getPointRanking(con,client,msg,id);
				else if(guild)
					getGuildRanking(con,client,msg,msg.guild.id);
				else if(zoo)
					getZooRanking(con,client,msg,id);
				else if(money)
					getMoneyRanking(con,client,msg,id);
				else
					getPointRanking(con,client,msg,id);
			}
		}
	});
}

/**
 * displays global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User Message
 * @param {int} 		id	- User id
 */
function getGlobalPointRanking(con, client, msg, id){
	var channel = msg.channel;
	//Sql statements
	var sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = "+id+";";

	//query sql
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You haven't said 'owo' yet!");
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		above.reverse().forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.users.get(me.id).username;
		name = name.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+name+" >\n\t\tsaid owo "+me.count+" times!\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;
			}

		});

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+name+"'s Global OwO Ranking >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Global OwO Ranking >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n" + embed;
		if(rank-userRank==3)
			embed += ">...\n";

		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
}

/**
 * displays ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User Message
 * @param {int} 		id	- User id
 */
function getPointRanking(con, client, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql statements
	var sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN ("+users+") ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN ("+users+") ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count AND id IN ("+users+") ) AS rank FROM user u WHERE u.id = "+id+";";

	//query sql
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You haven't said 'owo' yet!");
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		above.reverse().forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.users.get(me.id).username;
		name = name.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+name+" >\n\t\tsaid owo "+me.count+" times!\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;
			}

		});

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+name+"'s OwO Ranking for "+client.guilds.get(msg.guild.id)+" >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s OwO Ranking for "+client.guilds.get(msg.guild.id)+" >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n" + embed;
		if(rank-userRank==3)
			embed += ">...\n";

		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
}



/**
 * displays guild's ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		id 	- User's id
 */
function getGuildRanking(con, client, msg, id){
	var channel = msg.channel;
	//Sql statements
	var sql = "SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count ASC ) AS g1 ON g1.count > g.count WHERE g.id = "+id+" ORDER BY g1.count ASC LIMIT 2;";
	sql   +=  "SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count DESC ) AS g1 ON g1.count < g.count WHERE g.id = "+id+" ORDER BY g1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = "+id+";";

	//Sql query
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You haven't said 'owo' yet!");
			return
		}
		var guildRank = parseInt(me.rank);
		var rank = guildRank - above.length;
		var embed = "";

		//People above user
		above.reverse().forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var guild = client.guilds.get(id);
				var name = "";
				if(guild === undefined || guild.name === undefined)
					name = "Guild Left Bot";
				else
					name = ""+guild.name;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.guilds.get(me.id).name;
		name = name.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+name+" >\n\t\tcollectively said owo "+me.count+" times!\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var guild = client.guilds.get(id);
				var name = "";
				if(guild === undefined || guild.name === undefined)
					name = "Guild Left Bot";
				else
					name = ""+guild.name;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
				rank++;
			}

		});

		//Add top and bottom
		if(guildRank>3)
			embed = "```md\n< "+name+"'s Global Ranking >\nYour guild rank is: "+guildRank+"\n>\t\tcollectively said owo "+rows[2][0].count+" times!\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Global Ranking >\nYour guild rank is: "+guildRank+"\n\n>\t\tcollectively said owo "+rows[2][0].count+" times!\n\n" + embed;

		if(rank-guildRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
}

/**
 * displays zoo global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg 	- User's message
 * @param {int} 		id	- User's id
 */
function getGlobalZooRanking(con, client, msg, id){
	var channel = msg.channel;
	//Sql statements
	var sql = "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points FROM animal_count ORDER BY points ASC ) AS a1 ON a1.points > (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) WHERE a.id = "+id+" ORDER BY a1.points ASC LIMIT 2;";
	sql   +=  "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points FROM animal_count ORDER BY points DESC ) AS a1 ON a1.points < (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) WHERE a.id = "+id+" ORDER BY a1.points DESC LIMIT 2;";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) ) AS rank FROM animal_count a WHERE a.id = "+id+";";

	//SQL query
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any animals!");
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		above.reverse().forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
				if(ele.legendary>0)
					embed += "L-"+ele.legendary+", ";
				embed += "M-"+ele.mythical+", ";
				embed += "E-"+ele.epic+", ";
				embed += "R-"+ele.rare+", ";
				embed += "U-"+ele.uncommon+", ";
				embed += "C-"+ele.common+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.users.get(me.id).username;
		embed += "< "+rank+"\t"+name+" >\n\t\t"+me.points+" zoo points: ";
		if(me.legendary>0)
			embed += "L-"+me.legendary+", ";
		embed += "M-"+me.mythical+", ";
		embed += "E-"+me.epic+", ";
		embed += "R-"+me.rare+", ";
		embed += "U-"+me.uncommon+", ";
		embed += "C-"+me.common+"\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				if(ele.legendary>0)
					embed += "L-"+ele.legendary+", ";
				embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
				embed += "M-"+ele.mythical+", ";
				embed += "E-"+ele.epic+", ";
				embed += "R-"+ele.rare+", ";
				embed += "U-"+ele.uncommon+", ";
				embed += "C-"+ele.common+"\n";
				rank++;

			}

		});

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+name+"'s Zoo Ranking >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Zoo Ranking >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
}

/**
 * displays zoo ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg 	- User's message
 * @param {int} 		id	- User's id
 */
function getZooRanking(con, client, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql statements
	var sql = "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points ASC ) AS a1 ON a1.points > (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) WHERE a.id = "+id+" ORDER BY a1.points ASC LIMIT 2;";
	sql   +=  "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points DESC ) AS a1 ON a1.points < (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) WHERE a.id = "+id+" ORDER BY a1.points DESC LIMIT 2;";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000) AND id IN ("+users+") ) AS rank FROM animal_count a WHERE a.id = "+id+";";

	//SQL query
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any animals!");
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		above.reverse().forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
				if(ele.legendary>0)
					embed += "L-"+ele.legendary+", ";
				embed += "M-"+ele.mythical+", ";
				embed += "E-"+ele.epic+", ";
				embed += "R-"+ele.rare+", ";
				embed += "U-"+ele.uncommon+", ";
				embed += "C-"+ele.common+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.users.get(me.id).username;
		embed += "< "+rank+"\t"+name+" >\n\t\t"+me.points+" zoo points: ";
		if(me.legendary>0)
			embed += "L-"+me.legendary+", ";
		embed += "M-"+me.mythical+", ";
		embed += "E-"+me.epic+", ";
		embed += "R-"+me.rare+", ";
		embed += "U-"+me.uncommon+", ";
		embed += "C-"+me.common+"\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				if(ele.legendary>0)
					embed += "L-"+ele.legendary+", ";
				embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
				embed += "M-"+ele.mythical+", ";
				embed += "E-"+ele.epic+", ";
				embed += "R-"+ele.rare+", ";
				embed += "U-"+ele.uncommon+", ";
				embed += "C-"+ele.common+"\n";
				rank++;

			}

		});

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+name+"'s Zoo Ranking for "+client.guilds.get(msg.guild.id)+" >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Zoo Ranking for "+client.guilds.get(msg.guild.id)+" >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
}


/**
 * displays global cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getGlobalMoneyRanking(con, client, msg, id){
	var channel = msg.channel;
	//Sql
	var sql = "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = "+id+" ORDER BY u1.money ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = "+id+" ORDER BY u1.money DESC LIMIT 2;";
	sql   +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money ) AS rank FROM cowoncy u WHERE u.id = "+id+";";

	//query
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any cowoncy yet!");
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		above.reverse().forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.users.get(me.id).username;
		name = name.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+name+" >\n\t\tCowoncy: "+me.money+"\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
				rank++;

			}

		});

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+name+"'s Global Cowoncy Ranking >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Global Cowoncy Ranking >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
}

/**
 * displays cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getMoneyRanking(con, client, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql
	var sql = "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN ("+users+") ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = "+id+" ORDER BY u1.money ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN ("+users+") ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = "+id+" ORDER BY u1.money DESC LIMIT 2;";
	sql   +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money AND id IN ("+users+") ) AS rank FROM cowoncy u WHERE u.id = "+id+";";

	//query
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any cowoncy yet!");
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		above.reverse().forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.users.get(me.id).username;
		name = name.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+name+" >\n\t\tCowoncy: "+me.money+"\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = client.users.get(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
				rank++;

			}

		});

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+name+"'s Cowoncy Ranking for "+client.guilds.get(msg.guild.id)+" >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Cowoncy Ranking for "+client.guilds.get(msg.guild.id)+" >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
}

