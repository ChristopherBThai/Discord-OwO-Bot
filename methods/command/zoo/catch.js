const CommandInterface = require('../../commandinterface.js');

var animals = require('../../../../tokens/owo-animals.json');
var global = require('../../../util/global.js');
var pet = require('../battle/petutil.js');
const gemUtil = require('./gemUtil.js');
const animalUtil = require('./animalUtil.js');
const lootboxChance = 0.05;

module.exports = new CommandInterface({

	alias:["hunt","h","catch"],

	args:"",

	desc:"Hunt for some animals for your zoo!\nHigher ranks are harder to find!",

	example:[],

	related:["owo zoo","owo sell","owo lootbox"],

	cooldown:15000,
	half:80,
	six:500,
	bot:true,

	execute: function(p){
		var msg=p.msg,con=p.con;
		var sql = "SELECT money,patreonAnimal FROM cowoncy LEFT JOIN user ON cowoncy.id = user.id WHERE cowoncy.id = "+msg.author.id+";";
		sql += "SELECT name,nickname,lvl,xp FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
		sql += "SELECT * FROM lootbox WHERE id = "+msg.author.id+" AND TIMESTAMPDIFF(HOUR,NOW(),claim)<24 AND claimcount >=3;";
		sql += "SELECT uid,activecount,gname,type FROM user NATURAL JOIN user_gem NATURAL JOIN gem WHERE id = "+msg.author.id+" AND activecount > 0;";
		con.query(sql,function(err,result){
			if(err) {console.error(err);return;}
			if(result[0][0]==undefined||result[0][0].money<animals.rollprice){
				p.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
			}else{
				//Sort gem benefits
				var multiGem = undefined;
				var patreonGem = undefined;
				for(var i=0;i<result[3].length;i++){
					if(result[3][i].type=="multi")
						multiGem = result[3][i];
					else if(result[3][i].type=="patreon")
						patreonGem = result[3][i];
				}

				//Get animal
				var animal = getAnimals(p,result,multiGem,patreonGem);
				var sql = animal.sql;
				var text = animal.text;

				//Get Xp
				if(result[1][0]){
					var lvlup = pet.givexp(con,{id:msg.author.id, pet:result[1][0].name, lvl:result[1][0].lvl, xp:result[1][0].xp, gxp:animal.xp});
					text += "\n**"+global.unicodeAnimal(result[1][0].name)+" |** "+((result[1][0].nickname==null)?"Your pet":"**"+result[1][0].nickname+"**")+" gained **"+animal.xp+" xp**";
					if(lvlup) text += " and leveled up";
					text += "!";
				}

				//Get Lootbox
				if(!result[2][0]){
					var lootbox = getLootbox(p);
					sql += lootbox.sql;
					text += lootbox.text;
				}

				con.query(sql,function(err,result2){
					if(err) throw err;
					p.logger.value('cowoncy',-5,['command:hunt','id:'+msg.author.id]);
					p.send(text);
				});
			}
		});
	}
})

function getAnimals(p,result,mGem,pGem){
	var patreon = (result[0][0].patreonAnimal==1);
	if(!patreon)
		if(pGem) patreon = true;
	if(mGem)
		var gem = gemUtil.getGem(mGem.gname);
	if(!gem){
		var animal = [animalUtil.randAnimal(patreon)];
	}else{
		var animal = [];
		for(var i=0;i<gem.amount;i++)
			animal.push(animalUtil.randAnimal(patreon));
	}
	var sql = "";
	var xp = 0;
	for(var i=0;i<animal.length;i++){
		var type = animal[i][2];
		xp += animal[i][3];
		sql += "INSERT INTO animal (id,name,count,totalcount) VALUES ("+p.msg.author.id+",'"+animal[i][1]+"',1,1) ON DUPLICATE KEY UPDATE count = count + 1,totalcount = totalcount + 1;";
		sql += "INSERT INTO animal_count (id,"+type+") VALUES ("+p.msg.author.id+",1) ON DUPLICATE KEY UPDATE "+type+" = "+type+"+1;";
	}
	sql += "UPDATE cowoncy SET money = money - 5 WHERE id = "+p.msg.author.id+";";
	if(result[0][0].patreonAnimal==0&&pGem)
		sql += "UPDATE user_gem SET activecount = activecount - "+animal.length+" WHERE uid = "+pGem.uid+" AND gname = '"+pGem.gname+"';";
	if(mGem)
		sql += "UPDATE user_gem SET activecount = activecount - 1 WHERE uid = "+mGem.uid+" AND gname = '"+mGem.gname+"';";
	var text = "**🌱 | "+p.msg.author.username+"** caught a(n) "+animal[0][0]+" "+global.unicodeAnimal(animal[0][1])+"!"
	if(mGem||pGem){
		text = "**🌱 | "+p.msg.author.username+"**, hunt is empowered by ";
		if(gem)
			text += gem.emoji+"`["+(mGem.activecount-1)+"/"+gem.length+"]`";
		if(pGem&&(gem2 = gemUtil.getGem(pGem.gname)))
			text += gem2.emoji+"`["+(pGem.activecount-animal.length)+"/"+gem2.length+"]`";
		text += " !\n**<:blank:427371936482328596> |** You found: "+global.unicodeAnimal(animal[0][1]); 
		for(var i=1;i<animal.length;i++) text += " "+global.unicodeAnimal(animal[i][1]);
	}
	return {"sql":sql,"xp":xp,"animal":animal,"text":text};
}

function getLootbox(p){
	var rand = Math.random();
	if(rand <= lootboxChance){
		return {
			"sql":"INSERT INTO lootbox (id,boxcount,claimcount,claim) VALUES ("+p.msg.author.id+",1,1,NOW()) ON DUPLICATE KEY UPDATE boxcount = boxcount + 1, claimcount = IF(TIMESTAMPDIFF(HOUR,NOW(),claim)<24,claimcount+1,1), claim = IF(TIMESTAMPDIFF(HOUR,NOW(),claim)<24,claim,NOW());",
			"text":"\n**<:box:427352600476647425> |** You found a **lootbox**!"
		};
	}else return {"sql":"","text":""};
}
