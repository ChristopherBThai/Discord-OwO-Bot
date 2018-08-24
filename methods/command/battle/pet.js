const CommandInterface = require('../../commandinterface.js');

const user_emote = require('../emotes/user_emote.js');
const global = require('../../../util/global.js');
const petutil = require('./petutil.js');
const badwords = require('../../../../tokens/badwords.json');
const food = require('../shop/food.js');
const dot = "<:dot:446129270688055303>";

module.exports = new CommandInterface({
	
	alias:["pets","pet"],

	args:"[set|rename|remove] {animal|name}",

	desc:"Displays your current pets! These pets can fight other users with 'owo battle'! You can only add pets from your zoo",

	example:["owo pets","owo pet set dog","owo pets rename dog doggo","owo pet set cat kitty"],

	related:["owo zoo","owo battle"],

	cooldown:1000,
	half:200,
	six:500,

	execute: function(p){
		var mysql=p.mysql.mysql,args=p.args,msg=p.msg,con=p.con;

		//Check if the command is supposed to be an user_emote
		if(global.isUser(args[0])){
			p.command = "pat";
			user_emote.execute(p);
			return;
		}

		var subcommand = args[0];
		if(subcommand != undefined)
			subcommand = subcommand.toLowerCase();
		if(args.length==0)
			pet(con,msg,p.send);
		if(subcommand=="set"||subcommand=="s"||subcommand=="add"||subcommand=="a"||subcommand=="replace")
			set(mysql,con,msg,args,p.send);
		else if(subcommand=="remove"||subcommand=="delete"||subcommand=="d")
			remove(con,msg,args,p.send);
		else if(subcommand=="rename"||subcommand=="r"||subcommand=="name")
			rename(mysql,con,msg,args,p.send);
		else if(subcommand=="help"){
			p.help = true;
			p.hcommand = "pets";
		}
	}

})

//Sets an animal as a pet!
function set(mysql,con,msg,args,send){
	if(args.length<2){
		send("**🚫 | "+msg.author.username+"**, You have invalid arguments!",3000);
		return;
	}
	var animal = global.validAnimal(args[1]);
	if(animal==undefined){
		send("**🚫 | "+msg.author.username+"**, You can only use animals from your zoo!",3000);
		return;
	}
	var animal = animal.value;
	args.splice(0,2);
	var nickname = args.join(" ");;
	if(nickname!=undefined&&nickname.length>35){
		send("**🚫 | "+msg.author.username+"**, The nickname is too long!",3000);
		return;
	}
	var sql;
	if(nickname!=undefined&&nickname!=""){
		var offensive = 0;
		var shortnick = nickname.replace(/\s/g,"").toLowerCase();
		for(var i=0;i<badwords.length;i++){
			if(shortnick.includes(badwords[i]))
				offensive = 1;
		}
		nickname = nickname.replace("https:","https;");
		nickname = nickname.replace("http:","http;");
		nickname = nickname.replace(/<!?[0-9]+>/gi,"User");
		sql = "UPDATE cowoncy NATURAL JOIN animal SET pet = name, ispet = 1, nickname = ?, offensive = "+offensive+", count = count - (CASE WHEN ispet=1 THEN 0 ELSE 1 END) WHERE id = "+msg.author.id+" AND name = '"+animal+"' AND (ispet=1 OR count>0);";
		sql = mysql.format(sql,nickname);
	}else{
		sql = "UPDATE cowoncy NATURAL JOIN animal SET pet = name, ispet = 1, offensive = 0,count = count - (CASE WHEN ispet=1 THEN 0 ELSE 1 END) WHERE id = "+msg.author.id+" AND name = '"+animal+"' AND (ispet=1 OR count>0);";
	}
	sql  += "SELECT nickname FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0].affectedRows==0){
			send("**🚫 | "+msg.author.username+"**, you do not have this pet!",3000);
		}else{
			if(rows[1][0]!=undefined&&rows[1][0].nickname!=null)
				send("**🌱 | "+msg.author.username+"**, you successfully set your pet as **"+global.unicodeAnimal(animal)+" "+rows[1][0].nickname+"**!");
			else
				send("**🌱 | "+msg.author.username+"**, you successfully set your pet as **"+global.unicodeAnimal(animal)+"**!");
		}
	});
}

