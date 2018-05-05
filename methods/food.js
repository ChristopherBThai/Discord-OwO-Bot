const global = require('./global.js');

exports.buy = function(con,msg,food){
	global.checkCowoncy(msg,food.price,function(){
		var sql = "INSERT IGNORE INTO user_food (uid,fid,fcount) values ((SELECT uid FROM user WHERE id = "+msg.author.id+"),(SELECT fid FROM food WHERE name = '"+food.name+"'),1) ON DUPLICATE KEY UPDATE fcount = fcount + 1;";
		sql += "UPDATE cowoncy SET money = money - "+food.price+" WHERE id = "+msg.author.id+";";

		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			if(rows[0].warningCount>0){
				msg.channel.send("**🚫 | "+msg.author.username+"**, An unexpected error occured...")
					.then(message => message.delete(3000))
					.catch(err => console.error(err));
				if(rows[1].changedRows>0){
					sql = "UPDATE cowoncy SET money = money + "+food.price+" WHERE id = "+msg.author.id+";";
					con.query(sql,function(err,rows,fields){
						if(err){
							msg.channel.send("**🚫 | "+msg.author.username+"**, I could not refund "+food.price+" cowoncy")
								.then(message => message.delete(3000))
								.catch(err => console.error(err));
							console.error(err);
						}else if(rows.changedRows==0){
							msg.channel.send("**🚫 | "+msg.author.username+"**, I could not refund "+food.price+" cowoncy")
								.then(message => message.delete(3000))
								.catch(err => console.error(err));
						}
					});
				}
			}else{
				msg.channel.send("**🛒 | "+msg.author.username+"**, You have successfully purchased:\n**<:blank:427371936482328596> | "+food.key+" "+food.name+"** for **<:cowoncy:416043450337853441> "+food.price+"**!");
			}
		});
	});
}
