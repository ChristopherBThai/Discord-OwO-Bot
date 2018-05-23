const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');

module.exports = new CommandInterface({
	
	alias:["my","me","guild"],

	args:"points|guild|zoo|money|cookie|pet [global]",

	desc:"Displays your ranking of each catagory!\nYou can choose you rank within the server or globally!\nYou can also shorten the command like in the example!",

	example:["owo my zoo","owo my cowoncy global","owo my p g"],

	related:["owo top"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		if(p.command=="guild")
			display(p.con,p.msg,["guild"]);
		else
			display(p.con,p.msg,p.args);
	}

})

/**
 * Check for valid arguments to display leaderboards
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg 	- Discord's message
 * @param {string[]}		args 	- Command arguments
 */
function display(con, msg, args){
	var channel = msg.channel;
	var id = msg.author.id;

	var aglobal = false;
	var invalid = false;
	var points = false;
	var guild = false;
	var zoo = false;
	var money = false;
	var rep = false;
	var pet = false;

	for(var i in args){
		if(!points&&!guild&&!money&&!zoo&&!rep&&!pet){
			if(args[i]=== "points"||args[i]==="point"||args[i]==="p") points = true;
			else if(args[i]==="guild"||args[i]==="server"||args[i]==="g"||args[i]==="s") guild = true;
			else if(args[i]=== "zoo"||args[i]==="z") zoo = true;
			else if(args[i]=== "cowoncy"||args[i]==="money"||args[i]==="c"||args[i]==="m") money = true;
			else if(args[i]==="cookies"||args[i]==="cookie"||args[i]=== "rep"||args[i]==="r") rep = true;
			else if(args[i]==="pets"||args[i]==="pet") pet = true;
			else if(args[i]==="global"||args[i]==="g") aglobal = true;
			else invalid = true;
		}else if(args[i]==="global"||args[i]==="g") aglobal = true;
		else invalid = true;
	}
	
	if(invalid)
		msg.channel.send("**🚫 |** Wrong arguments! :c Go check `owo help`!")
			.catch(err => console.error(err));

	else if(aglobal){
		if(points) getGlobalPointRanking(con,msg,id);
		else if(guild) getGuildRanking(con,msg,msg.guild.id);
		else if(zoo) getGlobalZooRanking(con,msg,id);
		else if(money) getGlobalMoneyRanking(con,msg,id);
		else if(rep) getGlobalRepRanking(con,msg,id);
		else if(pet) getGlobalPetRanking(con,msg,id);
		else getGlobalPointRanking(con,msg,id);
	}else{
		if(points) getPointRanking(con,msg,id);
		else if(guild) getGuildRanking(con,msg,msg.guild.id);
		else if(zoo) getZooRanking(con,msg,id);
		else if(money) getMoneyRanking(con,msg,id);
		else if(rep) getRepRanking(con,msg,id);
		else if(pet) getPetRanking(con,msg,id);
		else getPointRanking(con,msg,id);
	}
}

/**
 * displays global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User Message
 * @param {int} 		id	- User id
 */
function getGlobalPointRanking(con, msg, id){
	var channel = msg.channel;
	//Sql statements
	var sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = "+id+";";

	//query sql
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You haven't said 'owo' yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
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
				
		}

		//Current user
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+uname+" >\n\t\tsaid owo "+me.count+" times!\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;
			}
		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Global OwO Ranking >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Global OwO Ranking >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n" + embed;
		if(rank-userRank==3)
			embed += ">...\n";

		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User Message
 * @param {int} 		id	- User id
 */
function getPointRanking(con, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql statements
	var sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN ("+users+") ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN ("+users+") ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count AND id IN ("+users+") ) AS rank FROM user u WHERE u.id = "+id+";";

	//query sql
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You haven't said 'owo' yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
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
				
		}

		//Current user
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+uname+" >\n\t\tsaid owo "+me.count+" times!\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
				rank++;
			}

		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s OwO Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s OwO Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n>\t\tyou said owo "+rows[2][0].count+" times!\n\n" + embed;
		if(rank-userRank==3)
			embed += ">...\n";

		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}



