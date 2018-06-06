var gain = 100;
const traitcost = {"cooldown":100,"duration":100,"cost":100};

exports.getLvl = function(xp,trait){
	totalxp = 0;
	for(var i=1;i<=100;i++){
		var lvlxp = traitcost[trait]*i*i;
		totalxp += lvlxp;
		if(totalxp>xp){
			var temp = {};
			temp.lvl = i-1;
			temp.currentxp = xp - (totalxp - lvlxp);
			temp.maxxp = lvlxp;
			return temp
		}
	}
}

exports.getMaxXp = function(lvl,trait){
	return traitcost[trait]*lvl*lvl;
}

