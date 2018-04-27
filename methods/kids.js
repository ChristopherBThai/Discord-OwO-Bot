
exports.censor = function(con,msg,args){
	if(args.length>0){
		msg.channel.send("**🚫 | "+msg.author.username+"**, Invalid Arguments!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	
	var sql = "INSERT INTO guild (id,count,young) VALUES ("+msg.guild.id+",0,1) ON DUPLICATE KEY UPDATE young = 1;";
	con.query(sql,function(err,result){
		if(err){ console.error(err); return;}
			msg.channel.send("**⚙ |** This guild is now kid friendly! Any offensive words will be censored!")
				.catch(err => console.error(err));
	});

}

exports.uncensor = function(con,msg,args){
	if(args.length>0){
		msg.channel.send("**🚫 | "+msg.author.username+"**, Invalid Arguments!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	
	var sql = "INSERT INTO guild (id,count,young) VALUES ("+msg.guild.id+",0,0) ON DUPLICATE KEY UPDATE young = 0;";
	con.query(sql,function(err,result){
		if(err){ console.error(err); return;}
			msg.channel.send("**⚙ |** Censorship in this guild has been removed! Offensive words will be displayed")
				.catch(err => console.error(err));
	});

}