/**
 * displays guild's ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		id 	- User's id
 */
function getGuildRanking(con, msg, id){
	var channel = msg.channel;
	//Sql statements
	var sql = "SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count ASC ) AS g1 ON g1.count > g.count WHERE g.id = "+id+" ORDER BY g1.count ASC LIMIT 2;";
	sql   +=  "SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count DESC ) AS g1 ON g1.count < g.count WHERE g.id = "+id+" ORDER BY g1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = "+id+";";

	//Sql query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You haven't said 'owo' yet!")
				.catch(err => console.error(err));
			return
		}
		var guildRank = parseInt(me.rank);
		var rank = guildRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var name = await global.getGuildName(id);
				if(name == null|| name == "")
					name = "Guild Left Bot";
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		}

		//Current user
		var uname = await global.getGuildName(me.id);
		if(uname == null|| uname == "")
			uname = "Guild Left Bot";
		uname = uname.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+uname+" >\n\t\tcollectively said owo "+me.count+" times!\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var name = await global.getGuildName(id);
				if(name == null|| name == "")
					name = "Guild Left Bot";
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
				rank++;
			}

		}

		//Add top and bottom
		if(guildRank>3)
			embed = "```md\n< "+uname+"'s Global Ranking >\nYour guild rank is: "+guildRank+"\n>\t\tcollectively said owo "+rows[2][0].count+" times!\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Global Ranking >\nYour guild rank is: "+guildRank+"\n\n>\t\tcollectively said owo "+rows[2][0].count+" times!\n\n" + embed;

		if(rank-guildRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n*owo counting has a 10s cooldown* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays zoo global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg 	- User's message
 * @param {int} 		id	- User's id
 */
function getGlobalZooRanking(con, msg, id){
	var channel = msg.channel;
	//Sql statements
	var sql = "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points FROM animal_count ORDER BY points ASC ) AS a1 ON a1.points > (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+a.fabled*25000) WHERE a.id = "+id+" ORDER BY a1.points ASC LIMIT 2;";
	sql   +=  "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points FROM animal_count ORDER BY points DESC ) AS a1 ON a1.points < (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+a.fabled*25000) WHERE a.id = "+id+" ORDER BY a1.points DESC LIMIT 2;";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+a.fabled*25000) ) AS rank FROM animal_count a WHERE a.id = "+id+";";

	//SQL query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any animals!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		//await above.reverse().forEach(async function(ele){
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
				if(ele.fabled>0)
					embed += "F-"+ele.fabled+", ";
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
				
		}

		//Current user
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		embed += "< "+rank+"\t"+uname+" >\n\t\t"+me.points+" zoo points: ";
		if(me.fabled>0)
			embed += "F-"+me.fabled+", ";
		if(me.legendary>0)
			embed += "L-"+me.legendary+", ";
		embed += "M-"+me.mythical+", ";
		embed += "E-"+me.epic+", ";
		embed += "R-"+me.rare+", ";
		embed += "U-"+me.uncommon+", ";
		embed += "C-"+me.common+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
				if(ele.fabled>0)
					embed += "F-"+ele.fabled+", ";
				if(ele.legendary>0)
					embed += "L-"+ele.legendary+", ";
				embed += "M-"+ele.mythical+", ";
				embed += "E-"+ele.epic+", ";
				embed += "R-"+ele.rare+", ";
				embed += "U-"+ele.uncommon+", ";
				embed += "C-"+ele.common+"\n";
				rank++;

			}

		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Zoo Ranking >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Zoo Ranking >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays zoo ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg 	- User's message
 * @param {int} 		id	- User's id
 */
