/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

var cooldown = {};
const permissions = require('../json/permissions.json');
const noEmoji = '🚫';
const skullEmoji = '☠';
const liftEmoji = '🙇';

exports.check = async function(con,msg,client,command,callback,ignore){
	//Check if the channel has all the valid permissions
	//if(command!="points"&&!checkPermissions(msg,client)) return;

	//If its a global command (no cooldown/disable)
	if(ignore){
		callback();
		return;
	}

	let channel = msg.channel.id;

	if(cooldown[msg.author.id+command]){
		return;
	}

	//Check for channel cooldown
	if(!cooldown[msg.channel.id]){
		cooldown[msg.channel.id] = 1;
		setTimeout(() => {delete cooldown[msg.channel.id];}, 5000);
	}else if(cooldown[msg.channel.id]>=6){
		cooldown[msg.channel.id]++;
		if(command!="points"&&cooldown[msg.channel.id]==8){
			msg.channel.send("** |** This channel is getting a little too crowded! Please slow down for me! ;c")
				.then(message => message.delete({timeout:4000}))
				.catch(err => console.info(err));
		}
		return;
	}else if(cooldown[msg.channel.id]<7){
		cooldown[msg.channel.id]++;
	}

	//Check if there is a global cooldown
	if(cooldown[msg.author.id]==undefined){
		cooldown[msg.author.id] = 1;
		setTimeout(() => {delete cooldown[msg.author.id];}, 5000);
	}else if(cooldown[msg.author.id]>=3) {
		cooldown[msg.author.id]++;
		if(command!="points"&&cooldown[msg.author.id]==4)
			msg.channel.send("**⏱ | "+msg.author.username+"**, Please slow down~ You're a little **too fast** for me :c")
				.then(message => message.delete({timeout:3000}))
				.catch(err => console.info(err));
		return;
	}else if(cooldown[msg.author.id]<3){
		cooldown[msg.author.id]++;
	}


	//Check if the command is enabled
	var sql = "SELECT * FROM disabled WHERE (command = '"+command+"' OR command = 'all') AND channel = "+channel+";";
	sql += "SELECT id FROM timeout WHERE id IN ("+msg.author.id+","+msg.guild.id+") AND TIMESTAMPDIFF(HOUR,time,NOW()) < penalty;";
	sql += "SELECT * FROM user_ban WHERE id = "+msg.author.id+" AND command = '"+command+"';";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[1][0]!=undefined){
		}else if(rows[2][0]){
			if(msg.channel.memberPermissions(msg.guild.me).has("SEND_MESSAGES")){
				msg.channel.send("**🚫 |** You're banned from this command.")
					.then(message => message.delete({timeout:3000}))
			}
			cooldown[msg.author.id+command] = true;
			setTimeout(() => {delete cooldown[msg.author.id+command];}, 10000);
		}else if(rows[0][0]==undefined||["points","disable","enable"].includes(command)){
			callback();
		}else{
			if(msg.channel.memberPermissions(msg.guild.me).has("SEND_MESSAGES")){
				msg.channel.send("**🚫 |** That command is disabled on this channel!")
					.then(message => message.delete({timeout:3000}))
				cooldown[msg.author.id+command] = true;
				setTimeout(() => {delete cooldown[msg.author.id+command];}, 30000);
			}
		}
	});
}

exports.banCommand = async function(p,user,command,reason){
	let sql = `INSERT IGNORE INTO user_ban (id,command) VALUES (${user.id},?);`;
	let result = await p.query(sql,[command]);
	if(!result.affectedRows){
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${user.id},0);${sql}`;
		await p.query(sql,[command]);
	}
	await user.send(noEmoji+" **|** You have been banned from using the command: `"+command+"`\n"+p.config.emoji.blank+" **| Reason:** "+reason);
	await p.sender.msgModLogChannel(skullEmoji+" **| "+user.tag+"** is banned from using `"+command+"` forever.\n"+p.config.emoji.blank+" **| ID:** "+user.id+"\n"+p.config.emoji.blank+" **| Reason:** "+reason);
}

exports.liftCommand = async function(p,user,command){
	let sql = `DELETE FROM user_ban WHERE id = ${user.id} AND command = ?;`;
	let result = await p.query(sql,[command]);

	if(result.affectedRows){
		await user.send(liftEmoji+" **|** An admin has lifted your ban from the `"+command+"` command!");
		await p.send(liftEmoji+" **| "+user.tag+"**'s ban on `"+command+"` has been lifted!\n"+p.config.emoji.blank+" **| ID:** "+user.id);
	}else{
		await p.errorMsg(", **"+user.tag+"** does not have a ban on `"+command+"`!");
	}
}


function checkPermissions(msg,client){
	if(msg.channel.type!="text")
		return true;
	var perm = msg.channel.memberPermissions(client.user);
	perm = perm.toArray();
	for(var i=0;i<permissions.length;i++){
		if(!perm.includes(permissions[i])){
			msg.channel.send("**🚫 |** I don't have permissions for: `"+permissions[i]+"`!\n**<:blank:427371936482328596> |** Please contact an admin on your server or reinvite me with `owo invite`!")
				.catch(err => {console.info("I can't send messange in this channel! [ban.js/checkPermissions]")});
			console.info("Missing permission "+permissions[i]+" for "+msg.channel.id);
			return false;
		}
	}
	return true;
}
