const Discord = require("discord.js");
const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["unmute"],

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

		try {
			await member.removeRole("536311748517691406");
		} catch (e) {
			console.log(e);
			if (!msg.guild.me.hasPermission("MANAGE_ROLES")) {
				p.send("I don't have permission to manage roles!");
			} else {
				p.send("Failed to remove role from member");
			}
			return;
		}

		var sql = `DELETE FROM mutes WHERE id = ${id};`;
		con.query(sql,async function(err,rows,fields){
			if(err) throw err;
			if(user = await sender.msgUser(id, "Your mute has been lifted by an admin!"))
				p.send(`Mute has been lifted for ${user.username}`);
			else
				p.send("Failed to send a message to user");
		});
	}

})
