//Lottery!

const global = require('./global.js');
var con;

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
			count += users[i].amount;
			var chance = (users[i].amount/sum)*100;
			if(chance>=.01)
				chance = Math.trunc(chance*100)/100;
			if(rand<count&&!found){ //Winner
				found = true;
				sql = "INSERT INTO cowoncy (id,money) VALUES ("+id+","+prize+") ON DUPLICATE KEY UPDATE money = money + "+prize+";";
				sql += "UPDATE lottery SET valid = 0,amount = 0 WHERE valid = 1";

				var channel = client.channels.get(users[i].channel);
				winner = id;
				winnerchance = chance
				con.query(sql,function(err,result){
					if(err) throw err;
					if(channel!=undefined)
						channel.send("Congrats! **"+winner+"** won **"+prize+" cowoncy** from the lottery with a **"+winnerchance+"%** chance to win!");
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

		msgUsers(winner,chance,prize,loser,loserchance);

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

function msgUsers(winner,chance,prize,loser,loserchance){

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
	con = global.con();
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
