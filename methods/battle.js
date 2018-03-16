//Battle methods!

const animal = require('../../tokens/owo-animals.json');
const global = require('./global.js');
var h = "█";
var n = "▁";

//Checks if user can battle or not
exports.battle = function(client,con,msg,args){
	var sql = "SELECT money,TIMESTAMPDIFF(SECOND,battle,NOW()) AS time FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0]==undefined||result[0].money<5){
			msg.channel.send("**"+msg.author.username+"! You don't have enough cowoncy!**")
				.then(message => message.delete(3000));
		}else if(result[0].time <= 15){
			msg.channel.send("**"+msg.author.username+"! You need to wait "+(15-result[0].time)+" more seconds!**")
				.then(message => message.delete(3000));
		}else{
			startBattle(client,con,msg,args);
		}
	});
}


//Starts a battle against a random user
function startBattle(client,con,msg,args){
	var sql = "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND pet = name;";
	sql += "SET @rand = (CEIL(RAND()*(SELECT COUNT(*) FROM animal WHERE ispet = 1 AND id != "+msg.author.id+")));"+
		"SELECT * FROM (SELECT animal.*,@rownum := @rownum + 1 AS rank FROM animal ,(SELECT @rownum := 0) r WHERE ispet = 1 AND id != "+msg.author.id+") d WHERE rank <= @rand ORDER BY rank DESC LIMIT 1;"
	sql += "UPDATE cowoncy SET money = money - 5,battle = NOW() WHERE id = "+msg.author.id+";"
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		
		var upet = rows[0][0];
		var opet = rows[2][0];
		if(upet == undefined){
			msg.channel.send("You don't have a pet! Set one with `owo battle set [animal]`")
				.then(message => message.delete(3000));
			return;
		}

		if(opet == undefined){
			msg.channel.send("Something went wrong...")
				.then(message => message.delete(3000));
			return;
		}
		var opponent = client.users.get(opet.id);
		var eid;
		if(opponent==undefined)
			opponent = "A User";
		else{
			eid = opponent.id;
			opponent = opponent.username;
		}

		var log = [];
		var user1 = {
			"username":msg.author.username,
			"name":upet.nickname,
			"animal":upet.name,
			"lvl":upet.lvl,
			"attack":upet.att,
			"mhp":upet.hp,
			"hp":upet.hp,
			"mxp":maxxp(upet.lvl),
			"xp":upet.xp};
		var user2 = {
			"username":opponent,
			"name":opet.nickname,
			"animal":opet.name,
			"lvl":opet.lvl,
			"attack":opet.att,
			"mhp":opet.hp,
			"hp":opet.hp,
			"xp":opet.xp};
		for(i = 0;i<3;i++){
			dmg1 = Math.ceil(Math.random()*user1.attack);
			dmg2 = Math.ceil(Math.random()*user2.attack);
			log.push({"dmg1":dmg1,"dmg2":dmg2});
		}
		if(user1.name==null)
			user1.name = "";
		if(user2.name==null)
			user2.name= "";
		const embed = {
			"color":4886754,
			"fields": [{
					"name": user1.username,
					"value": "** "+user1.animal+" "+user1.name+"** Lvl "+user1.lvl+" *("+user1.xp+"/"+user1.mxp+")*\n**HP**: "+user1.hp+"/"+user1.mhp+"\t **ATT**: "+user1.attack+"\n`████████████████████`",
					"inline": true
				},{
					"name": user2.username,
					"value": "** "+user2.animal+" "+user2.name+"** Lvl "+user2.lvl+" \n**HP**: "+user2.hp+"/"+user2.mhp+"\t **ATT**: "+user2.attack+"\n`████████████████████`",
					"inline": true
				},{
					"name": "Battle (0/3)!",
					"value": "```diff\n+ -----------------------\n- -----------------------\n= ```"
				}]
		};

		msg.channel.send("**"+msg.author.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",{embed})
			.then(message => setTimeout(function(){
				display(con,msg.author.id,eid,message,user1,user2,log,0);
			},1000));
	});
}

