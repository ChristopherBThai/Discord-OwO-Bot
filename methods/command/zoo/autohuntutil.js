const macro = require('../../../../tokens/macro.js');
const traits= {"efficiency":{"inc":10,"pow":1.748,"base":25,"upg":1,"max":215,"prefix":"/H"},
		"duration":{"inc":10,"pow":1.7,"base":.5,"upg":.1,"max":235,"prefix":"H"},
		"cost":{"inc":1000,"pow":3.4,"base":10,"upg":-1,"max":5,"prefix":" cowoncy"}};
//test(traits.efficiency);
//test(traits.duration);
//test(traits.cost);

exports.getLvl = function(xp,gain,trait){
	totalxp = 0;
	var temp = {};
	var hit = false;
	var prevlvl = 0;
	trait = traits[trait];

	for(var i=1;i<=trait.max+1;i++){
		var lvlxp = Math.trunc(trait.inc*Math.pow(i,trait.pow));
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
				temp.stat = Math.trunc(temp.stat*10)/10;
				temp.prefix = trait.prefix;
				return temp;
			}
		}
	}
}

exports.getMaxXp = function(lvl,trait){
	return Math.trunc(traits[trait].inc*Math.pow(lvl,trait.pow));
}

function test(trait){
	var total = 0;
	for(var i=1;i<=trait.max;i++){
		var xp = Math.trunc(trait.inc*Math.pow(i,trait.pow));
		total += xp;
		console.log("["+i+"] "+total +" | "+xp);
	}
}

exports.captcha = function(msg,word,text){
	macro.generateBuffer(word,function(buffer){
		msg.channel.send(text,buffer);
	});
}
