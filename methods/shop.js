var cowoncy = "<:cowoncy:416043450337853441>";
const food = require('../json/food.json');
const foodjs = require('./food.js');
const fid = {};
const global = require('./global.js');
const numbers = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"];

exports.display = function(msg,args){
	var embed = {
		"description": "`owo help {page}` to navigate the help page\n`owo describe {id}` to show information\n`owo buy {id}` to buy an item",
		"color": 4886754,
		"footer": {
			"text": "Page 1/12"
		},
		"author": {
			"name": "hOI! welcom to da OWO SHOP!!!",
			"icon_url": "https://i.imgur.com/GAaxbIF.gif"
		},
		"fields": []
	};
	for(var key in food){
		embed.fields.push({
				"name": key+" "+food[key].name+" "+toSmallNum(food[key].id,2),
				"value": cowoncy+" "+food[key].price+"\nFor: `"+food[key]["for"]+"`",
				"inline": true
		});
	}
	msg.channel.send({ embed });
}

exports.describe = function(msg,args){
	var item = getItem(args);
	if(typeof item === 'string' || item instanceof String){
		msg.channel.send("**🚫 | "+msg.author.username+"**, "+item)
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}

	msg.channel.send("**🛒 | "+item.key+" "+item.name+"** "+toSmallNum(item.id,2)+"\n"+
		"**<:blank:427371936482328596> | Price:** `"+item.price+"`\n"+
		"__**<:blank:427371936482328596> | Used For:** `owo battle`                __\n"+
		"**<:blank:427371936482328596> |** `"+item.desc.replace(/(?:\r\n|\r|\n)/g, "`\n**<:blank:427371936482328596> |** `")+"`");
}

exports.buy = function(con,msg,args){
	var item = getItem(args);
	if(typeof item === 'string' || item instanceof String){
		msg.channel.send("**🚫 | "+msg.author.username+"**, "+item)
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}

	foodjs.buy(con,msg,item);
}

function toSmallNum(count,digits){
	var result = "";
	var num = count;
	for(i=0;i<digits;i++){
		var digit = count%10;
		count = Math.trunc(count/10);
		result = numbers[digit]+result;
	}
	return result;
}

exports.init = function(){
	for(var key in food){
		fid[food[key].id] = key;
	}
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
