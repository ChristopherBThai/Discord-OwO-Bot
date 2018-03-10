/**
 * Global Variables and Methods
 */

var help = require('../json/help.json');
var commands = {};

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
		result += ele + ",";
	});
	return result.slice(0,-1);
}

/*
 * Checks if its a user
 */
exports.isUser = function(id){
	return id.search(/<@!?[0-9]+>/)>=0;
}

/**
 * Maps alts to their command names
 */
exports.init = function(){
	for(var key in help){
		var alt = help[key].alt;
		commands[help[key].name] = key;
		for(i in alt){
			commands[alt[i]] = key;
		}
	}
}

/**
 * Checks if its a valid command
 */
exports.validCommand = function(command){
	return help[commands[command]]
}
