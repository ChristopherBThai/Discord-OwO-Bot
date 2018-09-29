const global = require("../../../util/global.js");
const box = "<:box:427352600476647425>";
const tempGem = require("../../../json/gems.json");
var gems = {};
for (var key in tempGem.gems){
 	var temp = tempGem.gems[key];	
	temp.key = key;
	if(!gems[temp.type]) gems[temp.type] = [];
	gems[temp.type].push(temp);
}
var typeCount = Object.keys(gems).length;
const ranks = {"c":"Common","u":"Uncommon","r":"Rare","e":"Epic","m":"Mythical","l":"Legendary","f":"Fabled"};

exports.getItems = function(con,id,callback){
	var sql = "SELECT * FROM lootbox WHERE id = "+id+" AND boxcount > 0;";
	con.query(sql,function(err,result){
		if(err){console.error(err);callback({});return}
		if(!result[0]){callback({});return;}
		var item = {key:box,id:50,count:result[0].boxcount}
		callback({box:item});
	});
}

exports.getRandomGem = function(id,patreon){
	var type = Math.trunc(Math.random()*(typeCount-((patreon)?1:0)));
	var count = 0;
	for (var key in gems){
		if(!(patreon&&key=="Patreon")){
			if(count==type) type = key;
			count++;
		}
	}

	if(global.isInt(type))
		type = Object.keys(gems)[0];

	type = gems[type];
	var rand = Math.random();
	var gem;
	var sum = 0
	for(var x in type){
		sum += type[x].chance;
		if(rand<sum){
			gem = type[x];
			rand = 100;
		}
	}
	var rank = ranks[gem.key[0]];

	var sql = `INSERT INTO user_gem (uid,gname,gcount) VALUES (
			(SELECT uid FROM user WHERE id = ${id}),
			(SELECT gname FROM gem WHERE gname = '${gem.key}'),
			1
		) ON DUPLICATE KEY UPDATE
			gcount = gcount + 1;`

	return {gem:gem,
		name:rank+" "+gem.type+" Gem",
		sql:sql};
}

exports.desc = function(p){
	var text = "**ID:** 50\nOpens a lootbox! Check how many you have in 'owo inv'!\nYou can get some more by hunting for animals. You can get a maximum of 3 lootboxes per day.\nUse `owo inv` to check your inventory\nUse 'owo use {id}` to use the item!";
	var embed = {
	"color": 4886754,
	"fields":[{
		"name":box+" Lootbox",
		"value":text
		}]
	};
	p.send({embed});
}