//Removes a pet!
function remove(con,msg,args,send){
	if(args.length!=2){
		send("**🚫 | "+msg.author.username+"**, You have invalid arguments!",3000);
		return;
	}
	var animal = global.validAnimal(args[1]);
	if(animal==undefined){
		send("**🚫 | "+msg.author.username+"**, You can only select animals from your zoo!",3000);
		return;
	}
	var animal = animal.value;

	var sql = "SELECT nickname,pet,name FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = '"+animal+"' AND ispet = 1;";
	sql += "UPDATE IGNORE animal SET ispet = 0,count = count +1 WHERE ispet = 1 AND id = "+msg.author.id+" AND name = '"+animal+"' AND name != (SELECT pet FROM cowoncy WHERE id = "+msg.author.id+");";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0][0]==undefined){
			send("**🚫 | "+msg.author.username+"**, you do not have this pet!",3000);
		}else if(rows[0][0].pet==rows[0][0].name){
			send("**🚫 | "+msg.author.username+"**, you cannot remove your main pet!",3000);
		}else{
			if(rows[0][0].nickname!=null)
				send("**🌱 | "+msg.author.username+"**, you successfully removed **"+global.unicodeAnimal(animal)+" "+rows[0][0].nickname+"**!");
			else
				send("**🌱 | "+msg.author.username+"**, you successfully removed  **"+global.unicodeAnimal(animal)+"**!");
		}
	});
}

//Renames an animal!
function rename(mysql,con,msg,args,send){
	args.splice(0,1);
	var name = args.join(" ");

	if(name.length>35){
		send("**🚫 | "+msg.author.username+"**, The nickname is too long!",3000);
		return;
	}else if(name==""){
		send("**🚫 | "+msg.author.username+"**, Invalid nickname!",3000);
		return;
	}

	var offensive = 0;
	var shortnick = name.replace(/\s/g,"").toLowerCase();
	for(var i=0;i<badwords.length;i++){
		if(shortnick.includes(badwords[i]))
			offensive = 1;
	}

	name = name.replace("https:","https;");
	name = name.replace("http:","http;");
	name = name.replace(/<@!?[0-9]+>/gi,"User");

	sql = "UPDATE cowoncy NATURAL JOIN animal SET nickname = ?, offensive = "+offensive+" WHERE id = "+msg.author.id+" AND pet = name;";
	sql  += "SELECT name,nickname FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
	sql = mysql.format(sql,name);

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0].affectedRows==0){
			send("**🚫 | "+msg.author.username+"**, you do not have a pet!",3000);
		}else{
			if(rows[1][0]!=undefined&&rows[1][0].nickname!=null)
				send("**🌱 | "+msg.author.username+"**, you successfully named your pet as **"+global.unicodeAnimal(rows[1][0].name)+" "+rows[1][0].nickname+"**!");
			else
				send("**🚫 | "+msg.author.username+"**, An error occured! :c",3000);
		}
	});
}

//Displays pet
function pet(con,msg,send){
	var sql = "SELECT nickname,name,lvl,xp,hp,att, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three, "+
			"(CASE WHEN cowoncy.pet = animal.name THEN 1 ELSE 0 END) AS mainPet "+
		"FROM (cowoncy NATURAL JOIN animal) LEFT JOIN (animal_food NATURAL JOIN food) "+
		"ON animal.pid = animal_food.pid "+
		"WHERE id = "+msg.author.id+" AND ispet = 1 GROUP BY animal.pid ORDER BY mainPet DESC, lvl DESC, xp DESC;";

	con.query(sql,function(err,pets,fields){
		if(err){console.error(err);return;}
		if(pets==undefined)
			send("**🚫 | "+msg.author.username+"**, You don't have a pet! Set one with `owo pets add [animal] [nickname]`");
		else{
			var embed = {
				"color": 4886754,
				"author": {
					"name": msg.author.username+"'s Pet(s)",
					"icon_url": msg.author.avatarURL
				},
				"fields": []
			};

			for(var i=0;i<pets.length;i++){
				tpet = pets[i];
				var nickname = tpet.nickname;
				var one = food.getFoodJson(tpet.one);
				var two = food.getFoodJson(tpet.two);
				var three = food.getFoodJson(tpet.three);
				var fdisplay = "";
				var bonusAtt= 0;
				var bonusHp = 0;
				if(one){ 
					fdisplay += one.key;
					bonusAtt += one.att;
					bonusHp += one.hp;
				}else fdisplay += dot;
				if(two){
					fdisplay += two.key;
					bonusAtt += two.att;
					bonusHp += two.hp;
				}else fdisplay += dot;
				if(three){
					fdisplay += three.key;
					bonusAtt += three.att;
					bonusHp += three.hp;
				}else fdisplay += dot;
				tpet.hp += bonusHp;
				tpet.att += bonusAtt;

				if(nickname == undefined)
					nickname = "";
				embed.fields.push({
					"name": ((i==0)?":star:":"")+global.unicodeAnimal(tpet.name) + " " + nickname,
					"value": ((one||two||three)?fdisplay+"\n":"")+"`lvl: "+tpet.lvl+" ("+tpet.xp+"/"+petutil.maxxp(tpet.lvl)+")`\n`hp:  "+tpet.hp+"`\n`att: "+tpet.att+"`",
					"inline": true
				});
			}

			send({ embed })
		}
	});
}
