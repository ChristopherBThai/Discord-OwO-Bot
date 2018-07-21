const global = require('../../../util/global.js');
const logger = require('../../../util/logger.js');
const food = require('../../../json/food.json');
const foodUtil = require('./food.js');
const name_id = {};

for(var key in food){
	name_id[food[key].name] = key;
}

exports.buy = function(con,msg,food){
	global.checkCowoncy(msg,food.price,function(){
		var sql = "INSERT IGNORE INTO user_food (uid,fid,fcount) values ((SELECT uid FROM user WHERE id = "+msg.author.id+"),(SELECT fid FROM food WHERE fname = '"+food.name+"'),1) ON DUPLICATE KEY UPDATE fcount = fcount + 1;";
		sql += "UPDATE cowoncy SET money = money - "+food.price+" WHERE id = "+msg.author.id+";";

		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			logger.value('cowoncy',(food.price*-1),['command:shop','id:'+msg.author.id]);
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
				msg.channel.send("**🛒 | "+msg.author.username+"**, You have successfully purchased:\n**<:blank:427371936482328596> | "+food.key+" "+food.name+"** for **<:cowoncy:416043450337853441> "+(global.toFancyNum(food.price))+"**!");
			}
		});
	});
}

//Gets whole inventory
exports.getItems = function(con,id,callback){
	var sql = "SELECT fname,fcount FROM user NATURAL JOIN user_food NATURAL JOIN food WHERE id = "+id+" AND fcount > 0 ORDER BY fid ASC;";
	con.query(sql,function(err,rows,fields){
		if(err){console.error(err);return;}
		var items = {};
		for(var i = 0;i<rows.length;i++){
			var key = name_id[rows[i].fname];
			var item = food[key];
			item["key"] = key;
			item["count"] = rows[i].fcount;
			items[key] = item;
		}
		callback(items);
	});

}

exports.getFoodJson = function(name){
	var id = name_id[name];
	if(id==undefined)
		return undefined;
	var result = food[id];
	result["key"] = id;
	return result;
}

exports.equip = function(con,msg,item){
	var sql = "SELECT COUNT(*) AS count FROM animal_food NATURAL JOIN animal NATURAL JOIN cowoncy WHERE id = "+msg.author.id+" AND pet = name;";
	sql += "SELECT * FROM animal NATURAL JOIN cowoncy WHERE id = "+msg.author.id+" AND pet = name;";
	sql += "SELECT * FROM user_food NATURAL JOIN food NATURAL JOIN user WHERE fname = '"+item.name+"' AND id = "+msg.author.id+" AND fcount > 0;";
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
		if(foodCount>=3){
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
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			var gain = "";
			if(item.att)
				gain = "+"+item.att+" att";
			if(item.hp){
				if(gain=="")
					gain = "+"+item.hp+" hp";
				else
					gain = " and +"+item.hp+" hp";
			}
			if(gain!="")
				gain = "\n**<:blank:427371936482328596> | "+animal.nickname+"** gains "+gain+"!";
			msg.channel.send("**🌱 | "+msg.author.username+"**, **"+global.unicodeAnimal(animal.name)+" "+animal.nickname+"** ate the **"+item.key+" "+item.name+"**!"+gain);
		});

	});
}

exports.throwup = function(con,msg){
	var sql = "SELECT id,money,nickname,name,lvl,att,hp,lvl,streak,xp, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three "+
		"FROM (cowoncy NATURAL JOIN animal) LEFT JOIN (animal_food NATURAL JOIN food) "+
		"ON animal.pid = animal_food.pid "+
		"WHERE id = "+msg.author.id+" AND pet = name GROUP BY animal.pid;";
	sql += "SELECT * FROM user_food NATURAL JOIN food NATURAL JOIN user WHERE fname = 'Pill' AND id = "+msg.author.id+" AND fcount > 0;";
	con.query(sql,function(err,rows,fields){
		if(err){console.error(err);return;}
		if(rows[0][0]==undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You do not have a pet! Set one with `owo pet set {animal} {nickname}`")
				.catch(err => console.error(err));
			return
		}
		if(rows[1][0]==undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You do not have this item in your inventory!")
				.catch(err => console.error(err));
			return
		}
		var items = "";
		if(item = foodUtil.getFoodJson(rows[0][0].one))
			items += item.key
		if(item = foodUtil.getFoodJson(rows[0][0].two))
			items += item.key
		if(item = foodUtil.getFoodJson(rows[0][0].three))
			items += item.key
		if(items == ""){
			msg.channel.send("**🚫 | "+msg.author.username+"**, Your pet doesn't have anything to throw up!")
				.catch(err => console.error(err));
			return
		}


		sql = "DELETE FROM animal_food WHERE pid = (SELECT pid FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND pet = name);";
		sql += "UPDATE user_food SET fcount = fcount-1 WHERE uid = "+rows[1][0].uid+" AND fid = "+rows[1][0].fid+";";
		con.query(sql,function(err,rows2,fields){
			if(err){console.error(err);return;}
			msg.channel.send("**💊 | "+msg.author.username+"**, **"+rows[0][0].name+" "+rows[0][0].nickname+"** threw up "+items+"!")
				.catch(err => console.error(err));
		});
	});
}
