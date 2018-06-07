const traits= {"cooldown":{"inc":150,"base":60,"upg":-1,"max":45,"prefix":"s"},
		"duration":{"inc":150,"base":.5,"upg":.5,"max":47,"prefix":"H"},
		"cost":{"inc":5000,"base":10,"upg":-1,"max":5,"prefix":" cowoncy"}};
//test(traits.cooldown);
//test(traits.duration);
//test(traits.cost);

exports.getLvl = function(xp,gain,trait){
	totalxp = 0;
	var temp = {};
	var hit = false;
	var prevlvl = 0;
	trait = traits[trait];

	for(var i=1;i<=trait.max;i++){
		var lvlxp = trait.inc*i*i;
		totalxp += lvlxp;
		if(!hit&&totalxp>xp){
			prevlvl = i-1;
			hit = true;
		}
		if(hit){
			if(totalxp>xp+gain){
				temp.lvl = i-1;
				//if(temp.lvl==trait.max)
				//	temp.lvl = "MAX";
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
