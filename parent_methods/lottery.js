//Lottery!

const global = require('./global.js');
const logger = require('../util/logger.js');
var con;

/**
 * Picks the winner of the lottery
 */
function pickWinner(){
	console.log("Starting lottery...");
	var sql = "SELECT id,amount,channel FROM lottery WHERE valid = 1;"+
		"SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;";
	con.query(sql,async function(err,result){
		if(err) throw err;
		var sum = parseInt(result[1][0].sum);
		var prize = sum + 500;
		var users = result[0];
		var rand = Math.floor(Math.random()*sum);
		var count = 0;
		var found = false;
		var winner;
		var winnerchance;
		var winnerChannel;
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
				var winnerChannel = users[i].channel;
				winner = id;
				winnerchance = chance

				sql = "INSERT INTO cowoncy (id,money) VALUES ("+id+","+prize+") ON DUPLICATE KEY UPDATE money = money + "+prize+";";
				sql += "UPDATE lottery SET valid = 0,amount = 0 WHERE valid = 1";
				con.query(sql,function(err,result){
					if(err) console.log(err);
					logger.value('cowoncy',prize,['command:lottery','id:'+id]);
				});
			} else {
				loser.push(id);
				loserchance.push(chance);
			}
		}

		var winnername = await global.getUsername(winner);
		msgUsers(winnername,winner,winnerchance,winnerChannel,prize,loser,loserchance,-1);
	});
	setTime();
}

function msgUsers(winnername,winner,chance,winnerChannel,prize,loser,loserchance,i){
	if(i>=loser.length)
		return;
	if(i<0){
		global.msgUser(winner,"Congrats! You won **"+prize+" cowoncy** from the lottery with a **"+chance+"%** chance to win!");
		global.msgChannel(winnerChannel,"Congrats <@"+winner+">! You won **"+prize+"** cowoncy from the lottery with a **"+chance+"%** chance to win!");
		console.log("\x1b[36m%s\x1b[0m","    "+winnername+" won the lottery");
	}else{
		var text = "You lost the lottery...\nYou had a **"+loserchance[i]+"%** chance to win **"+prize+" cowoncy...**";
		if(winnername!=undefined)
			text += "\nThe winner was **"+winnername+"** with a **"+chance+"%** chance to win!";
		global.msgUser(loser[i],text);
		console.log("\x1b[36m%s\x1b[0m","    msg sent to "+loser[i]+" for losing");
	}
	setTimeout(function(){msgUsers(winnername,winner,chance,winnerChannel,prize,loser,loserchance,i+1)},1000);
}


/*
 * Initializes lottery
 */
exports.init = function(){
	setTime();
}

function setTime(){
	var now = new Date();
	var mill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0) - now;
	if (mill < 0) {
		     mill += 86400000;
	}
	con = global.con();
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
