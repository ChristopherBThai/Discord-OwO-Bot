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
				getGlobalRanking(con, client, members, channel, count);
			else
				getRanking(con, members, channel, count);	
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
function getRanking(con, members, channel, count){
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
		channel.send(embed);

	});
	console.log("	Displaying top "+count);
}

/**
 * displays global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {mysql.Client}	client	- Discord.js's client
 * @param {discord.User[]}	members	- Guild's members
 * @param {discord.Channel}	channel - Current channel
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalRanking(con, client, members, channel, count){
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

