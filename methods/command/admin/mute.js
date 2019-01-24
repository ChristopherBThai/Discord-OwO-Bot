const Discord = require("discord.js");
const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["mute"],

	admin:true,
	mod:true,
	// dm:true,

	execute: async function(p){
		var global=p.global,con=p.con,args=p.args,msg=p.msg;

		// make copy without global flag
		const UsersPattern = new RegExp(Discord.MessageMentions.USERS_PATTERN.source);

		let id, member;
		if (UsersPattern.test(args[0])) {
			member = msg.mentions.members.first();
			id = member.id;
		}
		else if (UsersPattern.test(`<@${args[0]}>`)) {
			id = args[0];
			member = msg.guild.members.get(id);
		} else {
			p.send("Invalid user id/mention");
			return;
		}

		let minutes;
		if(global.isInt(args[1])){
			minutes = parseInt(args[1]);
		}else{
			p.send("Wrong time format");
			return;
		}

		let reason = args.slice(2).join(" ");
		if(!!reason.trim())
			reason = "\n**<:blank:427371936482328596> | Reason:** "+reason;

		try {
			await member.addRole("536311748517691406");
		} catch (e) {
			console.log(e);
			if (!msg.guild.me.hasPermission("MANAGE_ROLES")) {
				p.send("I don't have permission to manage roles!");
			} else {
				p.send("Failed to add role to member");
			}
			return;
		}

		var sql = `REPLACE INTO mutes (id,expire) VALUES (${id},NOW() + INTERVAL ${minutes} minute);`;
		con.query(sql,async function(err,rows,fields){
			if(err) throw err;
			if(user = await sender.msgUser(id,`**☠ |** You have been muted for ${minutes} minutes! ${reason}`))
				p.send(`**☠ |** ${user.username} has been muted for ${minutes} minutes!${reason}`);
			else
				p.send("Failed to send a message to user");
		});
	}

})
