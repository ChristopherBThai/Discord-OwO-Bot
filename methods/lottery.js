//Lottery!

const global = require('./global.js');

var con;
var client;

/**
 * Bet in the lottery
 */
exports.bet = function(con,msg,args){
	var amount = 0;
	var all = false;
	if(args.length==1&&global.isInt(args[0]))
		amount = parseInt(args[0]);
	else if(args.length==1&&args[0]=='all'){
		all = true;
	}else{
		msg.channel.send("wrong arguments! >:c");
		return;
	}
	
	if(amount == 0&&!all){
		msg.channel.send("You bet... nothing?");
		return;
	}else if(amount < 0&&!all){
		msg.channel.send("Do you understand how lotteries work?");
		return;
	}

	var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0]==undefined||result[0].money<amount||result[0]==0){
			msg.channel.send("**"+msg.author.username+"! You don't have enough cowoncy!**")
				.then(message => message.delete(3000));
		}else{
			if(all)
				amount = parseInt(result[0].money);
			var sql = "INSERT INTO lottery (id,channel,amount,valid) VALUES ("+msg.author.id+","+msg.channel.id+","+amount+",1) ON DUPLICATE KEY UPDATE amount = amount +"+amount+", valid = 1, channel = "+msg.channel.id+";"+
				"SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;"+
				"SELECT * FROM lottery WHERE id = "+msg.author.id+";"+
				"UPDATE cowoncy SET money = money - "+amount+" WHERE id = "+msg.author.id+";";
			con.query(sql,function(err,result){
				if(err) throw err;

				var sum = parseInt(result[1][0].sum);
				var count = result[1][0].count;
				var bet = parseInt(result[2][0].amount);
				var chance = (bet/sum)*100;
				if(chance>=.01)
					chance = Math.trunc(chance*100)/100

				const embed = {
					  "description": "Lottery ends every day at 12AM PST! Good Luck!!",
					  "color": 4886754,
					  "timestamp": new Date(),
					  "footer": {
						      "icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png",
						      "text": "*Percentage and jackpot may change over time"
						    },
					  "author": {
						      "name": msg.author.username+"'s Lottery Submission",
						    },
					  "fields": [
						      {
							            "name": "You added",
							            "value": "```fix\n"+amount+" Cowoncy```",
							            "inline": true
							          },
						      {
							            "name": "Your Total Submission",
							            "value": "```fix\n"+bet+" Cowoncy```",
							            "inline": true
							          },
						      {
							            "name": "Winning Chance",
							            "value": "```fix\n"+chance+"%```",
							            "inline": true
							          },
						      {
							            "name": "Current Jackpot",
							            "value": "```fix\n"+(sum+500)+" Cowoncy```",
							            "inline": true
							          },
						      {
							            "name": "Ends in",
							            "value": "```fix\n"+getTimeLeft()+"```",
							            "inline": true
							          }
						    ]
				};
				msg.channel.send({ embed });
			});
		}
	});
}

/**
 * Displays the lottery
 */
exports.display = function(con,msg){
	var sql = "SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;"+
		"SELECT * FROM lottery WHERE id = "+msg.author.id+" AND valid = 1;";
	con.query(sql,function(err,result){
		if(err) throw err;
		var sum= 0;
		var count = 0;
		if(result[0][0].sum!=undefined){
			sum= parseInt(result[0][0].sum);
			count = result[0][0].count;
		}

		var bet = 0;
		var chance = 0;
		if(result[1][0]!=undefined){
			bet = result[1][0].amount;
			if(sum!=0){
				chance = (bet/sum)*100;
				if(chance>=.01)
					chance = Math.trunc(chance*100)/100
			}else
				chance = 100;
		}

		const embed = {
				"description": "Lottery ends every day at 12AM PST! Good Luck!!",
				"color": 4886754,
				"timestamp": new Date(),
				"footer": {
					"icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png",
					"text": "*Percentage and jackpot may change over time"
					},
				"author": {
					"name": msg.author.username+"'s Lottery Status",
					},
				"fields": [
					{
							"name": "Your Total Submission",
							"value": "```fix\n"+bet+" Cowoncy```",
							"inline": true
							},
					{
							"name": "Winning Chance",
							"value": "```fix\n"+chance+"%```",
							"inline": true
							},
					{
							"name": "Number of Risk Takers",
							"value": "```fix\n"+count+" users```",
							"inline": true
							},

					{
							"name": "Current Jackpot",
							"value": "```fix\n"+(sum+500)+" Cowoncy```",
							"inline": true
							},
					{
							"name": "Ends in",
							"value": "```fix\n"+getTimeLeft()+"```",
							"inline": true
							}
					]
		};
		msg.channel.send({ embed });
	});
}

