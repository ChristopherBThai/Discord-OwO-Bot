/**
 * Zoo!
 */

const global = require('./global');

var animals = require('../../tokens/owo-animals.json');
var unicode = {};

var secret = "";
var secret2 = "";
var display = "";
initDisplay();

/**
 * Displays your zoo
 */
exports.display = function(con,msg){
	var sql = "SELECT TIMESTAMPDIFF(SECOND,zoo,NOW()) AS time FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0]!=undefined&&result[0].time<=45){
			msg.channel.send("**"+msg.author.username+"! You need to wait "+(45-result[0].time)+" more seconds!**")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			var sql = "SELECT * FROM animal WHERE id = "+msg.author.id+";"+
				"SELECT common,uncommon,rare,epic,mythical,legendary,MAX(count) AS biggest FROM animal NATURAL JOIN animal_count WHERE id = "+msg.author.id+" GROUP BY id;"+
				"UPDATE IGNORE cowoncy SET zoo = NOW() WHERE id = "+msg.author.id+";";
			con.query(sql,function(err,result){
				if(err) throw err;
				var text = "🌿 🌱 🌳** "+msg.author.username+"'s zoo! **🌳 🌿 🌱\n";
				text += display;
				var additional = "";
				var additional2 = "";
				var row = result[0];
				var count = result[1][0];
				var digits= 2;
				if(count!=undefined)
					digits= (int)(Math.log10(count.biggest)+1);
				for (i in row){
					text = text.replace("~"+row[i].name,global.unicodeAnimal(row[i].name)+toSmallNum(row[i].count,digits));
					if(animals.legendary.indexOf(row[i].name)>0){
						if(additional=="")
							additional = secret;
						additional += row[i].name+toSmallNum(row[i].count,digits)+"  ";
					}
					if(animals.special.indexOf(row[i].name)>0){
						if(additional2=="")
							additional2 = secret2;
						additional2 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
					}
				}
				text = text.replace(/~:[a-zA-Z_0-9]+:/g,animals.question+toSmallNum(0,digits));
				text += additional;
				text += additional2;
				if(count!=undefined){
					var total = count.common*1+count.uncommon*5+count.rare*10+count.epic*50+count.mythical*500+count.legendary*1000;
					text += "\n**Zoo Points: __"+total+"__**\n\t**";
					if(count.legendary>0)
						text += "L-"+count.legendary+", ";
					text += "M-"+count.mythical+", ";
					text += "E-"+count.epic+", ";
					text += "R-"+count.rare+", ";
					text += "U-"+count.uncommon+", ";
					text += "C-"+count.common+"**";
				}
				msg.channel.send(text)
					.catch(err => console.error(err));
			});
		}
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
	sql += "SELECT name,nickname,lvl,xp FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(result[0][0]==undefined||result[0][0].money<animals.rollprice){
			msg.channel.send("**"+msg.author.username+"! You don't have enough cowoncy!**")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else if(result[0][0].time <= 15){
			msg.channel.send("**"+msg.author.username+"! You need to wait "+(15-result[0][0].time)+" more seconds!**")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			var animal = randAnimal();
			var type = animal[2];
			var xp = animal[3];
			var lvlup = false;
			sql = "INSERT INTO animal (id,name,count) VALUES ("+msg.author.id+",'"+animal[1]+"',1) ON DUPLICATE KEY UPDATE count = count + 1;"+
				"UPDATE cowoncy SET money = money - 5,catch = NOW() WHERE id = "+msg.author.id+";"+
				"INSERT INTO animal_count (id,"+type+") VALUES ("+msg.author.id+",1) ON DUPLICATE KEY UPDATE "+type+" = "+type+"+1;";
			if(result[1][0]!=undefined){
				var temp = givexp(animal[3],result[1][0].xp,result[1][0].lvl,msg.author.id,result[1][0].name);
				sql += temp[0];
				if(temp[1]>=1)
					lvlup = true;
			}
			con.query(sql,function(err,result2){
				if(err) throw err;
				var text = "**"+msg.author.username+"** spent **<:cowoncy:416043450337853441> 5**, and found a "+animal[0]+" "+global.unicodeAnimal(animal[1])+"!";
				if(result2[3]!=undefined&&result2[3].affectedRows>=1){
					text += "\n"+result[1][0].name+" "+((result[1][0].nickname==null)?"":"**"+result[1][0].nickname+"**")+" gained **"+animal[3]+" xp**";
					if(lvlup)
						text += " and leveled up";
					text += "!";
				}
				msg.channel.send(text)
					.catch(err => console.error(err));
				console.log("\x1b[36m%s\x1b[0m","    Found: "+animal[0]+" "+animal[1]);
			});
		}
	});
}

