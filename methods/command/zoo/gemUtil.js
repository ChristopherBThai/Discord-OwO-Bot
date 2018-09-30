const gems = require('../../../json/gems.json');
for(var gem in gems.gems) gems.gems[gem].key = gem;
const ranks = {"c":"Common","u":"Uncommon","r":"Rare","e":"Epic","m":"Mythical","l":"Legendary","f":"Fabled"};

exports.getItems = function(con,id,callback){
	var sql = "SELECT * FROM user_gem NATURAL JOIN user WHERE id = "+id+" AND gcount > 0;";
	con.query(sql,function(err,result){
		if(err){console.error(err);callback({});return;}
		var items = {}
		for(var i=0;i<result.length;i++){
			var item = gems.gems[result[i].gname];
			if(item){
				var item = {key:item.emoji,id:item.id,count:result[i].gcount};
				items[item.key] = item;
			}
		}
		callback(items);
	});
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
	return gems.gems[key];
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
		if(err){console.error(err);return;}
		if(!result||result.changedRows==0){
			p.send("**🚫 | "+p.msg.author.username+"**, you already have an active "+gem.type+" gem or you do not own this gem!",3000);
			return;
		}
		var text = "**"+gem.emoji+" | "+p.msg.author.username+"**, you activated a(n) **"+ranks[gem.key[0]]+" "+gem.type+" Gem!**\n";
		text += "**<:blank:427371936482328596> |** Your next "+gem.length+" manual hunts ";
		if(gem.type=="Multiplier")
			text += "will be multiplied by "+gem.amount;
		else if(gem.type=="Patreon")
			text += "will catch an extra animal and have a chance to contain Patreon exclusive animals!";
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
		if(err){console.error(err);return;}
		if(!result[0]){
			p.send("**🚫 | "+p.msg.author.username+"**, you do not have this item!",3000);
			return;
		}
		var text = "**ID:** "+gem.id+"\n";
		if(gem.type=="Multiplier")
			text += "A(n) "+ranks[gem.key[0]]+" Multiplier Gem!\nWhen activated, this gem will increase your manual hunt by "+gem.amount+" for the next "+gem.length+" hunts!\nCannot stack with other Multiplier gems.";
		else if(gem.type=="Patreon")
			text += "A(n) "+ranks[gem.key[0]]+" Patreon Gem!\nWhen activated, this gem will allow you to find Patreon/Custom pets when manually hunting for the next "+gem.length+" hunts!\nYou will also hunt 1 extra animal per hunt!\nCannot stack with other Patreon gems.";
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