//Recursion to update battle message
function display(con,id,eid,msg,user1,user2,log,count){
	var exp,xp,win,lose,draw,end = "",winner;
	var color = 4886754;

	//Calculate hp
	user1.hp -= log[count].dmg2;
	user2.hp -= log[count].dmg1;
	if(user1.hp<0)
		user1.hp = 0;
	if(user2.hp<0)
		user2.hp = 0;

	if(user1.hp<=0&&user2.hp<=0){
		xp = 3
		exp = 2;
		winner = 0;
		color = 6381923;
		end = "It's a draw! "+user1.name+" earned "+xp+" xp!";
		draw = true;
	}else if(user1.hp<=0){
		xp = 1;
		exp = 5;
		winner = -1;
		color = 16711680;
		end = "You lost! "+user1.name+" earned 1 xp!";
		lose = true;
	}else if(user2.hp<=0){
		exp = 0;
		xp = user2.lvl - user1.lvl;
		if(xp<0)
			xp = 15;
		else
			xp = xp*10 + 15;
		winner = 1;
		color = 65280;
		end = "You won! "+user1.name+" earned "+xp+" xp!";
		win = true;
	}else if(count>=2){
		if(user1.hp>user2.hp){
			xp = 5;
			exp = 1;
		}else if(user1.hp<user2.hp){
			xp = 3;
			exp = 3;
		}else{
			exp = 2;
			xp = 4;
		}
		winner = 0;
		color = 6381923;
		end = "It's a draw! "+user1.name+" earned "+xp+" xp!";
		draw = true;
	}

	var lvlup;
	//Give xp to users
	if(draw||win||lose){
		lvlup = givexp(con,xp+user1.xp,user1.lvl,id,user1.animal,winner,exp,user2.xp,user2.lvl,eid,user2.animal);
		if(lvlup[0]!=undefined){
			end += "\n= "+user1.name+" leveled up and gained "+lvlup[2]+" att and "+lvlup[3]+" hp!";
			user1.xp = lvlup[1];
		}
		user1.xp += xp;
	}


	//Calculate health % for hp bar
	var percent1 = Math.ceil((user1.hp/user1.mhp)*20);
	var percent2 = Math.ceil((user2.hp/user2.mhp)*20);
	
	//Sets up HP bar
	var value1 = "** "+user1.animal+" "+user1.name+"** Lvl "+user1.lvl+" *("+user1.xp+"/"+user1.mxp+")*\n**HP**: "+user1.hp+"/"+user1.mhp+"\t **ATT**: "+user1.attack+"\n`";
	var value2 = "** "+user2.animal+" "+user2.name+"** Lvl "+user2.lvl+" \n**HP**: "+user2.hp+"/"+user2.mhp+"\t **ATT**: "+user2.attack+"\n`";
	for(i=0;i<20;i++){
		if(i<percent1)
			value1 += "█";
		else
			value1 += "▁";
		if(i<percent2)
			value2 += "█";
		else
			value2 += "▁";
	}
	value1 += "`";
	value2 += "`";

	//Battle 
	var title,actions;
	title = "Battle ("+(count+1)+"/3)!";
	actions = "```diff\n+ "+user1.name+" hits "+user2.name+" for "+log[count].dmg1+"hp!\n- "+user2.name+" hits "+user1.name+" for "+log[count].dmg2+"hp!\n= "+end+"```";

	const embed = {
		  "color": color,
		  "fields": [{
				"name": user1.username,
				"value": value1,
			        "inline": true
			},{
				"name": user2.username,
			        "value": value2,
			        "inline": true
		  	},{
			        "name": title,
				"value": actions
			}]
	};

	if(win||lose||draw)
		msg.edit("**"+user1.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",{embed})
	else
		msg.edit("**"+user1.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",{embed})
			.then(message => setTimeout(function(){
			display(con,id,eid,message,user1,user2,log,count+1);
		},1000));
}

//Sets an animal as a pet!
exports.set = function(mysql, con,msg,args){
	if(!(args.length==3||args.length==2)){
		msg.channel.send("Invalid arguments!")
			.then(message => message.delete(3000));
		return;
	}
	var animal = global.validAnimal(args[1]);
	if(animal==undefined){
		msg.channel.send("You can only use animals from your zoo!")
			.then(message => message.delete(3000));
		return;
	}
	var animal = animal.value;
	var nickname = args[2];
	if(nickname!=undefined&&nickname.length>35){
		msg.channel.send("Nickname is too long!")
			.then(message => message.delete(3000));
		return;
	}
	var sql;
	if(nickname!=undefined){
		nickname = nickname.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, ':emoji:')
		sql = "UPDATE cowoncy NATURAL JOIN animal SET pet = name, ispet = 1, nickname = ? WHERE id = "+msg.author.id+" AND name = '"+animal+"';";
		sql = mysql.format(sql,nickname);
	}else{
		sql = "UPDATE cowoncy NATURAL JOIN animal SET pet = name, ispet = 1 WHERE id = "+msg.author.id+" AND name = '"+animal+"';";
	}
	sql  += "SELECT nickname FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0].affectedRows==0){
			msg.channel.send("**"+msg.author.username+"**, you do not have this pet!")
				.then(message => message.delete(3000));
		}else{
			if(rows[1][0]!=undefined&&rows[1][0].nickname!=null)
				msg.channel.send("**"+msg.author.username+"**, you successfully set your pet as **"+animal+" "+rows[1][0].nickname+"**!");
			else
				msg.channel.send("**"+msg.author.username+"**, you successfully set your pet as **"+animal+"**!");
		}
	});
}

