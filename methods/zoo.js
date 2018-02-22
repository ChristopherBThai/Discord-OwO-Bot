var animals = require('../../tokens/owo-animals.json');

/**
 * Adds an owo point if 10s has passed for each user
 * @param {mysql.Connection}	con - Mysql.createConnection()
 * @param {discord.Message}	msg - Discord's message
 *
 */
exports.catch = function(con,msg){
	var sql = "SELECT money FROM cowoncy";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0].money>animals.rollprice){
			sql = "UPDATE money SET cowoncy = cowoncy - 5;";
			var result = "You got "+randAnimal();
			msg.channel.send(result);
		}else{
			msg.channel.send("**"+msg.author.username+"! You don't have enough cowoncy!**");

		}
	});
}

function randAnimal(){
	var rand = Math.random();
	var result = "";
	if(rand<parseFloat(animals.common[0])){
		rand = Math.ceil(Math.random()*(animals.common.length-1));
		result = "COMMON "+animals.common[rand];
	}else if(rand<parseFloat(animals.uncommon[0])){
		rand = Math.ceil(Math.random()*(animals.uncommon.length-1));
		result = "UNCOMMON "+animals.uncommon[rand];
	}else if(rand<parseFloat(animals.rare[0])){
		rand = Math.ceil(Math.random()*(animals.rare.length-1));
		result = "RARE "+animals.rare[rand];
	}else if(rand<parseFloat(animals.epic[0])){
		rand = Math.ceil(Math.random()*(animals.epic.length-1));
		result = "EPIC "+animals.epic[rand];
	}else{
		rand = Math.ceil(Math.random()*(animals.mythical.length-1));
		result = "MYTHICAL"+animals.mythical[rand];
	}
	return result;
}
	
