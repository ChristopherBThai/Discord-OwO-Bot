
/**
 * Grabs bot's info
 */
exports.info = function(client,msg){
	var embed = "```md\n< OwO Bot Info >\n"+
		"> Session Started on: "+client.readyAt+"\n"+
		"> Ping "+client.ping+"ms\n\n"+
		"# Talking to "+client.users.size+" people\n"+
		"# In "+client.guilds.size+" Guilds and "+client.channels.size+" channels";
	client.guilds.array().forEach(function(ele){
		var guild = "\n\t"+ele.name;
		guild += "\n\t\t> "+ele.members.size+" Users";
		guild += "\n\t\t> "+ele.channels.size+" Channels";
		guild += "\n\t\t> Joined on "+ele.joinedAt;
		if(embed.length+guild.length>=2000){
			embed += "```";
			msg.channel.send(embed);
			embed = "```md"+guild;
		}else
			embed += guild;
	});
	var date = new Date();
	embed += ("\n\n> "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
	msg.channel.send(embed);
	console.log("Admin Command: info");
}

exports.msgChannel = function(client,dm,id,message){
	var channel = client.channels.get(id);
	if(channel == null || channel == undefined){
		dm.send("Could not find channel");
		return;
	}
	channel.send(message);
	dm.send("Message sent: "+message);
}

exports.send = function(client,con,msg,args){
	var amount = 0;
	var id = 0;
	if(isInt(args[0])&&isInt(args[1])){
		amount = parseInt(args[1]);
		id = parseInt(args[0]);
	}else{
		msg.channel.send("Wrong args");
		return;
	}
	var sql = "UPDATE cowoncy SET money = money + "+amount+" WHERE id IN (SELECT sender FROM feedback WHERE id = "+id+");SELECT sender FROM feedback WHERE id = "+id+";";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var user = client.users.get(String(rows[1][0].sender));
		user.send("You have recieved __"+amount+"__ cowoncy!");
		msg.channel.send("You sent "+amount+" cowoncy to "+user.username);
	});
}

exports.giveall = function(con,msg,args){
	var amount = 0;
	if(isInt(args[0]))
		amount = parseInt(args[0]);
	else
		return;
	var users = getids(msg.guild.members);
	var sql = "UPDATE IGNORE cowoncy SET money = money + "+amount+" WHERE id IN ("+users+");";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		msg.channel.send(msg.author.username+" gave @everyone "+amount+" cowoncy!!!");
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

