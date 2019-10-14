/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

var cooldown = {};
const permissions = require('../data/permissions.json');
const noEmoji = '🚫';
const skullEmoji = '☠';
const liftEmoji = '🙇';
const timerEmoji = '⏱';

//exports.check = async function(con,msg,client,command,callback,ignore){
exports.check = async function(p,command){

	let channel = p.msg.channel.id;
	let guild = p.msg.channel.guild.id;
	let author = p.msg.author.id;

	if(cooldown[author+command]) return;

	//Check for channel cooldown
	if(!cooldown[channel]){
		cooldown[channel] = 1;
		setTimeout(() => {delete cooldown[channel];}, 5000);
	}else if(cooldown[channel]>=6){
		cooldown[channel]++;
		if(command!="points"&&cooldown[channel]==8)
			await p.send(timerEmoji+" **|** This channel is getting a little too crowded! Please slow down for me! ;c",3000);
		return;
	}else if(cooldown[channel]<7){
		cooldown[channel]++;
	}

	//Check if there is a global cooldown
	if(!cooldown[author]){
		cooldown[author] = 1;
		setTimeout(() => {delete cooldown[author];}, 5000);
	}else if(cooldown[author]>=3) {
		cooldown[author]++;
		if(command!="points"&&cooldown[author]==4)
			await p.replyMsg(timerEmoji,", Please slow down~ You're a little **too fast** for me :c",3000);
		return;
	}else if(cooldown[author]<3){
		cooldown[author]++;
	}


	//Check if the command is enabled
	let sql = `SELECT * FROM disabled WHERE (command = '${command}' OR command = 'all') AND channel = ${channel};
				SELECT id FROM timeout WHERE id IN (${author},${guild}) AND TIMESTAMPDIFF(HOUR,time,NOW()) < penalty;
				SELECT * FROM user_ban WHERE id = ${author} AND command = '${command}';`;
	let result = await p.query(sql);
	if(result[1][0]){
		// User in timeout
	}else if(result[2][0]){
		// User is banned from this command
		cooldown[author+command] = true;
		setTimeout(() => {delete cooldown[author+command];}, 10000);
		await msg.errorMsg(", you're banned from this command! >:c",3000);
	}else if(!result[0][0]||["points","disable","enable"].includes(command)){
		// Success
		return true;
	}else{
		// Command is disabled in the channel
		cooldown[msg.author.id+command] = true;
		setTimeout(() => {delete cooldown[msg.author.id+command];}, 30000);
		await msg.errorMsg(", that command is disabled on this channel!",3000);
	}
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
