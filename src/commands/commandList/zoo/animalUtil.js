/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
	*/

const animals = require('../../../../../tokens/owo-animals.json');

let enableDistortedTier = true;
setTimeout(() => {
	// Disable distorted after 6 hours;
	enableDistortedTier = false;
}, 21600000);

const specialRatesManual = animals.specialRates;
let specialRatesHuntbot = [];
let specialPercentManual = 0;
let specialPercentHuntbot = 0;
if (specialRatesManual && specialRatesManual.length) {
	for (let i in specialRatesManual) {
		specialPercentManual += specialRatesManual[i].rate
		specialRatesHuntbot[i] = { ...specialRatesManual[i] };
		specialRatesHuntbot[i].rate = specialRatesHuntbot[i].rate / 4
		specialPercentHuntbot += specialRatesHuntbot[i].rate
	}
}

/**
 * Picks a random animal from secret json file
 */
exports.randAnimal = function({patreon, gem, lucky, huntbot, manual} = {}){
	let rand = Math.random();
	let result = [];

	/* Calculate percentage */
	const specialRates = huntbot ? specialRatesHuntbot : specialRatesManual;
	const specialPercent = huntbot ? specialPercentHuntbot : specialPercentManual;
	// If user has patreon
	let patreonPercent = animals.cpatreon[0]+animals.patreon[0];
	if(!patreon) patreonPercent = 0;
	// If user is using gems
	let gemPercent = animals.gem[0];
	if(!gem) gemPercent = 0;
	else if(lucky) gemPercent += gemPercent*lucky.amount;
	// If bot has restarted
	let distortedPercent = enableDistortedTier && manual ? animals.distorted[0] : 0;
	if (distortedPercent) {
		distortedPercent += specialPercent + patreonPercent;
		if (huntbot) distortedPercent += huntbot;
		if (gemPercent) distortedPercent += gemPercent;
	}

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
		let tempRate = patreonPercent;
		let found = false;
		for (let i in specialRates) {
			tempRate += specialRates[i].rate;
			if (!found && rand<=tempRate){
				found = true;
				result.push("**special** "+animals.ranks.special);
				result.push(specialRates[i].animal);
				result.push("special");
				result.push(500);
			}
		}
	}else if(huntbot&&rand<huntbot+specialPercent+patreonPercent){
		rand = Math.ceil(Math.random()*(animals.bot.length-1));
		result.push("**bot** "+animals.ranks.bot);
		result.push(animals.bot[rand]);
		result.push("bot");
		result.push(100000);
	}else if(gemPercent&&rand<gemPercent+specialPercent+patreonPercent){
		rand = Math.ceil(Math.random()*(animals.gem.length-1));
		result.push("**gem** "+animals.ranks.gem);
		result.push(animals.gem[rand]);
		result.push("gem");
		result.push(5000);
	} else if (rand<distortedPercent) {
		rand = Math.ceil(Math.random()*(animals.distorted.length-1));
		result.push("**distorted** "+animals.ranks.distorted);
		result.push(animals.distorted[rand]);
		result.push("distorted");
		result.push(100000);
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
	let result = "";
	let num = count;
	for(i=0;i<digits;i++){
		let digit = count%10;
		count = Math.trunc(count/10);
		result = animals.numbers[digit]+result;
	}
	return result;
}

exports.zooScore = function(zoo){
	let text = "";
	if(zoo.hidden>0)
		text += "H-"+zoo.hidden+", ";
	if(zoo.fabled>0)
		text += "F-"+zoo.fabled+", ";
	if(zoo.cpatreon>0)
		text += "CP-"+zoo.cpatreon+", ";
	if(zoo.distorted>0)
		text += "D-"+zoo.distorted+", ";
	if(zoo.bot>0)
		text += "B-"+zoo.bot+", ";
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
