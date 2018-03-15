/**
 * Global Variables and Methods
 */

var help = require('../json/help.json');
var animaljson = require('../../tokens/owo-animals.json');
var commands = {};
var animals = {};
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

/*
 *
 */
exports.getUser = function(mention){
	id = mention.match(/[0-9]+/)[0];
	if(id=="")
		return undefined;
	return client.users.get(id);
}

/**
 * Maps alts to their command names
 */
exports.init = function(tclient){
	client = tclient;

	for(var key in help){
		var alt = help[key].alt;
		commands[help[key].name] = key;
		for(i in alt){
			commands[alt[i]] = key;
		}
	}

	var animallist = animaljson["list"];
	for(var key in animallist){
		var alt = animallist[key].alt;
		animals[animallist[key].value] = key;
		animals[key] = key;
		for(i in alt){
			animals[alt[i]] = key;
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
 * Checks if its a valid command
 */
exports.validCommand = function(command){
	return help[commands[command]]
}

/**
 * Checks if its a valid animal
 */
exports.validAnimal = function(animal){
	var ranimal = animaljson.list[animals[animal]];
	if(ranimal == undefined)
		return ranimal;
	return ranimal.value;
}

/**
 * Checks if command is disabled
 */
exports.isDisabled = async function(command,execute,executeOther,msg,args,isMention){
	var channel = msg.channel.id;
	var tcommand = help[commands[command]];
	if(tcommand == undefined){
		executeOther(command,msg,args,isMention);
		return;
	}
	if(tcommand.global){
		execute(command,msg,args,isMention);
		return;
	}
	tcommand = tcommand.name;
	var sql = "SELECT * FROM disabled WHERE command = '"+tcommand+"' AND channel = "+channel+";";
	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0]==undefined)
			execute(command,msg,args,isMention);
		else
			msg.channel.send("That command is disabled on this channel!")
				.then(message => message.delete(3000));
	});
}
