const macro = require('../../../../tokens/macro.js');
const traits= {"cooldown":{"inc":150,"base":60,"upg":-1,"max":45,"prefix":"s"},
		"duration":{"inc":150,"base":.5,"upg":.5,"max":47,"prefix":"H"},
		"cost":{"inc":2000,"base":10,"upg":-1,"max":5,"prefix":" cowoncy"}};
//test(traits.cooldown);
//test(traits.duration);
//test(traits.cost);

exports.getLvl = function(xp,gain,trait){
	totalxp = 0;
	var temp = {};
	var hit = false;
	var prevlvl = 0;
	trait = traits[trait];

	for(var i=1;i<=trait.max+1;i++){
		var lvlxp = trait.inc*i*i;
		totalxp += lvlxp;
		if(!hit&&totalxp>xp){
			prevlvl = i-1;
			hit = true;
		}
		if(hit||i==trait.max+1){
			if(totalxp>xp+gain||i==trait.max+1){
				temp.lvl = i-1;
				if(temp.lvl==trait.max)
					temp.max= true;
				temp.currentxp = (xp+gain) - (totalxp - lvlxp);
				temp.maxxp = lvlxp;
				if(prevlvl<temp.lvl){
					temp.lvlup = true;
					temp.gain = trait.upg;
				}
				temp.stat = trait.base + (trait.upg*temp.lvl);
				temp.prefix = trait.prefix;
				return temp;
			}
		}
	}
}

exports.getMaxXp = function(lvl,trait){
	return traits[trait].inc*lvl*lvl;
}

function test(trait){
	var total = 0;
	for(var i=1;i<=trait.max;i++){
		var xp = trait.inc*i*i;
		total += xp;
		console.log("["+i+"] "+total +" | "+xp);
	}
}

exports.captcha = function(msg,word,text){
	macro.generateBuffer(word,function(buffer){
		msg.channel.send(text,buffer);
	});
}
