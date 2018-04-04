//+==========================================+
//||					    ||
//||		FEEDBACK METHODS	    ||
//||					    ||
//+==========================================+

const global = require('./global.js');

/**
 * Sends a feedback to an admin
 * @param {mysql} 		mysql	-  MySql
 * @param {mysql.Connection} 	con 	-  MySql.createConnection()
 * @param {discord.User} 	admin 	-  Admin's User
 * @param {string} 		type 	-  type of feedback
 * @param {string} 		message -  the message of feedback
 *
 */
exports.send = function(mysql, con, msg, admin, type, message){
	var sender = msg.author;
	var channel = msg.channel;
	if(!message||message === ''){
		channel.send("Silly "+sender + ", you need to add a message!")
			.catch(err => console.error(err));
		return;
	}
	var sql = "INSERT INTO feedback (type,message,sender) values ('"+
		type+"',?,"+
		sender.id+");";
	if(message.length > 250){
		console.log("\tMessage too big");
		channel.send("Sorry! Messages must be under 250 character!!!")
			.catch(err => console.error(err));
		return;
	}
	sql = mysql.format(sql,message);
	try{
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		const embed = {
			"color": 10590193,
			"timestamp": new Date(),
			"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"author": {
				"name": "OwO Bot Support",
				"icon_url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"
			},
			"fields": [
				{
					"name":"A user sent a feedback!",
					"value": "==============================================="
				},{
					"name": "Message ID",
					"value": rows.insertId,
					"inline": true
				},{
					"name": "Message Type",
					"value": type,
					"inline": true
				},{
					"name": "From "+sender.username+" ("+sender.id+")",
					"value": "```"+message+"```\n\n==============================================="
				}
			]
		};
		channel.send("*OwO What's this?!*  "+sender+", Thanks for the "+type+"!")
			.catch(err => console.error(err));
		global.msgAdmin({embed});
		console.log("\tNew "+type+" sent to admin's DM");
	});
	}catch(err){
		console.error(err);
	}
}

/**
 * Replies to a feedback 
 * @param {mysql} 		mysql	-  MySql
 * @param {mysql.Connection} 	con 	-  MySql.createConnection()
 * @param {discord.Message}	msg 	-  the msg from discord
 * @param {string} 		args	-  The arguments of the command
 *
 */
exports.reply = function(mysql, con,  msg, args){
	var dm = msg.channel;
	var feedbackId = parseInt(args.shift());
	var reply = args.join(' ');
	if(reply.length > 250){
		console.log("Admin Command: reply "+feedbackId+" {"+reply+"}");
		console.log("\tMessage too big");
		dm.send("Sorry! Messages must be under 250 character!!!")
			.catch(err => console.error(err));
		return;
	}
	var sql = "SELECT type,message,sender FROM feedback WHERE id = "+feedbackId+";";
	con.query(sql,async function(err,rows,field){
		if(err) throw err;
		var user = await global.getUser(String(rows[0].sender));
		const embed = {
			"color": 10590193,
			"timestamp": new Date(),
			"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"author": {
				"name": "OwO Bot Support",
				"icon_url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"
			},
			"fields": [
				{
					"name":"Thank you for your feedback!",
					"value": "==============================================="
				},{
					"name": "Message ID",
					"value": feedbackId,
					"inline": true
				},{
					"name": "Message Type",
					"value": rows[0].type,
					"inline": true
				},{
					"name": "Your Message",
					"value": "```"+rows[0].message+"```"
				},{
					"name": "Reply from Admin",
					"value": "```"+reply+"```\n\n==============================================="
				}
			]
		};

		user.send({embed})
			.catch(err => console.error(err));
		dm.send("Replied to user "+user.username)
			.catch(err => console.error(err));
		console.log("Admin Command: reply "+feedbackId+" {"+reply+"}");
		console.log("\tReplied to a feedback["+feedbackId+"] for "+user.username);
	});
}
