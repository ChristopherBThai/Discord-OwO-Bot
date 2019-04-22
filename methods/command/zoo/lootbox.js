const CommandInterface = require('../../commandinterface.js');

const blank = "<:blank:427371936482328596>";
const box = "<:box:427352600476647425>";
const boxShake = "<a:boxshake:427004983460888588>";
const boxOpen = "<a:boxopen:427019823747301377>";
const lootboxUtil = require('./lootboxUtil.js');

module.exports = new CommandInterface({
	
	alias:["lootbox","lb"],

	args:"{amount}",

	desc:"Opens a lootbox! Check how many you have in 'owo inv'!\nYou can get some more by hunting for animals. You can get a maximum of 3 lootboxes per day.\nYou can use the items by using 'owo use {id}'",

	example:[],

	related:["owo inv","owo hunt"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){

		amount = 1;
		if(global.isInt(args[0])&&args.length==1)
			amount = parseInt(args[0]);
		
		var sql = "UPDATE IGNORE lootbox SET boxcount = boxcount - "+amount+" WHERE id = "+p.msg.author.id+" AND boxcount >= "+amount+";";
		sql += "SELECT patreonAnimal FROM user WHERE id = "+p.msg.author.id+";";

		result = await p.query(sql);

		if(result[0].changedRows==0){
			p.send("**🚫 | "+p.msg.author.username+"**, You don't have enough lootboxes!",3000);
			return;
		}
		
		var i;
		if (amount == 1)
		{
			var gem = lootboxUtil.getRandomGem(p.msg.author.id,(result[1][0]&&result[1][0].patreonAnimal==1));
			var text1 = blank+" **| "+p.msg.author.username+"** opens a lootbox\n"+boxShake+" **|** and finds a ...";
			var text2 = gem.gem.emoji+" **| "+p.msg.author.username+"** opens a lootbox\n"+boxOpen+" **|** and finds a" + ((gem.name.charAt(0)=='E' || gem.name.charAt(0)=='U') ? "n" : "") + " **"+gem.name+"**!";

			p.con.query(gem.sql,function(err,result){

				if(err){
					console.error(gem.sql);
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
		} else {
			var gems = [];
			var i;
			var sql = "";
			for (i = 0; i < amount; i++)
				gems.push(lootboxUtil.getRandomGem(p.msg.author.id,(result[1][0]&&result[1][0].patreonAnimal==1));
			
			var text1 = blank+" **| "+p.msg.author.username+"** opens "+amount+" lootboxes\n"+boxShake+" **|** and finds ...";
			var text2 = gems[i].gem.emoji+" **| "+p.msg.author.username+"** opens a lootbox\n"+boxOpen+" **|** and finds \n";
					  
			// We'll just list the gems out in lines and handle the sql string here.
			for (i = 0; i < amount; i++)
			{
				sql += "INSERT IGNORE INTO user (id) VALUES ("+p.msg.author.id+");"+gems[i].sql+"; ";
				if (i == amount - 1)
					text2 += "and ";
				text2 += "a" + ((gems[i].name.charAt(0)=='E' || gems[i].name.charAt(0)=='U') ? "n" : "") + " **"+gems[i].name+"**\n";	
			}
			text2 =+ "!";
			
			//Not sure if I did this right... vvv
			p.con.query(sql,function(err,result){

				if(err){
					console.error(sql);
					console.error(err);
					p.con.query(sql,function(err,result){
						if(err){console.error(err);return;}
					});
				}

				p.msg.channel.send(text1).then(message => setTimeout(function(){
					message.edit(text2)
						.catch(err => console.error(err));
				},3000))
				.catch(err => console.error(err));
			});
		}
	}
})
