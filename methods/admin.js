/**
 * Admin commands
 */

const global = require('./global.js');

/**
 * Sends a message to a channel
 */
exports.msgChannel = async function(client,dm,id,message){
	var channelname = await client.shard.broadcastEval(`
		var channel = this.channels.get('${id}');
		if(channel){
			channel.send('${message}')
			.catch(err => console.err(err));
			channel = channel.id;
		}
		channel;
	`);
	channelname = channelname.reduce((result,current) => {if(current)result=current;return result;});
	if(channelname)
		dm.send("Message sent to "+channelname)
		.catch(err => console.err(err));
	else
		dm.send("Could not find channel")
		.catch(err => console.err(err));
}

/**
 * Sends cowoncy to a user
 */
exports.send = function(client,con,msg,args){
	var amount = 0;
	var id = 0;
	if(global.isInt(args[0])&&global.isInt(args[1])){
		amount = parseInt(args[1]);
		id = parseInt(args[0]);
	}else{
		msg.channel.send("Wrong args")
		.catch(err => console.err(err));
		return;
	}
	var sql = "UPDATE cowoncy SET money = money + "+amount+" WHERE id IN (SELECT sender FROM feedback WHERE id = "+id+");SELECT sender FROM feedback WHERE id = "+id+";";
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		if(user = await global.msgUser(String(rows[1][0].sender),"**💎 |** You have recieved __"+amount+"__ cowoncy!"))
			msg.channel.send("You sent "+amount+" cowoncy to "+user.username)
			.catch(err => console.err(err));
		else
			msg.channel.send("Could not find that user")
			.catch(err => console.err(err));

	});
}

/**
 * gives everyone in the guild cowoncy
 */
exports.giveall = function(con,msg,args){
	var amount = 0;
	if(global.isInt(args[0]))
		amount = parseInt(args[0]);
	else
		return;
	var users = global.getids(msg.guild.members);
	var sql = "UPDATE IGNORE cowoncy SET money = money + "+amount+" WHERE id IN ("+users+");";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		msg.channel.send("**💎 |** "+msg.author.username+" gave @everyone "+amount+" cowoncy!!!")
		.catch(err => console.err(err));
	});
}

/**
 * Sets a user's timeout
 */
exports.timeout = function(con,msg,args){
	var time;
	if(global.isInt(args[1])){
		time = parseInt(args[1]);
	}else{
		global.msgAdmin("Wrong time format");
		return;
	}

	if(!global.isUser("<@"+args[0]+">")){
		global.msgAdmin("Invalid user id");
		return;
	}
	var sql = "UPDATE IGNORE timeout SET penalty = "+time+" WHERE id = "+args[0]+";";
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		if(user = await global.msgUser(args[0],"**🙇 |** Your penalty has been lifted by an admin! Sorry for the inconvenience!"))
			msg.author.send("Penalty has been set to "+time+" for "+user.username)
			.catch(err => console.err(err));
		else
			msg.author.send("Failed to set penalty for that user")
			.catch(err => console.err(err));
	});
}	
