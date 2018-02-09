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
exports.display = function(con, client, msg, args, id){
	var members = msg.guild.members;
	var channel = msg.channel;
	getGlobalRanking(con, client, members, channel, id);
	return;
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
function getGlobalRanking(con, client, members, channel, id){
	//Grabs top 5
	var sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT COUNT(*)+1 AS rank FROM user WHERE count > ( SELECT count FROM user WHERE id = "+id+" );";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		console.log(rows);
		var above = rows[0];
		var below = rows[1];
		var userRank = parseInt(rows[2][0].rank);
		var rank = userRank - above.length;
		var embed = "";

		var noTop = false;
		var noBottom = false;

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
			}else if(rank==0){
				rank = 1;
				noTop = true;
			}else
				noTop = true;
				
		});

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		embed += "< I GO HERE >\n\n";
		rank++;

		//People below user
		below.forEach(function(ele){
			console.log(ele);
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

			}else
				noBottom = true;

		});

		//Add top and bottom
		if(!noTop)
			embed = "```md\n< TITLE >\nYour rank is: \n\n#\t...\n\n" + embed;
		else
			embed = "```md\n< TITLE >\nYour rank is: \n\n" + embed;

		if(!noBottom)
			embed += "#\t...\n";


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

