/**
 * Global Variables and Methods
 */

var help = require('../json/help.json');
var auth = require('../../tokens/owo-auth.json');
var animaljson = require('../../tokens/owo-animals.json');
var animalunicode = {};
var commands = {};
var animals = {};
var client,con;
var admin;
const cooldown = {};

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
	if(id==undefined)
		return undefined;
	return id.search(/<@!?[0-9]+>/)>=0;
}

/*
 * gets a user
 */
exports.getUser = async function(mention){
	id = mention.match(/[0-9]+/)[0];
	return await client.fetchUser(id,true);
}

/**
 * DM a user
 */
exports.msgUser = async function(id,msg){
	id = id.match(/[0-9]+/)[0];
	var user = await client.fetchUser(id,true);
	var success;
	if(user)
		await user.send(msg)
		.then(success = {username:user.username,id:user.id})
		.catch(err => success = false);
	return success;
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
	for (key in animallist){
		if(animallist[key].uni!=undefined)
			animalunicode[animallist[key].value] = animallist[key].uni;
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
	if(animal!=undefined)
		animal = animal.toLowerCase();
	var ranimal = animaljson.list[animals[animal]];
	if(ranimal == undefined)
		return ranimal;
	return ranimal
}

/**
 * Changes animal to unicode
 */
exports.unicodeAnimal = function(animal){
	var unicode = animalunicode[animal];
	return (unicode==undefined)?animal:unicode;
}

/**
 * Checks if command is disabled
 */
exports.isDisabled = async function(command,execute,executeOther,msg,args,isMention){
	var channel = msg.channel.id;
	var tcommand = help[commands[command]];

	//If not a command
	if(tcommand == undefined){
		executeOther(command,msg,args,isMention);
		return;
	}

	//Check if there is a global cooldown
	if(cooldown[msg.author.id]==undefined){
		cooldown[msg.author.id]=1;
		setTimeout(() => {
			delete cooldown[msg.author.id];
		}, 5000);
	}else if(cooldown[msg.author.id]>=3) {
		msg.channel.send("**"+msg.author.username+"**! Please slow down~ You're a little **too fast** for me :c")
			.then(message => message.delete(3000));
		return;
	}else if(cooldown[msg.author.id]<3){
		cooldown[msg.author.id]++;
	}

	//If its a global command (no cooldown/disable)
	if(tcommand.global){
		execute(command,msg,args,isMention);
		return;
	}

	//Check if the command is enabled
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

/**
 * Sends a message to an admin
 */
exports.msgAdmin = async function (message){
	if(admin==undefined)
		admin = await client.fetchUser(auth.admin,true);
	if(admin!=undefined)
		admin.send(message);
}
