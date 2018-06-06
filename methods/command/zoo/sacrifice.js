const CommandInterface = require('../../commandinterface.js');

const essence = "<a:essence:451638978299428875>";

module.exports = new CommandInterface({
	
	alias:["sacrifice","essence"],

	args:"{animal} {count}",

	desc:"Sacrifice an animal to turn them into animal essence! Animal essence is used to upgrade your huntbot!",

	example:["owo sacrifice dog","owo sacrifice bug 100"],

	related:["owo autohunt","owo upgrade"],

	cooldown:1000,
	half:120,
	six:500,

	execute: function(p){
		return;
		var global=p.global,con=p.con,msg=p.msg,args=p.args;

		var animal = global.validAnimal(args[0]);
		var count = "all";

		//If arg1 is animal
		if(temp=global.validAnimal(args[1])){
			if(animal){
				p.send("**🚫 |** Invalid arguments! The correct command is `owo sacrifice {animal} {count}`",3000);
				return;
			}
			animal = temp;
			//Check for int
			if(global.isInt(args[0])){
				count = parseInt(args[0]);
			}else if(args[0]=="all"){
				count = "all";
			}else{
				p.send("**🚫 |** Invalid arguments! The correct command is `owo sacrifice {animal} {count}`",3000);
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

		var sql = "SELECT name,count FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"';";
		console.log(sql);
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			if(result[0]==undefined||result[0].count<=0||(count!="all"&&result[0].count<count)){
				p.send("**🚫 | "+msg.author.username+"**, You can't sacrifice more than you have silly! >:c",3000);
				return;
			}
			if(count=="all")
				count = result[0].count;

			var sql = "INSERT INTO autohunt (id,essence) VALUES ("+msg.author.id+","+(count*animal.points)+") ON DUPLICATE KEY UPDATE essence = essence + "+(count*animal.points)+";";
			sql += "UPDATE animal SET count = count - "+count+" WHERE id = "+msg.author.id+" AND name = '"+result[0].name+"';";
			con.query(sql,function(err,result){
				if(err){console.error(err);return;}
				p.send("**🔪 | "+msg.author.username+"** sacrificed **"+global.unicodeAnimal(animal.value)+"x"+count+"** for a total of **"+(count*animal.price)+" "+essence+" Animal Essence**!");
			});
		});

	}

})