function getZooRanking(con, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql statements
	var sql = "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points ASC ) AS a1 ON a1.points > (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+a.fabled*25000) WHERE a.id = "+id+" ORDER BY a1.points ASC LIMIT 2;";
	sql   +=  "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points DESC ) AS a1 ON a1.points < (a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+a.fabled*25000) WHERE a.id = "+id+" ORDER BY a1.points DESC LIMIT 2;";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+a.fabled*25000) AND id IN ("+users+") ) AS rank FROM animal_count a WHERE a.id = "+id+";";

	//SQL query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any animals!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				embed += "#"+rank+"\t"+name+"\n\t\t"+ele.points+" zoo points: ";
				if(ele.fabled>0)
					embed += "F-"+ele.fabled+", ";
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
				
		}

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		embed += "< "+rank+"\t"+uname+" >\n\t\t"+me.points+" zoo points: ";
		if(me.fabled>0)
			embed += "F-"+me.fabled+", ";
		if(me.legendary>0)
			embed += "L-"+me.legendary+", ";
		embed += "M-"+me.mythical+", ";
		embed += "E-"+me.epic+", ";
		embed += "R-"+me.rare+", ";
		embed += "U-"+me.uncommon+", ";
		embed += "C-"+me.common+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				if(ele.fabled>0)
					embed += "F-"+ele.fabled+", ";
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
		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Zoo Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Zoo Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}


/**
 * displays global cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getGlobalMoneyRanking(con, msg, id){
	var channel = msg.channel;
	//Sql
	var sql = "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = "+id+" ORDER BY u1.money ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = "+id+" ORDER BY u1.money DESC LIMIT 2;";
	sql   +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money ) AS rank FROM cowoncy u WHERE u.id = "+id+";";

	//query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any cowoncy yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
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
				
		}

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+uname+" >\n\t\tCowoncy: "+me.money+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
				rank++;
			}
		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Global Cowoncy Ranking >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Global Cowoncy Ranking >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getMoneyRanking(con, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql
	var sql = "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN ("+users+") ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = "+id+" ORDER BY u1.money ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN ("+users+") ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = "+id+" ORDER BY u1.money DESC LIMIT 2;";
	sql   +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money AND id IN ("+users+") ) AS rank FROM cowoncy u WHERE u.id = "+id+";";

	//query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any cowoncy yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
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
		}

		//Current user
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+uname+" >\n\t\tCowoncy: "+me.money+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
				rank++;

			}

		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Cowoncy Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Cowoncy Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays global rep ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getGlobalRepRanking(con, msg, id){
	var channel = msg.channel;
	//Sql
	var sql = "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count ) AS rank FROM rep u WHERE u.id = "+id+";";

	//query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any cookies yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCookies: "+ele.count+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		}

		//Current user
		//embed += "< #"+rank+"\t"+name+" \n\t\tsaid owo "+ele.count+" times! >\n";
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+uname+" >\n\t\tCookies: "+me.count+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCookies: "+ele.count+"\n";
				rank++;
			}
		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Global Cookie Ranking >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Global Cookie Ranking >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays rep ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getRepRanking(con, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql
	var sql = "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count AND id IN ("+users+") ) AS rank FROM rep u WHERE u.id = "+id+";";

	//query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any cookies yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCookies: "+ele.count+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		}

		//Current user
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		embed += "< "+rank+"   "+uname+" >\n\t\tCookies: "+me.count+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				embed += "#"+rank+"\t"+name+"\n\t\tCookies: "+ele.count+"\n";
				rank++;

			}

		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Cookie Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Cookie Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays global pet ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getGlobalPetRanking(con, msg, id){
	var channel = msg.channel;
	//Sql
	var sql = "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal ORDER BY lvl DESC, xp DESC) AS u1 ON u1.lvl > u.lvl OR (u1.lvl = u.lvl AND u1.xp > u.xp) WHERE u.id = "+id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl ASC, u1.xp ASC LIMIT 2;";
	sql   += "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal ORDER BY lvl ASC, xp ASC) AS u1 ON u1.lvl < u.lvl OR (u1.lvl = u.lvl AND u1.xp < u.xp) WHERE u.id = "+id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl DESC, u1.xp DESC LIMIT 2;";
	sql   +=  "SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE ((lvl > c.lvl) OR (lvl = c.lvl AND xp > c.xp))) AS rank FROM animal c WHERE c.id = "+id+" ORDER BY lvl DESC, xp DESC LIMIT 1;";

	//query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any pets yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				if(ele.nickname!=null)
					embed += "#"+rank+"\t"+ele.nickname+" ("+name+")\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				else
					embed += "#"+rank+"\t"+name+"\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		}

		//Current user
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		if(me.nickuname!=null)
			embed += "< "+rank+"\t"+me.nickname+" ("+uname+") >\n\t\tLvl:"+me.lvl+" Att:"+me.att+" Hp:"+me.hp+"\n";
		else
			embed += "< "+rank+"\t"+uname+" >\n\t\tLvl:"+me.lvl+" Att:"+me.att+" Hp:"+me.hp+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				if(ele.nickname!=null)
					embed += "#"+rank+"\t"+ele.nickname+" ("+name+")\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				else
					embed += "#"+rank+"\t"+name+"\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				rank++;
			}
		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Global Pet Ranking >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Global Pet Ranking >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}

/**
 * displays rep ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- Current channel
 * @param {int} 		id	- User's id
 */
