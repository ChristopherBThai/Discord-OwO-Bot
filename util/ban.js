var cooldown = {};

exports.check = async function(con,msg,command,callback,ignore){
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
			.catch(err => console.error(err));
		return;
	}else if(cooldown[msg.author.id]<3){
		cooldown[msg.author.id]++;
	}


	//Check if the command is enabled
	var sql = "SELECT * FROM disabled WHERE command = '"+command+"' AND channel = "+channel+";";
	sql += "SELECT id FROM timeout WHERE id = "+msg.author.id+" AND TIMESTAMPDIFF(HOUR,time,NOW()) < penalty;";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[1][0]!=undefined){
		}else if(rows[0][0]==undefined||command=="points"){
			callback();
		}else
			msg.channel.send("**🚫 |** That command is disabled on this channel!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
	});
}

