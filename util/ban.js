var cooldown = {};
const permissions = require('../json/permissions.json');

exports.check = async function(con,msg,client,command,callback,ignore){
	//Check if the channel has all the valid permissions
	if(command!="points"&&!checkPermissions(msg,client)) return;

	//If its a global command (no cooldown/disable)
	if(ignore){
		callback();
		return;
	}

	var channel = msg.channel.id;

	//Check if there is a global cooldown
	if(cooldown[msg.author.id]==undefined){
		cooldown[msg.author.id] = 1;
		setTimeout(() => {delete cooldown[msg.author.id];}, 5000);
	}else if(cooldown[msg.author.id]>=3) {
		msg.channel.send("**⏱ | "+msg.author.username+"**, Please slow down~ You're a little **too fast** for me :c")
			.then(message => message.delete(3000))
			.catch(err => console.info(err));
		return;
	}else if(cooldown[msg.author.id]<3){
		cooldown[msg.author.id]++;
	}


	//Check if the command is enabled
	var sql = "SELECT * FROM disabled WHERE command = '"+command+"' AND channel = "+channel+";";
	sql += "SELECT id FROM timeout WHERE id IN ("+msg.author.id+","+msg.guild.id+") AND TIMESTAMPDIFF(HOUR,time,NOW()) < penalty;";
	sql += "SELECT * FROM rules WHERE uid = (SELECT uid FROM user WHERE id = "+msg.author.id+");";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[1][0]!=undefined){
		}else if(command=="points"){
			callback();
		}else if(rows[0][0]!=undefined) {
			msg.channel.send("**🚫 |** That command is disabled on this channel!")
				.then(message => message.delete(3000))
				.catch(err => console.info(err));
		}else if(["rule","help","enable","disable","censor","uncensor","invite","guildlink"].includes(command)) {
			callback();
		}else if(rows[2][0]==undefined) {
			msg.channel.send("**🚫 |** Please read and accept the rules first! (`owo rules`)")
				.then(message => message.delete(3000))
				.catch(err => console.info(err));
		}else callback();
	});
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
