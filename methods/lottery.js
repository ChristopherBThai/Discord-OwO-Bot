//Lottery!
var con;
var client;

exports.bet = function(con,msg,args){
	var amount = 0;
	var all = false;
	if(args.length==1&&isInt(args[0]))
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
			var sql = "INSERT INTO lottery (id,channel,amount,valid) VALUES ("+msg.author.id+","+msg.channel.id+","+amount+",1) ON DUPLICATE KEY UPDATE amount = amount +"+amount+", valid = 1;"+
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

				var text = "**"+msg.author.username+"**! You bet a total of **"+bet+"** cowoncy!\n";
				text += "You have a **"+chance+"%** chance of winning **"+(sum+500)+"** cowoncy!\n";
				text += "Good luck! *Your percentage and jackpat will change*";
				msg.channel.send(text);
			});
		}
	});
}

exports.display = function(con,msg){
	var sql = "SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;"+
		"SELECT * FROM lottery WHERE id = "+msg.author.id+";";
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

		var text = "**"+msg.author.username+"** has bet **"+bet+"** cowoncy and has a **"+chance+"%** to win!\n"+
			"Current Jackpot: **"+(sum+500)+
			"**\nNumber of risk takers: **"+count+"**"+
			"\nEnds in: **"+hour+"H "+min+"M "+sec+"S**";
		msg.channel.send(text);
	});
}

function pickWinner(){
	var sql = "SELECT id,amount,channel FROM lottery WHERE valid = 1;"+
		"SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;"+
		"DELETE FROM lottery;";
	con.query(sql,function(err,result){
		if(err) throw err;
		var sum = parseInt(result[1][0].sum);
		var prize = sum + 500;
		var users = result[0];
		var rand = Math.floor(Math.random()*sum);
		var count = 0;
		var found = false;
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
				con.query(sql,function(err,result){
					if(err) throw err;
					var channel = client.channels.get(users[i].channel);
					if(channel!=undefined)
						channel.send("Congrats! **"+user+"** won **"+prize+" cowoncy** from the lottery!\nHe had a **"+chance+"%** chance to win!");
					if(user!=undefined)
						user.send("Congrats! You won **"+prize+" cowoncy** from the lottery with a **"+chance+"%** chance to win!");
					console.log("\x1b[36m%s\x1b[0m","    "+user.username+" won the lottery");
				});
			} else { //Loser
				if(user!=undefined)
					user.send("You lost the lottery...\nYou had a **"+chance+"%** chance to win **"+prize+" cowoncy...**");
			}
		}
	});
}

/**
 * Checks if its an integer
 * @param {string}	value - value to check if integer
 *
 */
function isInt(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}

var initi = false;
exports.con= function(tcon){
	con = tcon;
	if(client!=undefined)
		init();
}

exports.client= function(tclient){
	client = tclient;
	if(con!=undefined)
		init();
}

function init(){
	if(initi)
		return;
	initi = true;
	var now = new Date();
	var mill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0) - now;
	if (mill < 0) {
		     mill += 86400000;
	}
	var timer = setTimeout(pickWinner,mill);
}

exports.pickWinnerTest = function(){
	pickWinner();
}
