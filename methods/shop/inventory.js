const food = require('../json/food.json');
const foodjs = require('./food.js');
const fid = {};
const global = require('./global.js');

exports.display = function(con,msg){
	}

exports.equip = function(con,msg,args){
	}

function getItem(args){
	var id = 0;
	if(args.length!=1){
		return "Invalid arguments!";
	}
	
	if(global.isInt(args[0])){
		id = parseInt(args[0]);
	}else{
		return "Invalid arguments!";
	}

	var key = fid[id];
	if(!key){return "That id is wrong!";}
	item = food[key];
	if(!item){return "I could not find that item!";}
	item.key = key;
	return item;
}

exports.init = function(){
	for(var key in food){
		fid[food[key].id] = key;
	}
}
