const global = require('../../../util/global.js');
const food = require('../shop/food.js');
const dot = "<:dot:446129270688055303>";
const petUtil = require('./petutil.js');

exports.createDisplay= function(user1,user2,battleInfo){
	var percent1 = Math.ceil((user1.hp/user1.mhp)*20);
	var percent2 = Math.ceil((user2.hp/user2.mhp)*20);
	
	//Sets up HP bar
	var value1 = "** "+user1.unicode+" "+user1.name+"**\n`Lvl "+user1.lvl+"` "+user1.fdisplay+"\n`";
	var value2 = "** "+user2.unicode+" "+user2.name+"**\n`Lvl "+user2.lvl+"` "+user2.fdisplay+"\n`";
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
	value1 += "`\n**`HP`**`: "+user1.hp+"/"+user1.mhp+"`    **`ATT`**`: "+user1.att+"`";
	value2 += "`\n**`HP`**`: "+user2.hp+"/"+user2.mhp+"`    **`ATT`**`: "+user2.att+"`";

	//Battle 
	var title = "Battle ("+battleInfo.count+"/3)!";
	var actions = "```diff\n+ "+battleInfo.line1+"\n- "+battleInfo.line2+"\n= "+battleInfo.line3+"\n= "+battleInfo.line4+"```";

	const embed = {
		  "color": battleInfo.color,
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
	return {embed};
}
exports.battleTurn = function(user1,user2,battleInfo){
	if(user1.hp<=0||user2.hp<=0||battleInfo.count>=3)
		return undefined;
	
	battleInfo.count++;

	//Calculate damage
	var dmg1 = Math.ceil(Math.random()*user1.att);
	var dmg2 = Math.ceil(Math.random()*user2.att);
	user1.hp -= dmg2;
	user2.hp -= dmg1;
	if(user1.hp<0) user1.hp = 0;
	if(user2.hp<0) user2.hp = 0;
	battleInfo.line1 = user1.name+" hits "+user2.name+" for "+dmg1+"hp!";
	battleInfo.line2 = user2.name+" hits "+user1.name+" for "+dmg2+"hp!";

	var result = undefined;
	if(user1.hp<=0&&user2.hp<=0){
		result = "draw";
		battleInfo.line3 = "It's a draw!";
		battleInfo.color = 6381923;
	}else if(user1.hp<=0){
		result = "lost";
		battleInfo.line3 = user2.name+" wins!";
		battleInfo.color = 16711680;
	}else if(user2.hp<=0){
		result = "won";
		battleInfo.line3 = user1.name+" wins!";
		battleInfo.color = 65280;
	}else if(battleInfo.count==3){
		result = "draw";
		battleInfo.line3 = "It's a draw!";
		battleInfo.color = 6381923;
	}

	return result;
}

exports.extractInfo = function(pet,owner,censor){
	if(pet==undefined)
		return undefined;
	
	if(censor&&pet.offensive)
		pet.nickname = "Potty Mouth";

	//get food
	one = food.getFoodJson(pet.one);
	two = food.getFoodJson(pet.two);
	three = food.getFoodJson(pet.three);
	var fdisplay = "";
	var bonusAtt= 0;
	var bonusHp = 0;
	if(one){ 
		fdisplay += one.key;
		bonusAtt += one.att;
		bonusHp += one.hp;
	}else fdisplay += dot;
	if(two){
		fdisplay += two.key;
		bonusAtt += two.att;
		bonusHp += two.hp;
	}else fdisplay += dot;
	if(three){
		fdisplay += three.key;
		bonusAtt += three.att;
		bonusHp += three.hp;
	}else fdisplay += dot;

	var user = {
		"username":owner.username,
		"id":owner.id,
		"name":pet.nickname,
		"animal":pet.name,
		"unicode":global.unicodeAnimal(pet.name),
		"lvl":pet.lvl,
		"att":pet.att+bonusAtt,
		"mhp":pet.hp+bonusHp,
		"hp":pet.hp+bonusHp,
		"xp":pet.xp,
		"mxp":petUtil.maxxp(pet.lvl),
		"streak":pet.streak,
		"fdisplay":fdisplay
	};
	
	if(user.name==null)
		user.name = "Person";
	
	return user;
}
