//Battle methods!

const animal = require('../../tokens/owo-animals.json');
const badwords = require('../../tokens/badwords.json');
const userbattle = require('./battleuser.js');
const global = require('./global.js');
const help = require('./helper.js');
var h = "█";
var n = "▁";

//Decides which command to execute (Command: battle)
exports.execute_b = function(mysql,con,msg,args){
		var subcommand = args[0];
		if(subcommand != undefined)
			subcommand = subcommand.toLowerCase();
		if(global.isUser(subcommand))
			userbattle.battle(con,msg,args);
		else if(subcommand=="set"||subcommand=="s"||subcommand=="add"||subcommand=="a"||subcommand=="replace")
			this.set(mysql,con,msg,args);
		else if(subcommand=="remove"||subcommand=="delete"||subcommand=="d")
			this.remove(mysql,con,msg,args);
		else if(subcommand=="rename"||subcommand=="r"||subcommand=="name")
			this.rename(mysql,con,msg,args);
		else if(subcommand=="pets"||subcommand=="p"||subcommand=="pet"||subcommand=="zoo"||subcommand=="z")
			this.pet(con,msg);
		else if(subcommand=="help")
			help.describe(msg,"battle");
		else if(args.length<1)
			this.battle(con,msg,args);
}

//Decides which command to execute (Command: pets)
exports.execute_p = function(mysql,con,msg,args){
		var subcommand = args[0];
		if(subcommand != undefined)
			subcommand = subcommand.toLowerCase();
		if(args.length==0)
			this.pet(con,msg);
		if(subcommand=="set"||subcommand=="s"||subcommand=="add"||subcommand=="a"||subcommand=="replace")
			this.set(mysql,con,msg,args);
		else if(subcommand=="remove"||subcommand=="delete"||subcommand=="d")
			this.remove(mysql,con,msg,args);
		else if(subcommand=="rename"||subcommand=="r"||subcommand=="name")
			this.rename(mysql,con,msg,args);
		else if(subcommand=="help")
			help.describe(msg,"pets");
}

//Checks if user can battle or not
exports.battle = function(con,msg,args){
	var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0]==undefined||result[0].money<5){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			startBattle(con,msg,args);
		}
	});
}


