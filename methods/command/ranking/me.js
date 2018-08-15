const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const animals = require('../../../../tokens/owo-animals.json');
const animalUtil = require('../zoo/animalUtil.js');

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

	for(var i=0;i<args.length;i++){
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
	else{
		if(points) getPointRanking(aglobal,con,msg);
		else if(guild) getGuildRanking(con,msg,msg.guild.id);
		else if(zoo) getZooRanking(aglobal,con,msg);
		else if(money) getMoneyRanking(aglobal,con,msg);
		else if(rep) getRepRanking(aglobal,con,msg);
		else if(pet) getPetRanking(aglobal,con,msg);
		else getPointRanking(aglobal,con,msg);
	}
}

function displayRanking(con,msg,sql,title,subText){
	con.query(sql,async function(err,rows,fields){
		if(err){console.error(err);return;}
		var above = rows[0];
		var below = rows[1];
		var me = rows[2][0];
		if(me===null||me===undefined){
			channel.send("You're at the very bottom c:")
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
				embed += "#"+rank+"\t"+name+"\n"+subText(ele)+"\n";
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
		embed += "< "+rank+"   "+uname+" >\n"+subText(me)+"\n";
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
				embed += "#"+rank+"\t"+name+"\n"+subText(ele)+"\n";
				rank++;
			}
		}

		//Add top and bottom
		embed = "```md\n< "+uname+"'s "+title+" >\nYour rank is: "+userRank+"\n>"+subText(rows[2][0])+"\n\n"+((userRank>3)?">...\n":"")+ embed;
		if(rank-userRank==3) embed += ">...\n";

		var date = new Date();
		embed += ("\n"+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
		msg.channel.send(embed).catch(err => console.error(err));
	});
}

/**
 * displays global ranking
 */
function getPointRanking(globalRank,con,msg){
	var sql;
	if(globalRank){
		sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count ASC LIMIT 2;";
		sql += "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count DESC LIMIT 2;";
		sql += "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = "+msg.author.id+";";
	}else{
		var users = global.getids(msg.guild.members);
		sql = "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN ("+users+") ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count ASC LIMIT 2;";
		sql += "SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN ("+users+") ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count DESC LIMIT 2;";
		sql += "SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count AND id IN ("+users+") ) AS rank FROM user u WHERE u.id = "+msg.author.id+";";
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"OwO Ranking",
			function(query){
				return "\t\tsaid owo "+global.toFancyNum(query.count)+" times!";
			});
}

function getZooRanking(globalRank,con,msg){
	var sql;
	if(globalRank){
		sql = "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,"+points+" AS points FROM animal_count ORDER BY points ASC ) AS a1 ON a1.points > "+apoints+" WHERE a.id = "+msg.author.id+" ORDER BY a1.points ASC LIMIT 2;";
		sql += "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,"+points+" AS points FROM animal_count ORDER BY points DESC ) AS a1 ON a1.points < "+apoints+" WHERE a.id = "+msg.author.id+" ORDER BY a1.points DESC LIMIT 2;";
		sql += "SELECT *,"+points+" AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE "+points+" > "+apoints+" ) AS rank FROM animal_count a WHERE a.id = "+msg.author.id+";";
	}else{
		var users = global.getids(msg.guild.members);
		sql = "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,"+points+" AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points ASC ) AS a1 ON a1.points > "+apoints+" WHERE a.id = "+msg.author.id+" ORDER BY a1.points ASC LIMIT 2;";
		sql   +=  "SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,"+points+" AS points FROM animal_count WHERE id IN ("+users+") ORDER BY points DESC ) AS a1 ON a1.points < "+apoints+" WHERE a.id = "+msg.author.id+" ORDER BY a1.points DESC LIMIT 2;";
		sql   +=  "SELECT *,"+points+" AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE "+points+" > "+apoints+" AND id IN ("+users+") ) AS rank FROM animal_count a WHERE a.id = "+msg.author.id+";";
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"Zoo Ranking",
			function(query){
				return "\t\t"+query.points+" zoo points: "+animalUtil.zooScore(query);
			});
}

function getMoneyRanking(globalRank,con,msg){
	var sql;
	if(globalRank){
		sql = "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = "+msg.author.id+" ORDER BY u1.money ASC LIMIT 2;";
		sql += "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = "+msg.author.id+" ORDER BY u1.money DESC LIMIT 2;";
		sql += "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money ) AS rank FROM cowoncy u WHERE u.id = "+msg.author.id+";";
	}else{
		var users = global.getids(msg.guild.members);
		var sql = "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN ("+users+") ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = "+msg.author.id+" ORDER BY u1.money ASC LIMIT 2;";
		sql   +=  "SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN ("+users+") ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = "+msg.author.id+" ORDER BY u1.money DESC LIMIT 2;";
		sql   +=  "SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money AND id IN ("+users+") ) AS rank FROM cowoncy u WHERE u.id = "+msg.author.id+";";
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"Money Ranking",
			function(query){
				return "\t\tCowoncy: "+query.money;
			});
}

