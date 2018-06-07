const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');

module.exports = new CommandInterface({
	
	alias:["top","rank","ranking"],

	args:"points|guild|zoo|money|cookie|pet [global] {count}",

	desc:"Displays the top ranking of each catagory!",

	example:["owo top zoo","owo top cowoncy global","owo top p g"],

	related:["owo my"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		display(p.con,p.msg,p.args);
	}

})

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
		//Adds points
		var sql = "INSERT INTO user (id,count) VALUES ("+id+",1) ON DUPLICATE KEY "+
			"UPDATE count = count + 1;";
		sql += "INSERT INTO guild (id,count) VALUES ("+guild.id+",1) ON DUPLICATE KEY UPDATE count = count + 1;";
		sql += "INSERT INTO cowoncy (id,money) VALUES ("+id+",2) ON DUPLICATE KEY UPDATE money = money + 2;";

		con.query(sql,function(err,result){
			if(err){ console.error(err); return;}
			console.log("\x1b[0m%s\x1b[36m[%s][%s][%s]",msg.author.username+" typed '"+text+"'",msg.author.id,msg.guild,msg.channel.name); 
		});
	}catch(err){

	}
}

/**
 * Check for valid arguments to display leaderboards
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg 	- Discord's message
 * @param {string[]}		args 	- Command arguments
 */
function display(con, msg, args){
	var channel = msg.channel;
	//check for args
	var globala = false;

	var points = false;
	var guild = false;
	var money = false;
	var zoo = false;
	var rep = false;
	var pet = false;

	var invalid = false;
	var count = 5;

	for(var i in args){
		if(!points&&!guild&&!money&&!zoo&&!rep&&!pet){
			if(args[i]=== "points"||args[i]==="point"||args[i]==="p") points = true;
			else if(args[i]==="guild"||args[i]==="server"||args[i]==="s"||args[i]==="g") guild = true;
			else if(args[i]=== "zoo"||args[i]==="z") zoo = true;
			else if(args[i]=== "cowoncy"||args[i]==="money"||args[i]==="m"||args[i]==="c") money = true;
			else if(args[i]==="cookies"||args[i]==="cookie"||args[i]==="rep"||args[i]==="r") rep = true;
			else if(args[i]==="pets"||args[i]==="pet") pet = true;
			else if(args[i]==="global"||args[i]==="g") globala = true;
			else if(global.isInt(args[i])) count = parseInt(args[i]);
			else invalid = true;
		}else if(args[i]==="global"||args[i]==="g") globala = true;
		else if(global.isInt(args[i])) count = parseInt(args[i]);
		else invalid = true;
	}
	if (count>25) count = 25;
	else if (count<1) count = 5;

	if(invalid)
		msg.channel.send("**🚫 |** Invalid ranking type!")
			.catch(err => console.error(err));

	else if(globala){
		if(points) getGlobalRanking(con,msg,count);
		else if(guild) getGuildRanking(con,msg,count);
		else if(zoo) getGlobalZooRanking(con,msg,count);
		else if(money) getGlobalMoneyRanking(con,msg,count);
		else if(rep) getGlobalRepRanking(con,msg,count);
		else if(pet) getGlobalPetRanking(con,msg,count);
		else getGlobalRanking(con,msg,count);
	}else{
		if(points) getRanking(con,msg,count);
		else if(guild) getGuildRanking(con,msg,count);
		else if(zoo) getZooRanking(con,msg,count);
		else if(money) getMoneyRanking(con,msg,count);
		else if(rep) getRepRanking(con,msg,count);
		else if(pet) getPetRanking(con,msg,count);
		else getRanking(con,msg,count);
	}
}

