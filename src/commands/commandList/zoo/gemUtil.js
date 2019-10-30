/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const gems = require('../../../data/gems.json');
for(var gem in gems.gems) gems.gems[gem].key = gem;
const ranks = {"c":"Common","u":"Uncommon","r":"Rare","e":"Epic","m":"Mythical","l":"Legendary","f":"Fabled"};

exports.getItems = async function(p){
	var sql = `SELECT gname,gcount FROM user_gem NATURAL JOIN user WHERE id = ${p.msg.author.id} AND gcount > 0;`;
	let result = await p.query(sql);
	var items = {}
	for(var i=0;i<result.length;i++){
		var item = gems.gems[result[i].gname];
		if(item){
			var item = {key:item.key,emoji:item.emoji,id:item.id,count:result[i].gcount};
			items[item.key] = item;
		}
	}
	return items;
}

function getGemByID(id){
	for(var gem in gems.gems){
		if(gems.gems[gem].id==id){
			return gems.gems[gem];
		}
	}
	return undefined;
}

exports.getGem = function(key){
	/* Copy the gem object */
	return {...gems.gems[key]};
}

exports.use = function(p,id){
	var gem = getGemByID(id);
	if(!gem){
		p.send("**🚫 | "+p.msg.author.username+"**, There is no such item!",3000);
		return;
	}
	var sql = `UPDATE IGNORE user NATURAL JOIN user_gem ug NATURAL JOIN gem g SET
			gcount = gcount - 1,
			activecount = ${gem.length}
		WHERE
			gname = '${gem.key}' AND
			gcount > 0 AND
			id = ${p.msg.author.id} AND
			(SELECT sum FROM
			 	(SELECT SUM(activecount) as sum,type FROM user NATURAL JOIN user_gem NATURAL JOIN gem WHERE id = ${p.msg.author.id} GROUP BY type) as tmptable
			WHERE type = g.type) <= 0;`;
	p.con.query(sql,function(err,result){
		if(err){return;}
		if(!result||result.changedRows==0){
			p.send("**🚫 | "+p.msg.author.username+"**, you already have an active "+gem.type+" gem or you do not own this gem!",3000);
			return;
		}
		var text = "**"+gem.emoji+" | "+p.msg.author.username+"**, you activated a(n) **"+ranks[gem.key[0]]+" "+gem.type+" Gem!**\n";
		text += "**<:blank:427371936482328596> |** Your next "+gem.length+" ";
		if(gem.type=="Hunting")
			text += "manual hunts will be increased by "+gem.amount;
		else if(gem.type=="Patreon")
			text += "manual hunts will catch an extra animal and have a chance to contain Patreon exclusive animals!";
		else if(gem.type=="Empowering")
			text += " animals will be doubled! It can stack with Hunting gems!";
		else if(gem.type=="Lucky")
			text += " animals will have a +"+gem.amount+"x higher chance of finding gem tiers!";
		else
			text += "ERROR!";
		p.send(text);
	});
}

exports.desc = function(p,id){
	var gem = getGemByID(id);
	if(!gem){
		p.send("**🚫 | "+p.msg.author.username+"**, There is no such item!",3000);
		return;
	}
	var sql = "SELECT * FROM user NATURAL JOIN user_gem NATURAL JOIN gem WHERE id = "+p.msg.author.id+" AND gname = '"+gem.key+"';";
	p.con.query(sql,function(err,result){
		if(err){return;}
		if(!result[0]){
			p.send("**🚫 | "+p.msg.author.username+"**, you do not have this item!",3000);
			return;
		}
		var text = "**ID:** "+gem.id+"\n";
		if(gem.type=="Hunting")
			text += "A(n) "+ranks[gem.key[0]]+" Hunting Gem!\nWhen activated, this gem will increase your manual hunt by "+gem.amount+" for the next "+gem.length+" hunts!\nCannot stack with other Hunting gems.";
		else if(gem.type=="Patreon")
			text += "A(n) "+ranks[gem.key[0]]+" Patreon Gem!\nWhen activated, this gem will allow you to find Patreon/Custom pets when manually hunting for the next "+gem.length+" hunts!\nYou will also hunt 1 extra animal per hunt!\nCannot stack with other Patreon gems.";
		else if(gem.type=="Empowering")
			text += "A(n) "+ranks[gem.key[0]]+" Empowering Gem!\nWhen activated, this gem will double your next "+gem.length+" animals!\nCannot stack with other Empowering gems, but can stack with Hunting gems.";
		else if(gem.type=="Lucky")
			text += "A(n) "+ranks[gem.key[0]]+" Lucky Gem!\nWhen activated, this gem will increase your chance of finding gem pets by "+gem.amount+"x for the next "+gem.length+" animals!\nCannot stack with other Lucky gems.";
		var embed = {
		"color": 4886754,
		"fields":[{
			"name":gem.emoji+" "+gem.key,
			"value":text
			}]
		};
		p.send({embed});
	});
}
