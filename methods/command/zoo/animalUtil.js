var animals = require('../../../../tokens/owo-animals.json');
/**
 * Picks a random animal from secret json file
 */
exports.randAnimal = function(patreon){
	var rand = Math.random();
	var result = [];

	if(patreon&&rand<parseFloat(animals.patreon[0])){
		rand = Math.ceil(Math.random()*(animals.patreon.length-1));
		result.push("**patreon** "+animals.ranks.patreon);
		result.push(animals.patreon[rand]);
		result.push("patreon");
		result.push(100);
	}else if(animals.special[0]!="0"&&rand<parseFloat(animals.special[0])+((patreon)?parseFloat(animals.patreon[0]):0)){
		rand = 1;
		result.push("**special** "+animals.ranks.special);
		result.push(animals.special[rand]);
		result.push("special");
		result.push(100);
	}else if(rand<parseFloat(animals.common[0])){
		rand = Math.ceil(Math.random()*(animals.common.length-1));
		result.push("**common** "+animals.ranks.common);
		result.push(animals.common[rand]);
		result.push("common");
		result.push(1);
	}else if(rand<parseFloat(animals.uncommon[0])){
		rand = Math.ceil(Math.random()*(animals.uncommon.length-1));
		result.push("**uncommon** "+animals.ranks.uncommon);
		result.push(animals.uncommon[rand]);
		result.push("uncommon");
		result.push(3);
	}else if(rand<parseFloat(animals.rare[0])){
		rand = Math.ceil(Math.random()*(animals.rare.length-1));
		result.push("**rare** "+animals.ranks.rare);
		result.push(animals.rare[rand]);
		result.push("rare");
		result.push(8);
	}else if(rand<parseFloat(animals.epic[0])){
		rand = Math.ceil(Math.random()*(animals.epic.length-1));
		result.push("**epic** "+animals.ranks.epic);
		result.push(animals.epic[rand]);
		result.push("epic");
		result.push(25);
	}else if(rand<parseFloat(animals.mythical[0])){
		rand = Math.ceil(Math.random()*(animals.mythical.length-1));
		result.push("**mythic** "+animals.ranks.mythical);
		result.push(animals.mythical[rand]);
		result.push("mythical");
		result.push(500);
	}else if(rand<parseFloat(animals.legendary[0])){
		rand = Math.ceil(Math.random()*(animals.legendary.length-1));
		result.push("**legendary** "+animals.ranks.legendary);
		result.push(animals.legendary[rand]);
		result.push("legendary");
		result.push(1500);
	}else{
		rand = Math.ceil(Math.random()*(animals.fabled.length-1));
		result.push("**fabled** "+animals.ranks.fabled);
		result.push(animals.fabled[rand]);
		result.push("fabled");
		result.push(25000);
	}
	return result;
}

exports.toSmallNum = function(count,digits){
	var result = "";
	var num = count;
	for(i=0;i<digits;i++){
		var digit = count%10;
		count = Math.trunc(count/10);
		result = animals.numbers[digit]+result;
	}
	return result;
}
