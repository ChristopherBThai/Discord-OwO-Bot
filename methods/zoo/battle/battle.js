//Battle methods!

const animal = require('../../tokens/owo-animals.json');
const userbattle = require('./battleuser.js');
const global = require('./global.js');
const help = require('./helper.js');
const food = require('./food.js');
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
		}

//Checks if user can battle or not
exports.battle = function(con,msg,args){
	var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0]==undefined||result[0].money<5){
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			startBattle(con,msg,args);
		}
	});
}


//Starts a battle against a random user
function startBattle(con,msg,args){
		console.log(sql);
	
		const embed = {
			"color":,
			"fields": [{
					"name": user1.username,
					"value": "** "+user1.unicode+" "+user1.name+"**\n`Lvl "+user1.lvl+"` "+user1.fdisplay+"\n`████████████████████`\n**`HP`**`: "+user1.hp+"/"+(user1.mhp+user1.bonushp)+"`    **`ATT`**`: "+(user1.attack+user1.bonusatt)+"`",
					"inline": true
				},{
					"name": user2.username,
					"value": "** "+user2.unicode+" "+user2.name+"**\n`Lvl "+user2.lvl+"` "+user2.fdisplay+"\n`████████████████████`\n**`HP`**`: "+user2.hp+"/"+(user2.mhp+user2.bonushp)+"`    **`ATT`**`: "+(user2.attack+user2.bonusatt)+"`",
					"inline": true
				},{
					"name": "Battle (0/3)! (Win Streak: "+user1.streak+")",
					"value": "```diff\n+ -----------------------\n- -----------------------\n= ```"
				}]
		};

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
		var streak = user1.streak;
		if(streak>1000)
			streak = 1000;
		end = "You won! "+user1.name+" earned "+xp+"(+"+streak+") xp!";
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









