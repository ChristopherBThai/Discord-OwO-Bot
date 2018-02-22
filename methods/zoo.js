var animals = require('../../tokens/owo-animals.json');

exports.display = function(con,msg){
	var sql = "SELECT name,count FROM animal WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		var text = "";
		for (i in result){
			text += "\n"+result[i].count + " : " + result[i].name;
		}
		msg.channel.send(text);
	});
}


/**
 * Catches an animal
 * @param {mysql.Connection}	con - Mysql.createConnection()
 * @param {discord.Message}	msg - Discord's message
 *
 */
exports.catch = function(con,msg){
	var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0].money>animals.rollprice){
			var animal = randAnimal();
			sql = "INSERT INTO animal (id,name,count) VALUES ("+msg.author.id+",'"+animal[1]+"',1) ON DUPLICATE KEY UPDATE count = count + 1;"+
				"UPDATE cowoncy SET money = money - 5;";
			con.query(sql,function(err,result){
				if(err) throw err;
				msg.channel.send("You got "+animal[0]+" "+animal[1]);
			});
		}else{
			msg.channel.send("**"+msg.author.username+"! You don't have enough cowoncy!**");
		}
	});
}

function randAnimal(){
	var rand = Math.random();
	var result = [];
	if(rand<parseFloat(animals.common[0])){
		rand = Math.ceil(Math.random()*(animals.common.length-1));
		result.push("COMMON");
		result.push(animals.common[rand]);
	}else if(rand<parseFloat(animals.uncommon[0])){
		rand = Math.ceil(Math.random()*(animals.uncommon.length-1));
		result.push("UNCOMMON");
		result.push(animals.uncommon[rand]);
	}else if(rand<parseFloat(animals.rare[0])){
		rand = Math.ceil(Math.random()*(animals.rare.length-1));
		result.push("RARE");
		result.push(animals.rare[rand]);
	}else if(rand<parseFloat(animals.epic[0])){
		rand = Math.ceil(Math.random()*(animals.epic.length-1));
		result.push("EPIC");
		result.push(animals.epic[rand]);
	}else{
		rand = Math.ceil(Math.random()*(animals.mythical.length-1));
		result.push("MYTHICAL");
		result.push(animals.mythical[rand]);
	}
	return result;
}
	