/**
 * displays guild ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.User[]}	members	- Guild's members
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getRanking(con, msg, count){
	var userids = global.getids(msg.guild.members);
	var channel = msg.channel;
	var guildId = msg.guild.id;

	//Grabs top 5
	var sql = "SELECT * FROM user WHERE id IN ( "+userids+ " ) ORDER BY count DESC LIMIT "+count+";";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE id IN ("+userids+") AND count > u.count) AS rank FROM user u WHERE u.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" OwO Rankings for "+msg.guild.name+" >\n";
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
		channel.send(embed)
			.catch(err => console.error(err));

	});
	console.log("	Displaying top "+count);
}

/**
 * displays global ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalRanking(con, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM user ORDER BY count DESC LIMIT "+count+";";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global OwO Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Global Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tyou said owo "+rows[1][0].count+" times!\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tsaid owo "+ele.count+" times!\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n*Spamming owo will not count!!!* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" global");
}



/**
 * displays guild ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGuildRanking(con, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM guild ORDER BY count DESC LIMIT "+count+";";
	sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = "+msg.guild.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Guild OwO Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Guild Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tcollectively said owo "+rows[1][0].count+" times!\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var name = await global.getGuildName(id);
			if(name == null|| name == "")
				name = "Guild Left Bot";
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tcollectively said owo "+ele.count+" times!\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n*Spamming owo will not count!!!* | "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" guilds");
}

/**
 * displays zoo ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getZooRanking(con, msg, count){
	var channel = msg.channel;
	var users = global.getids(msg.guild.members);
	//Grabs top 5
	var sql = "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points DESC LIMIT "+count+";";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+fabled*25000) AND id IN ("+users+")) AS rank FROM animal_count a WHERE a.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Zoo Rankings for "+msg.guild.name+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Zoo Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\t"+rows[1][0].points+" zoo points: ";
			if(rows[1][0].fabled>0)
				embed += "F-"+rows[1][0].fabled+", ";
			if(rows[1][0].legendary>0)
				embed += "L-"+rows[1][0].legendary+", ";
			embed += "M-"+rows[1][0].mythical+", ";
			embed += "E-"+rows[1][0].epic+", ";
			embed += "R-"+rows[1][0].rare+", ";
			embed += "U-"+rows[1][0].uncommon+", ";
			embed += "C-"+rows[1][0].common+"\n\n";

		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
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
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" zoo");
}

/**
 * displays global zoo ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalZooRanking(con, msg, count){
	channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points FROM animal_count ORDER BY points DESC LIMIT "+count+";";
	sql   +=  "SELECT *,(common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE (common*1+uncommon*5+rare*10+epic*50+mythical*500+legendary*1000+fabled*25000) >(a.common*1+a.uncommon*5+a.rare*10+a.epic*50+a.mythical*500+a.legendary*1000+fabled*25000) ) AS rank FROM animal_count a WHERE a.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global Zoo Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Zoo Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\t"+rows[1][0].points+" zoo points: ";
			if(rows[1][0].fabled>0)
				embed += "F-"+rows[1][0].fabled+", ";
			if(rows[1][0].legendary>0)
				embed += "L-"+rows[1][0].legendary+", ";
			embed += "M-"+rows[1][0].mythical+", ";
			embed += "E-"+rows[1][0].epic+", ";
			embed += "R-"+rows[1][0].rare+", ";
			embed += "U-"+rows[1][0].uncommon+", ";
			embed += "C-"+rows[1][0].common+"\n\n";

		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
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
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" global zoo");
}

/**
 * displays cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getMoneyRanking(con, msg, count){
	var users = global.getids(msg.guild.members);
	var channel = msg.channel;
	var sql = "SELECT * FROM cowoncy WHERE id IN ("+users+") ORDER BY money DESC LIMIT "+count+";";
	sql +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE id IN ("+users+") AND money > c.money) AS rank FROM cowoncy c WHERE c.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Cowoncy Rankings for "+msg.guild.name+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tCowoncy: "+rows[1][0].money+"\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" cowoncy");
}


/**
 * displays global cowoncy ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalMoneyRanking(con, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM cowoncy ORDER BY money DESC LIMIT "+count+";";
	sql +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > c.money) AS rank FROM cowoncy c WHERE c.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global Cowoncy Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tCowoncy: "+rows[1][0].money+"\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tCowoncy: "+ele.money+"\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" global cowoncy");
}

/**
 * displays rep ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getRepRanking(con, msg, count){
	var users = global.getids(msg.guild.members);
	var channel = msg.channel;
	var sql = "SELECT * FROM rep WHERE id IN ("+users+") ORDER BY count DESC LIMIT "+count+";";
	sql +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE id IN ("+users+") AND count > c.count) AS rank FROM rep c WHERE c.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Cookie Rankings for "+msg.guild.name+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tCookies: "+rows[1][0].count+"\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tCookies: "+ele.count+"\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" cookies");
}


/**
 * displays global rep ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalRepRanking(con, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM rep ORDER BY count DESC LIMIT "+count+";";
	sql +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > c.count) AS rank FROM rep c WHERE c.id = "+msg.author.id+";";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global Cookie Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\tCookies: "+rows[1][0].count+"\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			embed += "#"+rank+"\t"+name+"\n\t\tCookies: "+ele.count+"\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" global cookie");
}

/**
 * displays pet ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getPetRanking(con, msg, count){
	var users = global.getids(msg.guild.members);
	var channel = msg.channel;
	var sql = "SELECT * FROM animal WHERE id IN ("+users+") ORDER BY lvl DESC, xp DESC LIMIT "+count+";";
	sql +=  "SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE id IN ("+users+") AND ((lvl > c.lvl) OR (lvl = c.lvl AND xp > c.xp))) AS rank FROM animal c WHERE c.id = "+msg.author.id+" ORDER BY lvl DESC, xp DESC LIMIT 1;";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Pet Rankings for "+msg.guild.name+" >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\t"+rows[1][0].nickname+" Lvl:"+rows[1][0].lvl+" Att:"+rows[1][0].att+" Hp:"+rows[1][0].hp+"\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			if(ele.nickname!=null)
				embed += "#"+rank+"\t"+ele.nickname+" ("+name+")\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
			else
				embed += "#"+rank+"\t"+name+"\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" pets");
}


/**
 * displays global rep ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGlobalPetRanking(con, msg, count){
	var channel = msg.channel;
	//Grabs top 5
	var sql = "SELECT * FROM animal  ORDER BY lvl DESC, xp DESC LIMIT "+count+";";
	sql +=  "SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE ((lvl > c.lvl) OR (lvl = c.lvl AND xp > c.xp))) AS rank FROM animal c WHERE c.id = "+msg.author.id+" ORDER BY lvl DESC, xp DESC LIMIT 1;";

	//Create an embeded message
	con.query(sql,async function(err,rows,fields){
		if(err) {console.error(err); return;}
		var rank = 1;
		var ranking = [];
		var embed = "```md\n< Top "+count+" Global Pet Rankings >\n";
		if(rows[1][0]!==undefined&&rows[1][0]!==null){
			embed += "> Your Rank: "+rows[1][0].rank+"\n";
			embed += ">\t\t"+rows[1][0].nickname+" Lvl:"+rows[1][0].lvl+" Att:"+rows[1][0].att+" Hp:"+rows[1][0].hp+"\n\n";
		}
		for(let ele of rows[0]){
			var id = String(ele.id);
			var user = await global.getUser(id);
			var name = "";
			if(user === undefined || user.username === undefined)
				name = "User Left Bot";
			else
				name = ""+user.username;
			name = name.replace("discord.gg","discord,gg");
			if(ele.nickname!=null)
				embed += "#"+rank+"\t"+ele.nickname+" ("+name+")\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
			else
				embed += "#"+rank+"\t"+name+"\n\t\tLvl:"+ele.lvl+" Att:"+ele.att+" Hp:"+ele.hp+"\n";
			rank++;
		}
		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		channel.send(embed)
			.catch(err => console.error(err));
	});
	console.log("	Displaying top "+count+" global pet");
}