//Starts a battle against a random user
function startBattle(con,msg,args){
	var sql = "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND pet = name;";
	sql += "SET @rand = (CEIL(RAND()*(SELECT COUNT(*) FROM animal WHERE ispet = 1 AND id != "+msg.author.id+")));"+
		"SELECT * FROM (SELECT animal.*,@rownum := @rownum + 1 AS rank FROM animal ,(SELECT @rownum := 0) r WHERE ispet = 1 AND id != "+msg.author.id+") d WHERE rank <= @rand ORDER BY rank DESC LIMIT 1;"
	sql += "SELECT young FROM guild WHERE id = "+msg.guild.id+";";
	sql += "UPDATE cowoncy SET money = money - 5 WHERE id = "+msg.author.id+";"
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		
		//Checks if users has a pet
		var upet = rows[0][0];
		var opet = rows[2][0];
		if(upet == undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You don't have a pet! Set one with `owo pets add [animal] [nickname]`")
				.catch(err => console.error(err));
			return;
		}

		if(opet == undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, Something went wrong...")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
			return;
		}

		//Finds opponent
		var opponent = await global.getUser(opet.id);
		var eid;
		if(opponent==undefined)
			opponent = "A User";
		else{
			eid = opponent.id;
			opponent = opponent.username;
		}

		//Assign variables to each user
		if(rows[3][0]!=undefined && rows[3][0].young && opet.offensive)
			opet.nickname= "Potty Mouth";
		var log = [];
		var user1 = {
			"username":msg.author.username,
			"name":upet.nickname,
			"animal":upet.name,
			"unicode":global.unicodeAnimal(upet.name),
			"lvl":upet.lvl,
			"attack":upet.att,
			"mhp":upet.hp,
			"hp":upet.hp,
			"mxp":maxxp(upet.lvl),
			"streak":upet.streak,
			"xp":upet.xp};
		var user2 = {
			"username":opponent,
			"name":opet.nickname,
			"animal":opet.name,
			"unicode":global.unicodeAnimal(opet.name),
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
			user1.name = "You";
		if(user2.name==null)
			user2.name= "Enemy";
		const embed = {
			"color":4886754,
			"fields": [{
					"name": user1.username,
					"value": "** "+user1.unicode+" "+user1.name+"**\n`Lvl "+user1.lvl+"` *`("+user1.xp+"/"+user1.mxp+")`*\n`████████████████████`\n**`HP`**`: "+user1.hp+"/"+user1.mhp+"`    **`ATT`**`: "+user1.attack+"`",
					"inline": true
				},{
					"name": user2.username,
					"value": "** "+user2.unicode+" "+user2.name+"**\n`Lvl "+user2.lvl+"`\n`████████████████████`\n**`HP`**`: "+user2.hp+"/"+user2.mhp+"`    **`ATT`**`: "+user2.attack+"`",
					"inline": true
				},{
					"name": "Battle (0/3)! (Win Streak: "+user1.streak+")",
					"value": "```diff\n+ -----------------------\n- -----------------------\n= ```"
				}]
		};

		msg.channel.send("**"+msg.author.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",{embed})
			.then(message => setTimeout(function(){
				display(con,msg.author.id,eid,message,user1,user2,log,0);
				},1000))
			.catch(err => msg.channel.send("**🚫 | "+msg.author.username+"**, I don't have permission to send embeded messages!")
				.catch(err => console.error(err)));
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
		exp = 3;
		winner = 0;
		color = 6381923;
		end = "It's a draw! "+user1.name+" earned "+xp+" xp!";
		user1.streak = 0;
		draw = true;
	}else if(user1.hp<=0){
		xp = 1;
		exp = 15;
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
		end = "You won! "+user1.name+" earned "+xp+"(+"+user1.streak+") xp!";
		win = true;
	}else if(count>=2){
		if(user1.hp>user2.hp){
			xp = 5;
			exp = 3;
		}else if(user1.hp<user2.hp){
			xp = 3;
			exp = 5;
		}else{
			exp = 4;
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
		lvlup = givexp(con,winner,   id,user1,xp,   eid,user2,exp);
		if(lvlup[0]!=undefined){
			end += "\n= "+user1.name+" leveled up and gained "+lvlup[2]+" att and "+lvlup[3]+" hp!";
			user1.lvl = lvlup[0];
			user1.xp = lvlup[1];
			user1.mxp = maxxp(user1.lvl);
			user1.attack += lvlup[2];
			user1.mhp += lvlup[3];
		}
		user1.xp += xp;
		if(win)
			user1.xp += user1.streak-1;
	}


	//Calculate health % for hp bar
	var percent1 = Math.ceil((user1.hp/user1.mhp)*20);
	var percent2 = Math.ceil((user2.hp/user2.mhp)*20);
	
	//Sets up HP bar
	var value1 = "** "+user1.unicode+" "+user1.name+"**\n`Lvl "+user1.lvl+"` *`("+user1.xp+"/"+user1.mxp+")`*\n`";
	var value2 = "** "+user2.unicode+" "+user2.name+"**\n`Lvl "+user2.lvl+"`\n`";
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
	value1 += "`\n**`HP`**`: "+user1.hp+"/"+user1.mhp+"`    **`ATT`**`: "+user1.attack+"`";
	value2 += "`\n**`HP`**`: "+user2.hp+"/"+user2.mhp+"`    **`ATT`**`: "+user2.attack+"`";

	//Battle 
	var title,actions;
	title = "Battle ("+(count+1)+"/3)! (Win Streak: "+user1.streak+")";
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
			.catch(err => console.error(err));
	else
		msg.edit("**"+user1.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",{embed})
			.then(message => setTimeout(function(){
				display(con,id,eid,message,user1,user2,log,count+1);
				},1000))
			.catch(err => console.error(err));
}

//Sets an animal as a pet!
exports.set = function(mysql, con,msg,args){
	if(args.length<2){
		msg.channel.send("**🚫 | "+msg.author.username+"**, You have invalid arguments!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var animal = global.validAnimal(args[1]);
	if(animal==undefined){
		msg.channel.send("**🚫 | "+msg.author.username+"**, You can only use animals from your zoo!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var animal = animal.value;
	args.splice(0,2);
	var nickname = args.join(" ");;
	if(nickname!=undefined&&nickname.length>35){
		msg.channel.send("**🚫 | "+msg.author.username+"**, The nickname is too long!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var sql;
	if(nickname!=undefined&&nickname!=""){
		var offensive = 0;
		var shortnick = name.replace(/\s/g,"").toLowerCase();
		for(var i=0;i<badwords.length;i++){
			if(shortnick.includes(badwords[i]))
				offensive = 1;
		}
		sql = "UPDATE cowoncy NATURAL JOIN animal SET pet = name, ispet = 1, nickname = ?, offensive = "+offensive+" WHERE id = "+msg.author.id+" AND name = '"+animal+"';";
		sql = mysql.format(sql,nickname);
	}else{
		sql = "UPDATE cowoncy NATURAL JOIN animal SET pet = name, ispet = 1, offensive = 0 WHERE id = "+msg.author.id+" AND name = '"+animal+"';";
	}
	sql  += "SELECT nickname FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0].affectedRows==0){
			msg.channel.send("**🚫 | "+msg.author.username+"**, you do not have this pet!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			if(rows[1][0]!=undefined&&rows[1][0].nickname!=null)
				msg.channel.send("**🌱 | "+msg.author.username+"**, you successfully set your pet as **"+global.unicodeAnimal(animal)+" "+rows[1][0].nickname+"**!")
					.catch(err => console.error(err));
			else
				msg.channel.send("**🌱 | "+msg.author.username+"**, you successfully set your pet as **"+global.unicodeAnimal(animal)+"**!")
					.catch(err => console.error(err));
		}
	});
}

//Removes a pet!
exports.remove = function(mysql, con,msg,args){
	if(args.length!=2){
		msg.channel.send("**🚫 | "+msg.author.username+"**, You have invalid arguments!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var animal = global.validAnimal(args[1]);
	if(animal==undefined){
		msg.channel.send("**🚫 | "+msg.author.username+"**, You can only select animals from your zoo!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var animal = animal.value;

	var sql = "SELECT nickname,pet,name FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = '"+animal+"' AND ispet = 1;";
	sql += "UPDATE animal SET ispet = 0 WHERE id = "+msg.author.id+" AND name = '"+animal+"' AND name != (SELECT pet FROM cowoncy WHERE id = "+msg.author.id+");";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0][0]==undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, you do not have this pet!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else if(rows[0][0].pet==rows[0][0].name){
			msg.channel.send("**🚫 | "+msg.author.username+"**, you cannot remove your main pet!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			if(rows[0][0].nickname!=null)
				msg.channel.send("**🌱 | "+msg.author.username+"**, you successfully removed **"+global.unicodeAnimal(animal)+" "+rows[0][0].nickname+"**!")
					.catch(err => console.error(err));
			else
				msg.channel.send("**🌱 | "+msg.author.username+"**, you successfully removed  **"+global.unicodeAnimal(animal)+"**!")
					.catch(err => console.error(err));
		}
	});
}

//Renames an animal!
exports.rename = function(mysql,con,msg,args){
	args.splice(0,1);
	var name = args.join(" ");

	if(name.length>35){
		msg.channel.send("**🚫 | "+msg.author.username+"**, The nickname is too long!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}else if(name==""){
		msg.channel.send("**🚫 | "+msg.author.username+"**, Invalid nickname!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}

	var offensive = 0;
	var shortnick = name.replace(/\s/g,"").toLowerCase();
	console.log(shortnick);
	for(var i=0;i<badwords.length;i++){
		if(shortnick.includes(badwords[i]))
			offensive = 1;
	}

	sql = "UPDATE cowoncy NATURAL JOIN animal SET nickname = ?, offensive = "+offensive+" WHERE id = "+msg.author.id+" AND pet = name;";
	sql  += "SELECT name,nickname FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
	sql = mysql.format(sql,name);

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0].affectedRows==0){
			msg.channel.send("**🚫 | "+msg.author.username+"**, you do not have a pet!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			if(rows[1][0]!=undefined&&rows[1][0].nickname!=null)
				msg.channel.send("**🌱 | "+msg.author.username+"**, you successfully named your pet as **"+global.unicodeAnimal(rows[1][0].name)+" "+rows[1][0].nickname+"**!")
					.catch(err => console.error(err));
			else
				msg.channel.send("**🚫 | "+msg.author.username+"**, An error occured! :c")
					.then(message => message.delete(3000))
					.catch(err => console.error(err));
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
			msg.channel.send("**🚫 | "+msg.author.username+"**, You don't have a pet! Set one with `owo pets add [animal] [nickname]`")
				.catch(err => console.error(err));
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
					"name": ":star: "+global.unicodeAnimal(pet.name) + " " + nickname,
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
					"name": global.unicodeAnimal(pet.name) + " " + nickname,
					"value": "`lvl: "+pet.lvl+" ("+pet.xp+"/"+maxxp(pet.lvl)+")`\n`hp:  "+pet.hp+"`\n`att: "+pet.att+"`",
					"inline": true
				});
			}

			msg.channel.send({ embed })
				.catch(err => console.error(err));
		}
	});
}

//Levels a pet
function givexp(con,won, id,user1,xp, eid,user2,exp){
	var xp = user1.xp+xp;
	var lvl = user1.lvl;
	var animal = user1.animal;

	var expgain = exp;
	var exp = user2.xp;
	var elvl = user2.lvl;
	var eanimal = user2.animal;


	var result = []

	//Player's xp
	var win = 0;
	var lose = 0;
	var draw = 0;
	if(won == 1){
		win = 1;
		xp += user1.streak;
		user1.streak++;
	}else if(won == -1){
		lose = 1;
		user1.streak = 0;
	}else{
		draw = 1;
	}
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
	var sql = "UPDATE animal NATURAL JOIN cowoncy SET lvl = lvl + "+lvlup+",xp = "+xp+",streak = "+user1.streak+",att = att + "+att+",hp = hp + "+hp+",won = won + "+win+",lost = lost + "+lose+",draw = draw + "+draw+"  WHERE id = "+id+" AND name = pet;";

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
	return 25*lvl*lvl*Math.trunc((lvl+10)/10);
}