function randAnimal(){
	var rand = Math.random();
	var result = [];

	if(rand<parseFloat(animals.special[0])){
		rand = Math.ceil(Math.random()*(animals.special.length-1));
		result.push("**special**"+animals.ranks.special);
		result.push(animals.special[rand]);
		result.push("special");
		result.push(100);
	}else if(rand<parseFloat(animals.common[0])){
		rand = Math.ceil(Math.random()*(animals.common.length-1));
		result.push("**common**"+animals.ranks.common);
		result.push(animals.common[rand]);
		result.push("common");
		result.push(1);
	}else if(rand<parseFloat(animals.uncommon[0])){
		rand = Math.ceil(Math.random()*(animals.uncommon.length-1));
		result.push("**uncommon**"+animals.ranks.uncommon);
		result.push(animals.uncommon[rand]);
		result.push("uncommon");
		result.push(3);
	}else if(rand<parseFloat(animals.rare[0])){
		rand = Math.ceil(Math.random()*(animals.rare.length-1));
		result.push("**rare**"+animals.ranks.rare);
		result.push(animals.rare[rand]);
		result.push("rare");
		result.push(8);
	}else if(rand<parseFloat(animals.epic[0])){
		rand = Math.ceil(Math.random()*(animals.epic.length-1));
		result.push("**epic**"+animals.ranks.epic);
		result.push(animals.epic[rand]);
		result.push("epic");
		result.push(25);
	}else if(rand<parseFloat(animals.mythical[0])){
		rand = Math.ceil(Math.random()*(animals.mythical.length-1));
		result.push("**mythic**"+animals.ranks.mythical);
		result.push(animals.mythical[rand]);
		result.push("mythical");
		result.push(500);
	}else{
		rand = Math.ceil(Math.random()*(animals.legendary.length-1));
		result.push("**legendary**"+animals.ranks.legendary);
		result.push(animals.legendary[rand]);
		result.push("legendary");
		result.push(1500);
	}
	return result;
}
	
function toSmallNum(num,digits){
	var result = "";
	for(i=0;i<digits;i++){
		digit = num%10;
		num = Math.trunc(num/10);
		result = animals.numbers[digit]+result;
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
	secret = "\n"+animals.ranks.legendary+"    ";
	secret2 = "\n"+animals.ranks.special+"    ";

}

//Levels a pet
function givexp(xpgain,cxp,clvl,id,animal){
	var totalxp = xpgain+cxp;

	var neededxp = maxxp(clvl);
	var lvlup = 0;
	var att = 0;
	var hp = 0;
	if(totalxp/neededxp>=1){
		lvlup = 1;
		totalxp -= neededxp;
		animal = global.validAnimal(animal);
		if(animal==undefined)
			return "";
		att = animal.attr;
		hp = animal.hpr;
	}
	
	var result = ["UPDATE animal NATURAL JOIN cowoncy SET lvl = lvl + "+lvlup+",xp = "+totalxp+",att = att + "+att+",hp = hp + "+hp+" WHERE id = "+id+" AND name = pet;",
		lvlup]

	return result;
}

//Gets xp needed for that lvl
function maxxp(lvl){
	return 25*lvl*lvl;
}
