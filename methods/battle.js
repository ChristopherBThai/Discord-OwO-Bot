//Battle methods!

const animal = require('../../tokens/owo-animals.json');
const global = require('./global.js');
var h = "█";
var n = "▁";

//Starts a battle against a random user
exports.battle = function(msg,args){
	var log = [];
	var user1 = {
		"username":"Scuttler",
		"name":"Sheepie",
		"animal":":sheep:",
		"lvl":5,
		"attack":4,
		"mhp":10,
		"hp":10};
	var user2 = {
		"username":"Daquan",
		"name":"Dragoon",
		"animal":":dragon:",
		"lvl":3,
		"attack":4,
		"mhp":10,
		"hp":10};
	for(i = 0;i<3;i++){
		dmg1 = Math.ceil(Math.random()*user1.attack);
		dmg2 = Math.ceil(Math.random()*user2.attack);
		log.push({"dmg1":dmg1,"dmg2":dmg2});
	}
	const embed = {
		  "color": 4541485,
		  "fields": [{
				"name": user1.username,
				"value": "** "+user1.animal+" "+user1.name+"** Lvl "+user1.lvl+" ("+user1.hp+"/"+user1.mhp+")\n`████████████████████`",
			        "inline": true
			},{
				"name": user2.username,
			        "value": "** "+user2.animal+" "+user2.name+"** Lvl "+user2.lvl+" ("+user2.hp+"/"+user2.mhp+")\n`████████████████████`",
			        "inline": true
		  	},{
			        "name": "Battle (0/3)!",
			        "value": "```diff\n+ -----------------------\n- -----------------------\n= ```"
			}]
	};

	msg.channel.send({embed})
		.then(message => setTimeout(function(){
			display(message,user1,user2,log,0);
		},700));
}

//Recursion to update battle message
function display(msg,user1,user2,log,count){
	var win,lose,draw,end;
	if(user1.hp<=0){
		end = "You lost! "+user1.name+" earned 1 xp!";
		lose = true;
	}else if(user2.hp<=0){
		var xp = user2.lvl - user1.lvl;
		if(xp<0)
			xp = 5;
		else
			xp += 5;
		end = "You won! "+user1.name+" earned "+xp+" xp!";
		win = true;
	}else if(count==3){
		end = "It's a draw! "+user1.name+" earned 3 xp!";
		draw = true;
	}else{
		user1.hp -= log[count].dmg2;
		user2.hp -= log[count].dmg1;
		if(user1.hp<0)
			user1.hp = 0;
		if(user2.hp<0)
			user2.hp = 0;
	}


	//Calculate health % for hp bar
	var percent1 = Math.ceil((user1.hp/user1.mhp)*20);
	var percent2 = Math.ceil((user2.hp/user2.mhp)*20);
	
	//Sets up HP bar
	var value1 = "** "+user1.animal+" "+user1.name+"** Lvl "+user1.lvl+" ("+user1.hp+"/"+user1.mhp+")\n`";
	var value2 = "** "+user2.animal+" "+user2.name+"** Lvl "+user2.lvl+" ("+user2.hp+"/"+user2.mhp+")\n`";
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
	if(win||lose||draw){
		title = "Battle ("+(count)+"/3)!";
		actions = "```diff\n+ "+user1.name+" hits "+user2.name+" for "+log[count-1].dmg1+"hp!\n- "+user2.name+" hits "+user1.name+" for "+log[count-1].dmg2+"hp!\n= "+end+"```";
	}else{
		title = "Battle ("+(count+1)+"/3)!";
		actions = "```diff\n+ "+user1.name+" hits "+user2.name+" for "+log[count].dmg1+"hp!\n- "+user2.name+" hits "+user1.name+" for "+log[count].dmg2+"hp!\n= ```";
	}

	const embed = {
		  "color": 4541485,
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
		msg.edit({embed});
	else
		msg.edit({embed})
			.then(message => setTimeout(function(){
			display(message,user1,user2,log,count+1);
		},700));
}

//Sets an animal as a pet!
exports.set = function(mysql, con,msg,args){
	if(!(args.length==3||args.length==2))
		return;
	var animal = global.validAnimal(args[1]);
	if(animal==undefined){
		msg.channel.send("No such animal exists!");
		return;
	}
	var nickname = args[2];
	if(nickname == undefined)
		nickname = " ";
	else if(nickname.length>35){
		msg.channel.send("Nickname is too long!");
		return;
	}
	var sql = "UPDATE cowoncy NATURAL JOIN animal SET pet = name, ispet = 1, nickname = ? WHERE id = "+msg.author.id+" AND name = '"+animal+"';";
	sql = mysql.format(sql,nickname);
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows.affectedRows==0){
			msg.channel.send("**"+msg.author.username+"**, you do not have this pet!");
		}else
			msg.channel.send("**"+msg.author.username+"**, you successfully set your pet as **"+animal+" "+nickname+"**!");
	});
}

//Displays pet
exports.pet = function(con,msg){
	var sql = "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND pet = name; SELECT * FROM animal NATURAL JOIN cowoncy WHERE id = "+msg.author.id+" AND ispet = 1 AND pet != name ORDER BY lvl,xp LIMIT 24;";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		var pet = rows[0][0];
		var opet = rows[1];
		if(pet==undefined)
			msg.channel.send("You don't have a pet yet!");
		else{
			var nickname = pet.nickname;
			if(nickname == undefined)
				nickname = "";
			var embed = {
				"color": 4886754,
				"author": {
					"name": "Scuttler's Pet(s)",
					"icon_url": msg.author.avatarURL
				},
				"fields": [{
					"name": ":star: "+pet.name + " " + nickname,
					"value": "`lvl: "+pet.lvl+" ("+pet.xp+"/10)`\n`hp:  "+pet.hp+"`\n`att: "+pet.att+"`",
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
					"value": "`lvl: "+pet.lvl+" ("+pet.xp+"/10)`\n`hp:  "+pet.hp+"`\n`att: "+pet.att+"`",
					"inline": true
				});
			}

			msg.channel.send({ embed });
		}
	});
}
