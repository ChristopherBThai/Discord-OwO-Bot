//Checks for macro users
var users = {};
var mcommands = {"slots":15000,"hunt":15000,"battle":15000,"sell":1000};
var vemoji = ["","","","","","",""];
var con;
var global = require('./global.js');

/**
 * Checks for macros
 * false - ok
 * true - macro
 */
exports.check = function(msg,command){
	if(!mcommands[command]){return false;}

	var id = msg.author.id;

	//Grab correct user/command json
	if(!users[id]){
		users[id]={};
	}
	var user = users[id];
	if(!user[command]){
		user[command] = {
			"command":command,
			"lasttime":new Date(),
			"prev":0,
			"count":0
		}
	}
	user = user[command];

	if(user){
		var now = new Date();
		var diff = now - user.lasttime;

		//Check for time limit
		if(diff<mcommands[user.command])
			return false;

		//Check for macros
		else if(checkInterval(user,now,diff)){
			humanCheck(user,msg);
			return true;
		}

		user.lasttime = now;
	}
	console.log(users);
	return false;
}



function humanCheck(user,msg){
}

function checkInterval(user,now,diff){
	//Checks for macro count
	if(user.count>=0) return true;

	//Check for patterns
	if(Math.abs(user.prev-diff)<=1500) user.count++;
	else{user.count = 0;}
	user.prev = diff;
}

function ban(msg,hours){

}

exports.con = function(tcon){
	con = tcon;
}