function getRepRanking(globalRank,con,msg){
	var sql;
	if(globalRank){
		sql = "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count ASC LIMIT 2;";
		sql += "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count DESC LIMIT 2;";
		sql += "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count ) AS rank FROM rep u WHERE u.id = "+msg.author.id+";";
	}else{
		var users = global.getids(msg.guild.members);
		sql = "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count ASC LIMIT 2;";
		sql   +=  "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count DESC LIMIT 2;";
		sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count AND id IN ("+users+") ) AS rank FROM rep u WHERE u.id = "+msg.author.id+";";
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"Cookie Ranking",
			function(query){
				return "\t\tCookies: "+query.count;
			});
}

function getPetRanking(globalRank,con,msg){
	msg.channel.send("Currently Disabled");
	return;
	var sql;
	if(globalRank){
		sql = "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal ORDER BY lvl DESC, xp DESC) AS u1 ON u1.lvl > u.lvl OR (u1.lvl = u.lvl AND u1.xp > u.xp) WHERE u.id = "+msg.author.id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl ASC, u1.xp ASC LIMIT 2;";
		sql += "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal ORDER BY lvl ASC, xp ASC) AS u1 ON u1.lvl < u.lvl OR (u1.lvl = u.lvl AND u1.xp < u.xp) WHERE u.id = "+msg.author.id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl DESC, u1.xp DESC LIMIT 2;";
		sql += "SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE ((lvl > c.lvl) OR (lvl = c.lvl AND xp > c.xp))) AS rank FROM animal c WHERE c.id = "+msg.author.id+" ORDER BY lvl DESC, xp DESC LIMIT 1;";
	}else{
		var users = global.getids(msg.guild.members);
		sql = "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal WHERE id IN ("+users+") ORDER BY lvl DESC, xp DESC) AS u1 ON u1.lvl > u.lvl OR (u1.lvl = u.lvl AND u1.xp > u.xp) WHERE u.id = "+msg.author.id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl ASC, u1.xp ASC LIMIT 2;";
		sql += "SELECT u.id,u.lvl,u.xp,u.att,u.hp,u.nickname, u1.id,u1.lvl,u1.xp,u1.att,u1.hp,u1.nickname FROM animal AS u LEFT JOIN ( SELECT id,lvl,xp,att,hp,nickname FROM animal WHERE id IN ("+users+") ORDER BY lvl ASC, xp ASC) AS u1 ON u1.lvl < u.lvl OR (u1.lvl = u.lvl AND u1.xp < u.xp) WHERE u.id = "+msg.author.id+" ORDER BY u.lvl DESC, u.xp DESC,u1.lvl DESC, u1.xp DESC LIMIT 2;";
		sql += "SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE id IN ("+users+") AND ((lvl > c.lvl) OR (lvl = c.lvl AND xp > c.xp))) AS rank FROM animal c WHERE c.id = "+msg.author.id+" ORDER BY lvl DESC, xp DESC LIMIT 1;";
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"Pet Ranking",
			function(query){
				var result = "\t\t";
				if(query.nickname!=null)
					result = query.nickname+" ";
				result += "Lvl:"+query.lvl+" Att:"+query.att+" Hp:"+query.hp;
				return result;
			});
}

function getHuntbotRanking(globalRank,con,msg){
	var sql;
	if(globalRank){
		sql = "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count ASC LIMIT 2;";
		sql += "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count DESC LIMIT 2;";
		sql += "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count ) AS rank FROM rep u WHERE u.id = "+msg.author.id+";";
	}else{
		var users = global.getids(msg.guild.members);
		sql = "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count ASC LIMIT 2;";
		sql   +=  "SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN ("+users+") ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = "+msg.author.id+" ORDER BY u1.count DESC LIMIT 2;";
		sql   +=  "SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count AND id IN ("+users+") ) AS rank FROM rep u WHERE u.id = "+msg.author.id+";";
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"HuntBot Ranking",
			function(query){
				return;
			});
}

function getLuckRanking(globalRank,con,msg){
	var sql;
	if(globalRank){
	}else{
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"Luck Ranking",
			function(query){
				return;
			});
}

function getCurseRanking(globalRank,con,msg){
	var sql;
	if(globalRank){
	}else{
	}

	displayRanking(con,msg,sql,
			((globalRank)?"Global ":"")+"Curse Ranking",
			function(query){
				return;
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

const points = "(common*"+animals.points.common+"+"+
		"uncommon*"+animals.points.uncommon+"+"+
		"rare*"+animals.points.rare+"+"+
		"epic*"+animals.points.epic+"+"+
		"mythical*"+animals.points.mythical+"+"+
		"special*"+animals.points.special+"+"+
		"patreon*"+animals.points.patreon+"+"+
		"cpatreon*"+animals.points.cpatreon+"+"+
		"hidden*"+animals.points.hidden+"+"+
		"legendary*"+animals.points.legendary+"+"+
		"fabled*"+animals.points.fabled+")";
const apoints = "(a.common*"+animals.points.common+"+"+
		"a.uncommon*"+animals.points.uncommon+"+"+
		"a.rare*"+animals.points.rare+"+"+
		"a.epic*"+animals.points.epic+"+"+
		"a.mythical*"+animals.points.mythical+"+"+
		"a.special*"+animals.points.special+"+"+
		"a.patreon*"+animals.points.patreon+"+"+
		"a.cpatreon*"+animals.points.cpatreon+"+"+
		"a.hidden*"+animals.points.hidden+"+"+
		"a.legendary*"+animals.points.legendary+"+"+
		"a.fabled*"+animals.points.fabled+")";