//Renames an animal!
exports.rename = function(mysql,con,msg,args){
	args.splice(0,1);
	var name = args.join(" ");
	name = name.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, ':emoji:')

	if(name.length>35){
		msg.channel.send("Nickname is too long!")
			.then(message => message.delete(3000));
		return;
	}else if(name==""){
		msg.channel.send("Invalid nickname!")
			.then(message => message.delete(3000));
		return;
	}
	sql = "UPDATE cowoncy NATURAL JOIN animal SET nickname = ? WHERE id = "+msg.author.id+" AND pet = name;";
	sql  += "SELECT name,nickname FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
	sql = mysql.format(sql,name);
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0].affectedRows==0){
			msg.channel.send("**"+msg.author.username+"**, you do not have a pet!")
				.then(message => message.delete(3000));
		}else{
			if(rows[1][0]!=undefined&&rows[1][0].nickname!=null)
				msg.channel.send("**"+msg.author.username+"**, you successfully named your pet as **"+rows[1][0].name+" "+rows[1][0].nickname+"**!");
			else
				msg.channel.send("**"+msg.author.username+"**! An error occured! :c")
					.then(message => message.delete(3000));
		}
	});

}

//Displays pet
exports.pet = function(con,msg){
	var sql = "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND pet = name; SELECT * FROM animal NATURAL JOIN cowoncy WHERE id = "+msg.author.id+" AND ispet = 1 AND pet != name ORDER BY lvl desc,xp desc LIMIT 24;";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var pet = rows[0][0];
		var opet = rows[1];
		if(pet==undefined)
			msg.channel.send("You don't have a pet! Set one with `owo battle set [animal]`")
				.then(message => message.delete(3000));
		else{
			var nickname = pet.nickname;
			if(nickname == undefined)
				nickname = "";
			var embed = {
				"color": 4886754,
				"author": {
					"name": msg.author.username+"'s Pet(s)",
					"icon_url": msg.author.avatarURL
				},
				"fields": [{
					"name": ":star: "+pet.name + " " + nickname,
					"value": "`lvl: "+pet.lvl+" ("+pet.xp+"/"+maxxp(pet.lvl)+")`\n`hp:  "+pet.hp+"`\n`att: "+pet.att+"`",
					"inline": true
				}]
			};

			for(i in opet){
				pet = opet[i];
				var nickname = pet.nickname;
				if(nickname == undefined)
					nickname = "";
				embed.fields.push({
					"name": pet.name + " " + nickname,
					"value": "`lvl: "+pet.lvl+" ("+pet.xp+"/"+maxxp(pet.lvl)+")`\n`hp:  "+pet.hp+"`\n`att: "+pet.att+"`",
					"inline": true
				});
			}

			msg.channel.send({ embed });
		}
	});
}

//Levels a pet
function givexp(con,xp,lvl,id,animal,won, expgain,exp,elvl,eid,eanimal){
	var result = []

	//Player's xp
	var win = 0;
	var lose = 0;
	var draw = 0;
	if(won == 1)
		win = 1;
	else if(won == -1)
		lose = 1;
	else
		draw = 1;
	var neededxp = maxxp(lvl);
	var lvlup = 0;
	var att = 0;
	var hp = 0;
	if(xp/neededxp>=1){
		lvlup = 1;
		xp -= neededxp;
		animal = global.validAnimal(animal);
		att = animal.attr;
		hp = animal.hpr;
		result.push(lvl+1);
		result.push(xp);
		result.push(att);
		result.push(hp);
	}
	var sql = "UPDATE animal NATURAL JOIN cowoncy SET lvl = lvl + "+lvlup+",xp = "+xp+",att = att + "+att+",hp = hp + "+hp+",won = won + "+win+",lost = lost + "+lose+",draw = draw + "+draw+"  WHERE id = "+id+" AND name = pet;";

	//Opponent's xp
	if(expgain!=0&&eid!=undefined){
		exp += expgain;
		var eneededxp = maxxp(elvl);
		var elvlup = 0;
		var eatt = 0;
		var ehp = 0;
		eanimal = global.validAnimal(eanimal);
		if(exp/eneededxp>=1){
			elvlup = 1;
			exp -= eneededxp;
			eatt = eanimal.attr;
			ehp = eanimal.hpr;
		}
		sql += "UPDATE animal SET lvl = lvl + "+elvlup+",xp = "+exp+",att = att + "+eatt+",hp = hp + "+ehp+",won = won + "+lose+",lost = lost + "+win+",draw = draw + "+draw+" WHERE id = "+eid+" AND name = '"+eanimal.value+"';";
	}

	con.query(sql,function(err,rows,fields){
		if(err) throw err;

	});

	return result;
}

//Gets xp needed for that lvl
function maxxp(lvl){
	return 25*lvl*lvl;
}
