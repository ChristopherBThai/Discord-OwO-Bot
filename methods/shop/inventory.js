const food = require('../json/food.json');
const foodjs = require('./food.js');
const fid = {};
const global = require('./global.js');

exports.display = function(con,msg){
	foodjs.getItems(con,msg.author.id,function(items){
		var text = "";
		for(var key in items){
			var item = items[key];
			text += item.key + " " + item.name + " "+item.id+"\n";
		}
		msg.channel.send(text)
			.catch(err => console.error(err));
	});
}

exports.equip = function(con,msg,args){
	var item = getItem(args);
	if(typeof item === 'string' || item instanceof String){
		msg.channel.send("**🚫 | "+msg.author.username+"**, "+item)
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}

	foodjs.equip(con,msg,item);
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
