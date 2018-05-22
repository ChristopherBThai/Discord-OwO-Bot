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
