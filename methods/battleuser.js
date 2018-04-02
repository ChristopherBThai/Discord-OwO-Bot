const global = require('./global.js');

//Accepts battle
exports.accept = function(con,msg,args){
	var sql = "SELECT * FROM battleuser WHERE ((user1 = "+msg.author.id+" AND sender = 2) OR (user2 = "+msg.author.id+" AND sender = 1)) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		if(rows[0]==undefined){
			msg.channel.send("**"+msg.author.username+"**! You have no pending battles!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			var amount = rows[0].amount;
			var user1 = await global.getUser(rows[0].user1);
			if(user1==undefined){
				msg.channel.send("Could not find that user")
					.then(message => message.delete(3000))
					.catch(err => console.error(err));
				return;
			}
			var user2 = await global.getUser(rows[0].user2);
			if(user2==undefined){
				msg.channel.send("Could not find that user")
					.then(message => message.delete(3000))
					.catch(err => console.error(err));
				return;
			}
			var win1 = rows[0].win1;
			var win2 = rows[0].win2;
			if(global.isInt(args[1]))
				amount = parseInt(args[1]);
			sql = "SELECT money FROM cowoncy WHERE id IN ("+user1.id+","+user2.id+") AND money >= "+amount+";";
			sql += "UPDATE battleuser SET time = '2017-01-01 10:10:10' WHERE (user1 = "+user1.id+" OR user2 = "+user1.id+") AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
			con.query(sql,function(err,rows,fields){
				if(err) throw err;
				if(rows[0].length<2){
					msg.channel.send("Looks like someone doesn't have enough cowoncy!")
						.then(message => message.delete(3000))
						.catch(err => console.error(err));
				}else{
					startBattle(con,msg,user1,user2,amount);
				}
			});
		}
	});
}

