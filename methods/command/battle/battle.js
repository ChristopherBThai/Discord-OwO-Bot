const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const food = require('../shop/food.js');
const dot = "<:dot:446129270688055303>";
const petutil = require('./petutil.js');
const battleutil = require('./battleutil.js');

module.exports = new CommandInterface({
	
	alias:["battle","fight"],

	args:"{@user} {bet}",

	desc:"Use your pets to fight against other players! As you fight, your pet will become stronger! You can only add pets from your current zoo.",

	example:["owo battle","owo battle @scuttler 100"],

	related:["owo zoo","owo pet"],

	cooldown:15000,
	half:80,
	six:500,

	execute: function(p){
		if(true){
			var sql = "SELECT money FROM cowoncy WHERE id = "+p.msg.author.id+";";
			p.con.query(sql,function(err,result){
				if(err){console.error(err);return;}
				if(result[0]==undefined||result[0].money<5)
					send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
				else
					fight(p.con,p.msg,p.send);
			});
		}else
			fightUser();
	}

})

function fight(con,msg,send){
	var sql = "SELECT id,money,nickname,name,lvl,att,hp,lvl,streak,xp, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three "+
		"FROM (cowoncy NATURAL JOIN animal) LEFT JOIN (animal_food NATURAL JOIN food) "+
		"ON animal.pid = animal_food.pid "+
		"WHERE id = "+msg.author.id+" AND pet = name GROUP BY animal.pid;";
	sql += "SET @rand = (CEIL(RAND()*(SELECT COUNT(*) FROM animal WHERE ispet = 1 AND id != "+msg.author.id+")));"+
		"SELECT id,nickname,name,lvl,att,hp,lvl,streak,xp, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three "+
		"FROM ("+
			"SELECT * FROM (SELECT animal.*,@rownum := @rownum + 1 AS rank FROM animal ,(SELECT @rownum := 0) r WHERE ispet = 1 AND id != "+msg.author.id+") d WHERE rank <= @rand ORDER BY rank DESC LIMIT 1"+
		") as opponent "+
		"LEFT JOIN (animal_food NATURAL JOIN food) ON opponent.pid = animal_food.pid "+
		"GROUP BY opponent.pid;";
	sql += "SELECT young FROM guild WHERE id = "+msg.guild.id+";";
	sql += "UPDATE cowoncy SET money = money - 5 WHERE id = "+msg.author.id+";";

	con.query(sql,async function(err,rows,fields){
		if(err){ console.error(err);return;}

		//Check if guild is kid friendly 
		var censor = (rows[3][0]!=undefined && rows[3][0].young)

		//Grab pet info
		var upet = extractInfo(rows[0][0],msg.author,censor);
		var opet = extractInfo(rows[2][0],await global.getUser(rows[2][0].id),censor);

		//Check if pets are valid
		if(upet == undefined){
			send("**🚫 | "+msg.author.username+"**, You don't have a pet! Set one with `owo pets add [animal] [nickname]`");
			return;
		}
		if(opet == undefined){
			send("**🚫 | "+msg.author.username+"**, Something went wrong...");
			return;
		}

		var battleInfo = {count:0,color:4886754,line1:"",line2:"",line3:"",line4:""};
		var display = battleutil.createDisplay(upet,opet,battleInfo);
		send("**"+msg.author.username+"** spent <:cowoncy:416043450337853441> 5 to fight!",false,display);

	});
}

function fightUser(){

}

function extractInfo(pet,owner,censor){
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
		"name":pet.nickname,
		"animal":pet.name,
		"unicode":global.unicodeAnimal(pet.name),
		"lvl":pet.lvl,
		"att":pet.att+bonusAtt,
		"mhp":pet.hp+bonusHp,
		"hp":pet.hp+bonusHp,
		"xp":pet.xp,
		"mxp":petutil.maxxp(pet.lvl),
		"streak":pet.streak,
		"fdisplay":fdisplay
	};
	
	if(user.name==null)
		user.name = "Person";
	
	return user;
}
