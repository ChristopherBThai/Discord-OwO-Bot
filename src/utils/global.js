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
const request = require('request');
const secret = require('../../../tokens/wsserver.json');
var animaljson = require('../../../tokens/owo-animals.json');
var animalunicode = {};
var commands = {};
var animals = {};
var ranks = {};
var rankAlias = {};
var client,con;
var totalShards,sharders;

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
	let result = "";
	members.forEach(function(ele,key,map){
		result += key+",";
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

exports.parseID = function(id){
	id = id.match(/[:@][0-9]+>/);
	if(!id) return;
	id = id[0];
	return id.match(/[0-9]+/)[0];
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

exports.toSmallNum = function(count,digits){
	let result = "";
	let num = count;
	if(!digits) digits = count.toString().length;
	for(i=0;i<digits;i++){
		let digit = count%10;
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

exports.getClient = function(){
	return client;
}

exports.getRoleColor = function(member){
	if(!member) return null;
	let color,pos=-1;
	for(let i in member.roles){
		let role = member.guild.roles.get(member.roles[i]);
		if(role&&role.color){
			if(role.position>pos){
				color = role.color;
				pos = role.position;
			}
		}
	}
	if(color) return "#"+color.toString(16);
	else return null;
}

exports.getTotalShardCount = function(){
	if(totalShards) return totalShards;
	return new Promise( (resolve, reject) => {
		let req = request({
			method:'GET',
			uri:secret.url+"/totalShards",
		},(error,res,body)=>{
			if(error){
				reject();
				return;
			}
			if(res.statusCode==200){
				body = JSON.parse(body);
				totalShards = body.totalShards;
				sharders = body.sharders;
				resolve(totalShards);
			}else{
				reject();
			}
		});
	});
}