function getPetRanking(con, msg, id){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Sql
	var sql = "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+id+" ORDER BY u1.count ASC LIMIT 2;";
	sql   +=  "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+id+" ORDER BY u1.count DESC LIMIT 2;";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count AND id IN ("+users+") ) AS rank FROM rep u WHERE u.id = "+id+";";
	var sql = "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal WHERE id IN ("+users+") ORDER BY lvl DESC, xp DESC) AS u1 ON u1.lvl > u.lvl OR (u1.lvl = u.lvl AND u1.xp > u.xp) WHERE u.id = "+id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl ASC, u1.xp ASC LIMIT 2;";
	sql   += "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal WHERE id IN ("+users+") ORDER BY lvl ASC, xp ASC) AS u1 ON u1.lvl < u.lvl OR (u1.lvl = u.lvl AND u1.xp < u.xp) WHERE u.id = "+id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl DESC, u1.xp DESC LIMIT 2;";
	sql   +=  "SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE id IN ("+users+") AND ((lvl > c.lvl) OR (lvl = c.lvl AND xp > c.xp))) AS rank FROM animal c WHERE c.id = "+id+" ORDER BY lvl DESC, xp DESC LIMIT 1;";

	//query
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You don't have any pets yet!")
				.catch(err => console.error(err));
			return;
		}
		var userRank = parseInt(me.rank);
		var rank = userRank - above.length;
		var embed = "";

		//People above user
		for(let ele of above.reverse()){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				if(ele.nickname!=null)
					embed += "#"+rank+"\t"+ele.nickname+" ("+name+")\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				else
					embed += "#"+rank+"\t"+name+"\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				rank++;
			}else if(rank==0)
				rank = 1;
				
		}

		//Current user
		var uname;
		if(uname = await global.getUser(me.id))
			uname = uname.username;
		else 
			uname = "you";
		uname = uname.replace("discord.gg","discord,gg");
		if(me.nickuname!=null)
			embed += "< "+rank+"\t"+me.nickname+" ("+uname+") >\n\t\tLvl:"+me.lvl+" Att:"+me.att+" Hp:"+me.hp+"\n";
		else
			embed += "< "+rank+"\t"+uname+" >\n\t\tLvl:"+me.lvl+" Att:"+me.att+" Hp:"+me.hp+"\n";
		rank++;

		//People below user
		for(let ele of below){
			var id = String(ele.id);
			if(id!==""&&id!==null&&!isNaN(id)){
				var user = await global.getUser(id);
				var name = "";
				if(user === undefined || user.username === undefined)
					name = "User Left Discord";
				else
					name = ""+user.username;
				name = name.replace("discord.gg","discord,gg");
				if(ele.nickname!=null)
					embed += "#"+rank+"\t"+ele.nickname+" ("+name+")\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				else
					embed += "#"+rank+"\t"+name+"\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
				rank++;

			}

		}

		//Add top and bottom
		if(userRank>3)
			embed = "```md\n< "+uname+"'s Pet Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n>...\n" + embed;
		else
			embed = "```md\n< "+uname+"'s Pet Ranking for "+msg.guild.name+" >\nYour rank is: "+userRank+"\n\n" + embed;

		if(rank-userRank==3)
			embed += ">...\n";


		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
}
