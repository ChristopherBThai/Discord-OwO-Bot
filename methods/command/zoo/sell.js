const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["sell","butcher"],

	args:"{animal} {count}",

	desc:"Sell animals from your zoo! Selling animals will NOT affect your zoo score!",

	example:["owo sell dog","owo sell cat 1","owo sell ladybug all","owo sell all"],

	related:["owo hunt","owo sell"],

	cooldown:1000,
	half:150,
	six:500,

	execute: function(p){
		var global=p.global,con=p.con,msg=p.msg,args=p.args;

		var animal = global.validAnimal(args[0]);
		var count = "all";

		//If arg1 is animal
		if(temp=global.validAnimal(args[1])){
			if(animal){
				p.send("**🚫 |** Invalid arguments! The correct command is `owo sell {animal} {count}`",3000);
				return;
			}
			animal = temp;
			//Check for int
			if(global.isInt(args[0])){
				count = parseInt(args[0]);
			}else if(args[0]=="all"){
				count = "all";
			}else{
				p.send("**🚫 |** Invalid arguments! The correct command is `owo sell {animal} {count}`",3000);
				return;
			}

		//If arg0 is animal
		}else if(global.isInt(args[1])){
			count = parseInt(args[1]);
		}else if(args[1]=="all"){
			count = "all";
		}
		
		//Check if valid args
		if(!animal){
			p.send("**🚫 |** I could not find that animal!",3000);
			return;
		}
		if(count!="all"&&count<=0){
			p.send("**🚫 |** You need to sell more than 1 silly~",3000);
			return;
		}

		var sql = "UPDATE cowoncy NATURAL JOIN animal SET money = money + "+(count*animal.price)+", count = count - "+count+" WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= "+count+";";
		if(count=="all"){
			sql = "SELECT count FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"';";
			sql += "UPDATE cowoncy NATURAL JOIN animal SET money = money + (count*"+animal.price+"), count = 0 WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= 1;";
		}
		con.query(sql,function(err,result){
			if(err) throw err;
			if(count=="all"){
				if(result[1].affectedRows<=0){
					p.send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
				}else{
					count = result[0][0].count;
					p.send("**🔪 | "+msg.author.username+"** sold **"+global.unicodeAnimal(animal.value)+"x"+count+"** for a total of **<:cowoncy:416043450337853441> "+(count*animal.price)+"**");
				}
			}else if(result.affectedRows>0){
				p.send("**🔪 | "+msg.author.username+"** sold **"+global.unicodeAnimal(animal.value)+"x"+count+"** for a total of **<:cowoncy:416043450337853441> "+(count*animal.price)+"**");
			}else{
				p.send("**🚫 | "+msg.author.username+"**, You can't sell more than you have silly! >:c",3000);
			}
		});
	}

})
