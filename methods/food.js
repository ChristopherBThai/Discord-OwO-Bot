const global = require('./global.js');
const food = require('../json/food.json');
const name_id = {};

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

exports.getItems = function(con,id,callback){
	var sql = "SELECT name,fcount FROM user NATURAL JOIN user_food NATURAL JOIN food WHERE id = "+id+" AND fcount > 0 ORDER BY fid ASC;";
	con.query(sql,function(err,rows,fields){
		if(err){console.error(err);return;}
		var items = {};
		for(var i = 0;i<rows.length;i++){
			var key = name_id[rows[i].name];
			var item = food[key];
			item["key"] = key;
			items[key] = item;
		}
		callback(items);
	});

}

exports.equip = function(con,msg,item){
	
	var sql = "SELECT COUNT(*) AS count FROM animal_food NATURAL JOIN animal NATURAL JOIN cowoncy WHERE id = "+msg.author.id+" AND pet = name;";
	sql += "SELECT * FROM animal NATURAL JOIN cowoncy WHERE id = "+msg.author.id+" AND pet = name;";
	sql += "SELECT * FROM user_food NATURAL JOIN food NATURAL JOIN user WHERE name = '"+item.name+"' AND id = "+msg.author.id+" AND fcount > 0;";
	con.query(sql,function(err,rows,fields){
		if(err){console.error(err);return;}
		if(rows[0][0]==undefined||rows[1][0]==undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You do not have a pet! Set one with `owo pet set {animal} {nickname}`")
				.catch(err => console.error(err));
			return;
		}
		if(rows[2][0]==undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You do not have this item in your inventory!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
			return;
		}
		var foodCount = parseInt(rows[0][0].count);
		if(foodCount>3){
			msg.channel.send("**🚫 | "+msg.author.username+"**, Your pet can only have up to 3 items!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
			return;
		}
		var animal = rows[1][0];
		var userFood= rows[2][0];

		var sql = "INSERT INTO animal_food (pid,fid,pfid) VALUES ("+
			"("+animal.pid+"),"+
			"("+userFood.fid+"),"+
			"("+(foodCount+1)+"));";
		sql += "UPDATE user_food SET fcount = fcount-1 WHERE uid = "+userFood.uid+" AND fid = "+userFood.fid+";";
		console.log(sql);
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			msg.channel.send("**🌱 | "+msg.author.username+"**, You have successfully equipped **"+item.key+" "+item.name+"** on **"+global.unicodeAnimal(animal.name)+" "+animal.nickname+"**!");
		});

	});
}

exports.init = function(){
	for(var key in food){
		name_id[food[key].name] = key;
	}
}
