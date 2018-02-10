//+=========================================+
//||					   ||
//||		ME METHODS		   ||
//||					   ||
//+==========================================+

/**
 * Check for valid arguments to display leaderboards
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg 	- Discord's message
 * @param {string[]}		args 	- Command arguments
 */
exports.display = function(con, client, msg, args, id, isUser){
	var channel = msg.channel;
	//Check if its disabled
	var sql = "SELECT * FROM blacklist WHERE id = "+channel.id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var length = rows.length;
		console.log("	Blacklist count: "+rows.length);
		if(rows.length>0){
			channel.send("'owo me' is disabled on this channel!");
			return;
		}else{
			//check for args
			if(args.length==0)
				if(isUser)
					getGlobalRanking(con, client, channel, id);
				else
					getGuildRanking(con, client, channel, id);
		}
	});
}

/**
 * displays global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.Channel}	channel - Current channel
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalRanking(con, client, channel, id){
	//Grabs top 5
	var sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = "+id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
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
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.users.get(me.id).username;
		embed += "< "+rank+"   "+name+" >\n<\t   said owo "+me.count+" times! >\n";
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
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;

			}

		});

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+name+"'s Ranking >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Ranking >\nYour rank is: "+userRank+"\n\n" + embed;

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
 * @param {discord.Channel}	channel - Current channel
 * @param {int} 		count 	- number of ranks to display
 */
function getGuildRanking(con, client, channel, id){
	//Grabs top 5
	var sql = "SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count ASC ) AS g1 ON g1.count > g.count WHERE g.id = "+id+" ORDER BY g1.count ASC LIMIT 2;";
	sql   +=  "SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count DESC ) AS g1 ON g1.count < g.count WHERE g.id = "+id+" ORDER BY g1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = "+id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
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
				embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var name = client.guilds.get(me.id).name;
		embed += "< "+rank+"   "+name+" >\n<\t   collectively said owo "+me.count+" times! >\n";
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
				embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
				rank++;
			}

		});

		//Add top and bottom
		if(guildRank>3)
			embed = "```md\n< "+name+"'s Ranking >\nYour guild rank is: "+guildRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+name+"'s Ranking >\nYour guild rank is: "+guildRank+"\n\n" + embed;

		if(rank-guildRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed);
	});
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

