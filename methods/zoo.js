var animals = require('../../tokens/owo-animals.json');

var display = "";
initDisplay();

exports.display = function(con,msg){
	var sql = "SELECT name,count FROM animal WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		var text = ":seedling: :herb: :deciduous_tree:** "+msg.author.username+"'s zoo! **:deciduous_tree: :herb: :seedling:\n";
		text += display;
		for (i in result){
			text = text.replace("~"+result[i].name,result[i].name+toSmallNum(result[i].count));
		}
		text = text.replace(/~:[a-zA-Z_0-9]+:/g,animals.question);
		text += "\n*zoo is still a work in progress*";
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
	var sql = "SELECT money,TIMESTAMPDIFF(SECOND,catch,NOW()) AS time FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0]==undefined||result[0].money<animals.rollprice){
			msg.channel.send("**"+msg.author.username+"! You don't have enough cowoncy!**");
		}else if(result[0].time <= 20){
			msg.channel.send("**"+msg.author.username+"! You need to wait "+(20-result[0].time)+" more seconds!**");
		}else{
			var animal = randAnimal();
			var type = animal[2];
			var bonus = animal[3];
			sql = "INSERT INTO animal (id,name,count) VALUES ("+msg.author.id+",'"+animal[1]+"',1) ON DUPLICATE KEY UPDATE count = count + 1;"+
				"UPDATE cowoncy SET money = money - 5,catch = NOW() WHERE id = "+msg.author.id+";"+
				"INSERT INTO animal_count (id,"+type+") VALUES ("+msg.author.id+",1) ON DUPLICATE KEY UPDATE "+type+" = "+type+"+1;";
			con.query(sql,function(err,result){
				if(err) throw err;
				msg.channel.send("You spent <:cowoncy:416043450337853441> 5! And you found a "+animal[0]+" "+animal[1]);
				console.log("	Found: "+animal[0]+" "+animal[1]);
			});
		}
	});
}

function randAnimal(){
	var rand = Math.random();
	var result = [];
	    
	if(rand<parseFloat(animals.common[0])){
		rand = Math.ceil(Math.random()*(animals.common.length-1));
		result.push(animals.ranks.common+" *(common)*");
		result.push(animals.common[rand]);
		result.push("common");
		result.push("25");
	}else if(rand<parseFloat(animals.uncommon[0])){
		rand = Math.ceil(Math.random()*(animals.uncommon.length-1));
		result.push(animals.ranks.uncommon+" *(uncommon)*");
		result.push(animals.uncommon[rand]);
		result.push("uncommon");
		result.push("50");
	}else if(rand<parseFloat(animals.rare[0])){
		rand = Math.ceil(Math.random()*(animals.rare.length-1));
		result.push(animals.ranks.rare+" *(rare)*");
		result.push(animals.rare[rand]);
		result.push("rare");
		result.push("100");
	}else if(rand<parseFloat(animals.epic[0])){
		rand = Math.ceil(Math.random()*(animals.epic.length-1));
		result.push(animals.ranks.epic+" *(epic)*");
		result.push(animals.epic[rand]);
		result.push("epic");
		result.push("250");
	}else{
		rand = Math.ceil(Math.random()*(animals.mythical.length-1));
		result.push(animals.ranks.mythical+" *(mythic)*");
		result.push(animals.mythical[rand]);
		result.push("mythical");
		result.push("500");
	}
	return result;
}
	
function toSmallNum(num){
	var result = "";
	if(num>=99){
		result += animals.numbers[9];
		result += result;
	}else{
		var digit1 = num%10;
		var digit2 = Math.trunc(num/10);
		result += animals.numbers[digit2];
		result += animals.numbers[digit1];
	}
	return result;
}

function initDisplay(){
	var gap = "  ";
	display = animals.ranks.common+"   ";
	for (i=1;i<animals.common.length;i++)
		display += "~"+animals.common[i]+gap;
	display += "\n"+animals.ranks.uncommon+"   ";
	for (i=1;i<animals.uncommon.length;i++)
		display += "~"+animals.uncommon[i]+gap;
	display += "\n"+animals.ranks.rare+"   ";
	for (i=1;i<animals.rare.length;i++)
		display += "~"+animals.rare[i]+gap;
	display += "\n"+animals.ranks.epic+"   ";
	for (i=1;i<animals.epic.length;i++)
		display += "~"+animals.epic[i]+gap;
	display += "\n"+animals.ranks.mythical+"   ";
	for (i=1;i<animals.mythical.length;i++)
		display += "~"+animals.mythical[i]+gap;
}
