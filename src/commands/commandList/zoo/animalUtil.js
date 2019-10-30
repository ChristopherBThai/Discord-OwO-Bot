/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

var animals = require('../../../../../tokens/owo-animals.json');
/**
 * Picks a random animal from secret json file
 */
exports.randAnimal = function(patreon,gem,lucky){
	var rand = Math.random();
	var result = [];

	/* Calculate percentage */
	var patreonPercent = animals.cpatreon[0]+animals.patreon[0];
	if(!patreon) patreonPercent = 0;
	var specialPercent = animals.special[0];
	if(animals.special[0]=="0") specialPercent = 0;
	var gemPercent = animals.gem[0];
	if(!gem) gemPercent = 0;
	else if(lucky) gemPercent += gemPercent*lucky.amount;

	if(patreonPercent&&rand<patreonPercent){
		if(rand<animals.cpatreon[0]){
			rand = Math.ceil(Math.random()*(animals.cpatreon.length-1));
			result.push("**patreon** "+animals.ranks.cpatreon);
			result.push(animals.cpatreon[rand]);
			result.push("cpatreon");
			result.push(2000);
		}else{
			rand = Math.ceil(Math.random()*(animals.patreon.length-1));
			result.push("**patreon** "+animals.ranks.patreon);
			result.push(animals.patreon[rand]);
			result.push("patreon");
			result.push(400);
		}
	}else if(specialPercent&&rand<specialPercent+patreonPercent){
		rand = 1;
		result.push("**special** "+animals.ranks.special);
		result.push(animals.special[rand]);
		result.push("special");
		result.push(250);
	}else if(gemPercent&&rand<gemPercent+specialPercent+patreonPercent){
		rand = Math.ceil(Math.random()*(animals.gem.length-1));
		result.push("**gem** "+animals.ranks.gem);
		result.push(animals.gem[rand]);
		result.push("gem");
		result.push(5000);
	}else if(rand<animals.common[0]){
		rand = Math.ceil(Math.random()*(animals.common.length-1));
		result.push("**common** "+animals.ranks.common);
		result.push(animals.common[rand]);
		result.push("common");
		result.push(1);
	}else if(rand<animals.uncommon[0]){
		rand = Math.ceil(Math.random()*(animals.uncommon.length-1));
		result.push("**uncommon** "+animals.ranks.uncommon);
		result.push(animals.uncommon[rand]);
		result.push("uncommon");
		result.push(10);
	}else if(rand<animals.rare[0]){
		rand = Math.ceil(Math.random()*(animals.rare.length-1));
		result.push("**rare** "+animals.ranks.rare);
		result.push(animals.rare[rand]);
		result.push("rare");
		result.push(20);
	}else if(rand<animals.epic[0]){
		rand = Math.ceil(Math.random()*(animals.epic.length-1));
		result.push("**epic** "+animals.ranks.epic);
		result.push(animals.epic[rand]);
		result.push("epic");
		result.push(400);
	}else if(rand<animals.mythical[0]){
		rand = Math.ceil(Math.random()*(animals.mythical.length-1));
		result.push("**mythic** "+animals.ranks.mythical);
		result.push(animals.mythical[rand]);
		result.push("mythical");
		result.push(1000);
	}else if(rand<animals.legendary[0]){
		rand = Math.ceil(Math.random()*(animals.legendary.length-1));
		result.push("**legendary** "+animals.ranks.legendary);
		result.push(animals.legendary[rand]);
		result.push("legendary");
		result.push(2000);
	}else if(rand<animals.fabled[0]){
		rand = Math.ceil(Math.random()*(animals.fabled.length-1));
		result.push("**fabled** "+animals.ranks.fabled);
		result.push(animals.fabled[rand]);
		result.push("fabled");
		result.push(100000);
	}else{
		rand = Math.ceil(Math.random()*(animals.hidden.length-1));
		result.push("**hidden** "+animals.ranks.hidden);
		result.push(animals.hidden[rand]);
		result.push("hidden");
		result.push(300000);
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

exports.zooScore = function(zoo){
	var text = "";
	if(zoo.hidden>0)
		text += "H-"+zoo.hidden+", ";
	if(zoo.fabled>0)
		text += "F-"+zoo.fabled+", ";
	if(zoo.cpatreon>0)
		text += "CP-"+zoo.cpatreon+", ";
	if(zoo.gem>0)
		text += "G-"+zoo.gem+", ";
	if(zoo.legendary>0)
		text += "L-"+zoo.legendary+", ";
	if(zoo.patreon>0||zoo.cpatreon>0)
		text += "P-"+zoo.patreon+", ";
	text += "M-"+zoo.mythical+", ";
	if(zoo.special>0)
		text += "S-"+zoo.special+", ";
	text += "E-"+zoo.epic+", ";
	text += "R-"+zoo.rare+", ";
	text += "U-"+zoo.uncommon+", ";
	text += "C-"+zoo.common;
	return text;
}
