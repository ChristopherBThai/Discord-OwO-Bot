const global = require('../../../util/global.js');

//Levels a pet
exports.givexp = function(con,user){
	var pet = global.validAnimal(user.pet)
	if(pet==undefined){
		console.error("Cannot give xp to undefined");
		return;
	}

	//Calculate if there is a level up
	var currentLvl = user.lvl;
	var currentXp = user.xp;
	var gainedXp = user.gxp;
	var neededXp = this.maxxp(currentLvl);
	var levelUp = false;

	//Level up
	if((currentXp+gainedXp)>=neededXp){
		levelUp = {};
		levelUp.att = pet.attr;
		levelUp.hp = pet.hpr;
		levelUp.xp = ((currentXp+gainedXp)-neededXp);
	}

	//Compile sql
	var sql = "UPDATE animal SET ";
	if(levelUp){
		sql += "lvl = lvl + 1,xp = "+levelUp.xp+",att = att + "+levelUp.att+",hp = hp + "+levelUp.hp+" ";
	}else{
		sql += "xp = xp + "+gainedXp+" ";
	}
	if(user.result){
		sql += ","+user.result+" = "+user.result+" + 1 ";
		if(user.result=="won")
			sql += ", streak = streak + 1 ";
		else if(user.result=="lost")
			sql += ", streak = 0 ";
	}
	sql += "WHERE id = "+user.id+" AND name = '"+user.pet+"';";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
	return levelUp;
}

//Gets xp needed for that lvl
exports.maxxp = function(lvl){
	return 25*lvl*lvl*Math.trunc((lvl+10)/10);
}
