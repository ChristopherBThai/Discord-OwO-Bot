const CommandInterface = require('../../commandinterface.js');

const blank = "<:blank:427371936482328596>";
const box = "<:box:427352600476647425>";
const boxShake = "<a:boxshake:427004983460888588>";
const boxOpen = "<a:boxopen:427019823747301377>";
const lootboxUtil = require('./lootboxUtil.js');

module.exports = new CommandInterface({
	
	alias:["lootbox","lb"],

	args:"",

	desc:"Opens a lootbox! Check how many you have in 'owo inv'!\nYou can get some more by hunting for animals. You can get a maximum of 3 lootboxes per day.\nYou can use the items by using 'owo use {id}'",

	example:[],

	related:["owo inv","owo hunt"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		var sql = "UPDATE IGNORE lootbox SET boxcount = boxcount - 1 WHERE id = "+p.msg.author.id+" AND boxcount > 0;";
		sql += "SELECT patreonAnimal FROM user WHERE id = "+p.msg.author.id+";";
		p.con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			if(result[0].changedRows==0){
				p.send("**🚫 | "+p.msg.author.username+"**, You don't have any lootboxes!",3000);
				return;
			}
			var gem = lootboxUtil.getRandomGem(p.msg.author.id,(result[1][0]&&result[1][0].patreonAnimal==1));
			var text1 = blank+" **| "+p.msg.author.username+"** opens a lootbox\n"+boxShake+" **|** and finds a ...";
			var text2 = gem.gem.emoji+" **| "+p.msg.author.username+"** opens a lootbox\n"+boxOpen+" **|** and finds a" + ((gem.name.charAt(0)=='E' || gem.name.charAt(0)=='U') ? "n" : "") + " **"+gem.name+"**!";
			p.con.query(gem.sql,function(err,result){
				if(err){
					console.error(err);
					p.con.query("INSERT IGNORE INTO user (id) VALUES ("+p.msg.author.id+");"+gem.sql,function(err,result){
						if(err){console.error(err);return;}
					});
				}

				p.msg.channel.send(text1).then(message => setTimeout(function(){
					message.edit(text2)
						.catch(err => console.error(err));
				},3000))
				.catch(err => console.error(err));
			});
		});
	}
})