/**
 * Picks the winner of the lottery
 */
function pickWinner(){
	console.log("Starting lottery...");
	var sql = "SELECT id,amount,channel FROM lottery WHERE valid = 1;"+
		"SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;";
	con.query(sql,function(err,result){
		if(err) throw err;
		var sum = parseInt(result[1][0].sum);
		var prize = sum + 500;
		var users = result[0];
		var rand = Math.floor(Math.random()*sum);
		var count = 0;
		var found = false;
		var winner;
		var winnerchance;
		var loser = [];
		var loserchance = [];
		for (i in users){
			var id = users[i].id;
			var user = client.users.get(id);
			count += users[i].amount;
			var chance = (users[i].amount/sum)*100;
			if(chance>=.01)
				chance = Math.trunc(chance*100)/100;
			if(rand<count&&!found){ //Winner
				found = true;
				sql = "INSERT INTO cowoncy (id,money) VALUES ("+id+","+prize+") ON DUPLICATE KEY UPDATE money = money + "+prize+";";
				sql += "UPDATE lottery SET valid = 0,amount = 0 WHERE valid = 1";

				var channel = client.channels.get(users[i].channel);
				winner = user;
				winnerchance = chance
				con.query(sql,function(err,result){
					if(err) throw err;
					if(channel!=undefined)
						channel.send("Congrats! **"+winner+"** won **"+prize+" cowoncy** from the lottery!\nHe had a **"+winnerchance+"%** chance to win!");
					if(winner!=undefined){
						winner.send("Congrats! You won **"+prize+" cowoncy** from the lottery with a **"+winnerchance+"%** chance to win!");
						console.log("\x1b[36m%s\x1b[0m","    "+winner.username+" won the lottery");
					}
					console.log("\x1b[36m%s\x1b[0m","    "+winner+" won the lottery");
				});
			} else if(found) { //Loser
				if(user!=undefined){
					var text = "You lost the lottery...\nYou had a **"+chance+"%** chance to win **"+prize+" cowoncy...**";
					if(winner!=undefined)
						text += "\nThe winner was **"+winner.username+"** with a **"+winnerchance+"%** chance to win!";
					user.send(text);
					console.log("\x1b[36m%s\x1b[0m","    msg sent to "+user.username+" for losing");
				}
			} else {
				if(user!=undefined){
					loser.push(user);
					loserchance.push(chance);
				}
			}
		}

		for(i in loser){
			var user = loser[i];
			var chance = loserchance[i];
			if(user!=undefined){
				var text = "You lost the lottery...\nYou had a **"+chance+"%** chance to win **"+prize+" cowoncy...**";
				if(winner!=undefined)
					text += "\nThe winner was **"+winner.username+"** with a **"+winnerchance+"%** chance to win!";
				user.send(text);
				console.log("\x1b[36m%s\x1b[0m","    msg sent to "+user.username+" for losing");
			}
		}
		init();
	});
}

var initi = false;
exports.con= function(tcon){
	con = tcon;
	if(client!=undefined&&!initi)
		init();
}

exports.client= function(tclient){
	client = tclient;
	if(con!=undefined&&!initi)
		init();
}

/*
 * Initializes lottery
 */
function init(){
	initi = true;
	var now = new Date();
	var mill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0) - now;
	if (mill < 0) {
		     mill += 86400000;
	}
	var timer = setTimeout(pickWinner,mill);
}

/**
 * Time left in the lottery
 */
function getTimeLeft(){
	var now = new Date();
	var mill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0) - now;
	if (mill < 0) {
		mill += 86400000;
	}
	mill=Math.trunc(mill/1000);
	var sec = mill%60;
	mill=Math.trunc(mill/60);
	var min = mill%60;
	mill=Math.trunc(mill/60);
	var hour = mill%60;
	return hour+"h "+min+"m "+sec+"s";
}
