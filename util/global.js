/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
/**
 * Global Variables and Methods
 */

const numbers = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];
var animaljson = require('../../tokens/owo-animals.json');
var animalunicode = {};
var commands = {};
var animals = {};
var ranks = {};
var rankAlias = {};
var client,con;

/**
 * Checks if its an integer
 * @param {string}	value - value to check if integer
 *
 */
exports.isInt = function(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}

/**
 * Grabs all id from guild
 */
exports.getids = function(members){
	var result = "";
	members.keyArray().forEach(function(ele){
		result += ele+",";
	});
	return result.slice(0,-1);
}

/**
 * Check if the first letter is a vowel
 */
const vowels = ['a','e','i','o','u'];
exports.isVowel = function(string){
	let fchar = string.toLowerCase().trim().charAt(0);
	return vowels.includes(fchar);
}

/*
 * Checks if its a user
 */
exports.isUser = function(id){
	if(id==undefined)
		return undefined;
	return id.search(/<@!?[0-9]+>/)>=0;
}

/*
 * gets a user
 */
exports.getUser = async function(mention,cache = false){
	if(!mention)
		return undefined;
	id = (mention+'').match(/[0-9]+/);
	if(id)
		id = id[0];
	else
		return undefined;
	try{
		return await client.users.fetch(id,cache);
	}catch(e) {
		return undefined;
	}
}

exports.getMember = async function(guild,user,cache=false){
	if(!user) return;
	try{
		return await guild.members.fetch(user,cache);
	}catch(e){
		return;
	}
}

exports.parseID = function(id){
	id = id.match(/[:@][0-9]+>/);
	if(!id) return;
	id = id[0];
	return id.match(/[0-9]+/)[0];
}

/*
 * Gets name of guild
 */
exports.getGuildName = async function(id){
	id = id.match(/[0-9]+/)[0];
	var result = await client.shard.broadcastEval(`
		var temp = this.guilds.get('${id}');
		if(temp!=undefined)
			temp = temp.name;
		temp;
	`);
	var result = result.reduce((fin, val) => fin = (val)?val:fin);
	return result;
}

/**
 * Maps alts to their command names
 */
exports.client= function(tclient){
	client = tclient;


	var animallist = animaljson["list"];

	//Make nickname alias
	for(var key in animallist){
		var alt = animallist[key].alt;
		animals[animallist[key].value] = key;
		animals[key] = key;
		for(i in alt){
			animals[alt[i]] = key;
		}
	}

	//to unicode
	for (key in animallist){
		if(animallist[key].uni!=undefined)
			animalunicode[animallist[key].value] = animallist[key].uni;
	}

	//other info to animaljson
	for(key in animaljson.ranks){
		ranks[key] = {};
		var animalRank = [];
		for(var i=1;i<animaljson[key].length;i++){
			var name = animals[animaljson[key][i]];
			animalRank.push(animaljson[key][i]);
			animaljson.list[name].rank = key;
			animaljson.list[name].price = animaljson.price[key];
			animaljson.list[name].points = animaljson.points[key];
			animaljson.list[name].essence= animaljson.essence[key];
		}
		ranks[key].animals = animalRank;
		ranks[key].price = animaljson.price[key];
		ranks[key].points = animaljson.points[key];
		ranks[key].essence = animaljson.essence[key];
		ranks[key].emoji = animaljson.ranks[key];
		ranks[key].rank = key;
	}

	for(key in animaljson.alias){
		rankAlias[key] = key;
		for(var i=0;i<animaljson.alias[key].length;i++){
			rankAlias[animaljson.alias[key][i]] = key;
		}
	}
}

/**
 * Gets mysql con
 */
exports.con = function(tcon){
	con = tcon;
}

/**
 * Checks if its a valid animal
 */
exports.validAnimal = function(animal){
	if(animal!=undefined)
		animal = animal.toLowerCase();
	var ranimal = animaljson.list[animals[animal]];
	if(ranimal)
		ranimal["name"] = animals[animal];
	return ranimal
}

exports.validRank = function(rank){
	if(rank) rank.toLowerCase();
	rank = rankAlias[rank];
	return ranks[rank]
}

exports.getAllRanks = function(){
	return ranks;
}

/**
 * Changes animal to unicode
 */
exports.unicodeAnimal = function(animal){
	var unicode = animalunicode[animal];
	return (unicode==undefined)?animal:unicode;
}

/**
 * Checks if user has enough cowoncy
 */
exports.checkCowoncy = function(msg,cowoncy,callback){
	if(!msg) return;
	if(!cowoncy){
		msg.channel.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
	}
	var sql = "SELECT id FROM cowoncy WHERE id = "+msg.author.id+" AND money >= "+cowoncy+";";
	con.query(sql,function(err,rows,fields){
		if(err){console.error(err);return;}
		if(rows[0]==undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			callback();
		}
	});
}

exports.toSmallNum = function(count,digits){
	var result = "";
	var num = count;
	for(i=0;i<digits;i++){
		var digit = count%10;
		count = Math.trunc(count/10);
		result = numbers[digit]+result;
	}
	return result;
}

exports.toFancyNum = function(num){
	var parts = num.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

exports.toShortNum = function(num){
	if(num>=1000000)
		return Math.trunc(num/1000000)+'M';
	else if(num>=1000)
		return Math.trunc(num/1000)+'K';
	else
		return num;
}
