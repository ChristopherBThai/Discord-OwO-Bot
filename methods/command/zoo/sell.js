const CommandInterface = require('../../commandinterface.js');

const ranks = {};
const animals = require('../../../../tokens/owo-animals.json');
const weaponUtil = require('../battle/util/weaponUtil.js');

module.exports = new CommandInterface({

	alias:["sell"],

	args:"{animal|rank} {count}",

	desc:"Sell animals from your zoo! Selling animals will NOT affect your zoo score!",

	example:["owo sell dog","owo sell cat 1","owo sell ladybug all","owo sell uncommon","owo sell all"],

	related:["owo hunt"],

	cooldown:1000,
	half:150,
	six:500,
	bot:true,

	execute: async function(p){
		var global=p.global,con=p.con,msg=p.msg,args=p.args;

		var name = undefined;
		var count = 1;
		var ranks;
		
		/* If no args */
		if(args.length==0){
			p.send("**🚫 | "+msg.author.username+"**, Please specify what rank/animal to sell!",3000);
			return;

		/* if arg0 is a count */
		}else if(args.length==2&&(global.isInt(args[0])||args[0].toLowerCase()=="all")){
			if(args[0].toLowerCase()!="all") count = parseInt(args[0]);
			else count = "all";
			name = args[1];

		/* if arg1 is a count (or not) */
		}else if(args.length==2&&(global.isInt(args[1])||args[1].toLowerCase()=="all")){
			if(args[1].toLowerCase()!="all") count = parseInt(args[1]);
			else count = "all";
			name = args[0];

		/* Only one argument */
		}else if(args.length==1){
			/* If its an int, it's a weapon id */
			if(p.global.isInt(args[0])){
				await weaponUtil.sell(p,parseInt(args[0]));
				return;
			}else if(args[0].toLowerCase()=="all")
				ranks = global.getAllRanks();
			else
				name = args[0];

		/* Multiple ranks */
		}else{
			ranks = {}
			for(i=0;i<args.length;i++){
				let tempRank = global.validRank(args[i].toLowerCase());
				if(!tempRank){
					p.send("**🚫 | "+msg.author.username+"**, Invalid arguments!",3000);
					return;
				}
				if(!(tempRank in ranks)){
					ranks[tempRank.rank] = tempRank;
				}
			}
		}

		if(name) name = name.toLowerCase();

		/* If multiple ranks */
		if(ranks){
			sellRanks(msg,con,ranks,p.send,global,p);

		//if its an animal...
		}else if(animal = global.validAnimal(name)){
			if(args.length<3)
				sellAnimal(msg,con,animal,count,p.send,global,p);
			else
				p.send("**🚫 | "+msg.author.username+"**, The correct syntax for selling ranks is `owo sell {animal} {count}`!",3000);

		//if rank...
		}else if(rank = global.validRank(name)){
			if(args.length!=1)
				p.send("**🚫 | "+msg.author.username+"**, The correct syntax for selling ranks is `owo sell {rank}`!",3000);
			else
				sellRank(msg,con,rank,p.send,global,p);

		//if neither...
		}else{
			p.send("**🚫 |** I could not find that animal or rank!",3000);
		}
	}

})

function sellAnimal(msg,con,animal,count,send,global,p){
	if(count!="all"&&count<=0){
		send("**🚫 |** You need to sell more than 1 silly~",3000);
		return;
	}
	var sql = "UPDATE cowoncy NATURAL JOIN animal SET money = money + "+(count*animal.price)+", count = count - "+count+", sellcount = sellcount + "+count+" WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= "+count+";";
	if(count=="all"){
		sql = "SELECT count FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"';";
		sql += "UPDATE cowoncy NATURAL JOIN animal SET money = money + (count*"+animal.price+"), sellcount = sellcount + count, count = 0 WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= 1;";
	}
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(count=="all"){
			if(result[1].affectedRows<=0){
				send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
			}else{
				count = result[0][0].count;
				send("**🔪 | "+msg.author.username+"** sold **"+global.unicodeAnimal(animal.value)+"x"+count+"** for a total of **<:cowoncy:416043450337853441> "+(global.toFancyNum(count*animal.price))+"**");
				p.logger.value('cowoncy',(count*animal.price),['command:sell','id:'+msg.author.id]);
			}
		}else if(result.affectedRows>0){
			send("**🔪 | "+msg.author.username+"** sold **"+global.unicodeAnimal(animal.value)+"x"+count+"** for a total of **<:cowoncy:416043450337853441> "+(global.toFancyNum(count*animal.price))+"**");
				p.logger.value('cowoncy',(count*animal.price),['command:sell','id:'+msg.author.id]);
		}else{
			send("**🚫 | "+msg.author.username+"**, You can't sell more than you have silly! >:c",3000);
		}
	});
}

function sellRank(msg,con,rank,send,global,p){
	var animals = "('"+rank.animals.join("','")+"')";
	var sql = "SELECT SUM(count) AS total FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+";";
	sql += "UPDATE cowoncy SET money = money + ((SELECT COALESCE(SUM(count),0) FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+")*"+rank.price+") WHERE id = "+msg.author.id+";";
	sql += "UPDATE animal SET sellcount = sellcount + count, count = 0 WHERE id = "+msg.author.id+" AND name IN "+animals+" AND count > 0;";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(result[2].affectedRows<=0){
			send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
		}else{
			count = result[0][0].total;
			send("**🔪 | "+msg.author.username+"** sold **"+rank.emoji+"x"+count+"** for a total of **<:cowoncy:416043450337853441> "+(global.toFancyNum(count*rank.price))+"**");
			p.logger.value('cowoncy',(count*rank.price),['command:sell','id:'+msg.author.id]);
		}
	});
}

function sellRanks(msg,con,ranks,send,global,p){
	var sql = "";
	for(i in ranks){
		let rank = ranks[i];
		var animals = "('"+rank.animals.join("','")+"')";
		sql += "SELECT SUM(count) AS total FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+";";
		sql += "UPDATE cowoncy SET money = money + ((SELECT COALESCE(SUM(count),0) FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+")*"+rank.price+") WHERE id = "+msg.author.id+";";
		sql += "UPDATE animal SET sellcount = sellcount + count, count = 0 WHERE id = "+msg.author.id+" AND name IN "+animals+" AND count > 0;";
	}
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		let sold = "";
		let total = 0;
		let count = 0;
		for(i in ranks){
			let rank = ranks[i];
			let sellCount = result[count*3][0].total;
			if(sellCount>0){
				sold += rank.emoji+"x"+result[count*3][0].total+" ";
				total += sellCount * rank.price;
			}
			count++;
		}
		if(sold!=""){
			sold = sold.slice(0,-1);
			send("**🔪 | "+msg.author.username+"** sold **"+sold+"** for a total of **<:cowoncy:416043450337853441> "+(global.toFancyNum(total))+"**");
			p.logger.value('cowoncy',(total),['command:sell','id:'+msg.author.id]);
		}else
			send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
	});
}