//Decline battle
exports.decline= function(con,msg,args){
	var sql = "SELECT * FROM battleuser WHERE (user1 = "+msg.author.id+" OR user2 = "+msg.author.id+" ) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 1;";
	sql += "UPDATE battleuser SET time = '2017-01-01 10:10:10' WHERE (user1 = "+msg.author.id+" OR user2 = "+msg.author.id+" ) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
	con.query(sql,async function(err,rows,fields){
		if(err) throw err;
		if(rows[0][0]==undefined){
			msg.channel.send("**"+msg.author.username+"**! You have no pending battles!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			var opponent;
			if(rows[0][0].user1==msg.author.id)
				opponent = rows[0][0].user2;
			else
				opponent = rows[0][0].user1;
			var opponent = await global.getUser(opponent);
			if(opponent==undefined){
				msg.channel.send("Successfully declined your battle!")
					.then(message => message.delete(3000))
					.catch(err => console.error(err));
				return;
			}

			msg.channel.send("**"+msg.author.username+"**, you have declined your battle against, **"+opponent.username+"**!")
				.catch(err => console.error(err));
		}
	});
}

//Checks if users can battle or not
exports.battle = async function(con,msg,args){
	//Finds opponent
	var opponent = await global.getUser(args[0]);
	if(opponent==undefined){
		msg.channel.send("I could not find that user!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	//Bet amount
	var amount = 0;
	if(global.isInt(args[1]))
		amount = parseInt(args[1]);
	if(amount<0){
		msg.channel.send("It doesnt work like that silly")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}

	//Check if self
	if(opponent.id == msg.author.id){
		msg.channel.send("You can't battle yourself silly")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	//Check for smaller id (for sql)
	var smallerid,largerid,sender;
	if(opponent.id<msg.author.id){
		smallerid = opponent.id;
		largerid = msg.author.id;
		sender = 2;
	}else{
		smallerid = msg.author.id;
		largerid = opponent.id;
		sender = 1;
	}
	var sql = "SELECT * FROM battleuser WHERE (user1 = "+msg.author.id+" OR user2 = "+msg.author.id+") AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
	sql += "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND money >= "+amount+" AND pet = name;";
	sql += "SELECT * FROM battleuser WHERE (user1 = "+opponent.id+" OR user2 = "+opponent.id+") AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
	sql += "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+opponent.id+" AND money >= "+amount+" AND pet = name;";
	con.query(sql,function(err,result){
		if(err) throw err;
		//Already has a pending battle
		if(result[0][0]!=undefined){
			msg.channel.send("**"+msg.author.username+"**! You already have a battle pending!\nDecline it with `owo db`!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else if(result[1][0]==undefined){
			msg.channel.send("**"+msg.author.username+"**! You don't have enough cowoncy!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else if(result[1][0].time <= 15){
			msg.channel.send("**"+msg.author.username+"! You need to wait "+(15-result[0][0].time)+" more seconds!**")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else if(result[2][0]!=undefined){
			msg.channel.send("**"+opponent.username+"** already has a battle pending!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else if(result[3][0]==undefined){
			msg.channel.send("**"+opponent.username+"** doesn't have enough cowoncy!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			sql = "INSERT INTO battleuser (user1,user2,amount,sender) VALUES ("+smallerid+","+largerid+","+amount+","+sender+") ON DUPLICATE KEY UPDATE amount = "+amount+",time = NOW(),sender = "+sender+";";
			con.query(sql,function(err,result2){
				if(err) throw err;
				const embed = {
					"color":4886754,
					"footer": {
						"text": "This invitation ends in 5 minute"
					},
					"author": {
						"name": opponent.username+"! You have been challeneged by "+msg.author.username+"!",
						"icon_url": opponent.avatarURL
					},
					"fields": [{
						"name": msg.author.username,
						"value": "**"+global.unicodeAnimal(result[1][0].name)+" "+result[1][0].nickname+"**\n`Lvl "+result[1][0].lvl+"`\n**`HP`**`: "+result[1][0].hp+"  `\n**`ATT`**`: "+result[1][0].att+"`",
						"inline": true
						},{
						"name": "VS",
						"value": " -",
						"inline": true
						},{
						"name": opponent.username,
						"value": "**"+global.unicodeAnimal(result[3][0].name)+" "+result[3][0].nickname+"**\n`Lvl "+result[3][0].lvl+"`\n**`HP`**`: "+result[3][0].hp+"  `\n**`ATT`**`: "+result[3][0].att+"`",
						"inline": true
						},{
						"name": "The fight requires <:cowoncy:416043450337853441> "+amount+" cowoncy to start!",
						"value": "To accept the battle type `owo acceptbattle` or `owo ab`.\nTo decline the battle type `owo declinebattle` or `owo db`.",
					}]
				};
				msg.channel.send({ embed })
					.catch(err => console.error(err));
			});
		}
	});
}


//Starts a battle against a user
function startBattle(con,msg,user1,user2,amount){
	var sql = "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+user1.id+" AND pet = name;";
	sql += "SELECT * FROM cowoncy NATURAL JOIN animal WHERE id = "+user2.id+" AND pet = name;";
	sql += "UPDATE cowoncy SET money = money - "+amount+",battle = NOW() WHERE id IN ("+user1.id+","+user2.id+");"
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		
		var upet = rows[0][0];
		var opet = rows[1][0];
		if(upet == undefined){
			msg.channel.send("**"+user1.username+"** doesn't have a pet!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
			return;
		}

		if(opet == undefined){
			msg.channel.send("**"+user2.username+"** doesn't have a pet!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
			return;
		}

		var log = [];
		user1 = {
			"user":user1,
			"username":user1.username,
			"name":upet.nickname,
			"animal":upet.name,
			"unicode":global.unicodeAnimal(upet.name),
			"lvl":upet.lvl,
			"attack":upet.att,
			"mhp":upet.hp,
			"hp":upet.hp};
		user2 = {
			"user":user2,
			"username":user2.username,
			"name":opet.nickname,
			"animal":opet.name,
			"unicode":global.unicodeAnimal(opet.name),
			"lvl":opet.lvl,
			"attack":opet.att,
			"mhp":opet.hp,
			"hp":opet.hp};
		for(i = 0;i<3;i++){
			dmg1 = Math.ceil(Math.random()*user1.attack);
			dmg2 = Math.ceil(Math.random()*user2.attack);
			log.push({"dmg1":dmg1,"dmg2":dmg2});
		}

		const embed = {
			"color":4886754,
			"fields": [{
					"name": user1.username,
					"value": "** "+user1.unicode+" "+user1.name+"**\n`Lvl "+user1.lvl+"`\n`████████████████████`\n**`HP`**`: "+user1.hp+"/"+user1.mhp+"`    **`ATT`**`: "+user1.attack+"`",
					"inline": true
				},{
					"name": user2.username,
					"value": "** "+user2.unicode+" "+user2.name+"**\n`Lvl "+user2.lvl+"`\n`████████████████████`\n**`HP`**`: "+user2.hp+"/"+user2.mhp+"`    **`ATT`**`: "+user2.attack+"`",
					"inline": true
				},{
					"name": "Battle (0/3)!",
					"value": "```diff\n+ -----------------------\n- -----------------------\n= ```"
				}]
		};

		var betmsg = "**"+user1.username+"** and **"+user2.username+"** bet <:cowoncy:416043450337853441> "+amount+" to fight!";
		if(amount==0)
			betmsg = "**"+user1.username+"** and **"+user2.username+"** goes into battle!";

		msg.channel.send(betmsg,{embed})
			.then(message => setTimeout(function(){
				display(con,message,user1,user2,log,0,amount,betmsg);
			},1000))
			.catch(err => console.error(err));
	});
}

//Recursion to update battle message
function display(con,msg,user1,user2,log,count,amount,betmsg){
	var win,lose,draw,end = "",winner;
	var color = 4886754;

	//Calculate hp
	user1.hp -= log[count].dmg2;
	user2.hp -= log[count].dmg1;
	if(user1.hp<0)
		user1.hp = 0;
	if(user2.hp<0)
		user2.hp = 0;

	if(user1.hp<=0&&user2.hp<=0){
		winner = 0;
		end = "It's a draw! No one wins!";
		draw = true;
	}else if(user1.hp<=0){
		winner = -1;
		if(amount==0)
			end = user2.user.username+" is superior!";
		else
			end = user2.user.username+" won and won "+(amount*2)+" cowoncy!";
		lose = true;
	}else if(user2.hp<=0){
		winner = 1;
		if(amount==0)
			end = user1.user.username+" is superior!";
		else
			end = user1.user.username+" won and won "+(amount*2)+" cowoncy!";
		win = true;
	}else if(count>=2){
		if(user1.hp>user2.hp){
			winner = 1;
			if(amount==0)
				end = user1.user.username+" is superior!";
			else
				end = user1.user.username+" won and won "+(amount*2)+" cowoncy!";
			win = true;
		}else if(user1.hp<user2.hp){
			winner = -1;
			if(amount==0)
				end = user2.user.username+" is superior!";
			else
				end = user2.user.username+" won and won "+(amount*2)+" cowoncy!";
			lose = true;
		}else{
			winner = 0;
			end = "It's a draw! No one wins!";
			draw = true;
		}
	}

	//Give xp to users
	if(draw||win||lose){
		givemoney(con,winner,amount,user1,user2);
	}


	//Calculate health % for hp bar
	var percent1 = Math.ceil((user1.hp/user1.mhp)*20);
	var percent2 = Math.ceil((user2.hp/user2.mhp)*20);
	
	//Sets up HP bar
	var value1 = "** "+user1.unicode+" "+user1.name+"**\n`Lvl "+user1.lvl+"`\n`";
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
		msg.edit(betmsg,{embed})
	else
		msg.edit(betmsg,{embed})
			.then(message => setTimeout(function(){
			display(con,message,user1,user2,log,count+1,amount,betmsg);
		},1000));
}

//Gives the money
function givemoney(con,winner,amount,user1,user2){
	var amount1 = 0;
	var amount2 = 0;
	if(winner == 1){
		amount1 = amount*2;
	}else if(winner == -1){
		amount2 = amount*2;
	}else{
		amount1 = amount;
		amount2 = amount;
	}
	var sql = "UPDATE cowoncy SET money = money + "+amount1+" WHERE id = "+user1.user.id+";";
	sql += "UPDATE cowoncy SET money = money + "+amount2+" WHERE id = "+user2.user.id+";";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
}
