const CommandInterface = require('../../commandinterface.js');

const essence = "<a:essence:451638978299428875>";

module.exports = new CommandInterface({
	
	alias:["sacrifice","essence","butcher"],

	args:"{animal|rank} {count}",

	desc:"Sacrifice an animal to turn them into animal essence! Animal essence is used to upgrade your huntbot!",

	example:["owo sacrifice dog","owo sacrifice rare","owo sacrifice bug 100"],

	related:["owo autohunt","owo upgrade"],

	cooldown:1000,
	half:120,
	six:500,

	execute: function(p){
		var global=p.global,con=p.con,msg=p.msg,args=p.args;

		var name = undefined;
		var count = "all";

		//if arg0 is a count
		if(global.isInt(args[0])||args[0]=="all"){
			if(args[0]!="all") count = parseInt(args[0]);
			name = args[1];

		//if arg1 is a count (or not)
		}else{
			if(global.isInt(args[1])||args[1]=="all")
				if(args[1]!="all") count = parseInt(args[1]);
			else if(args.length==2){
				p.send("**🚫 | "+msg.author.username+"**, Invalid arguments!",3000);
				return;
			}
			name = args[0];
		}

		//if its an animal...
		if(animal = global.validAnimal(name)){
			sellAnimal(msg,con,animal,count,p.send,global);

		//if rank...
		}else if(rank = global.validRank(name)){
			if(args.length!=1)
				p.send("**🚫 | "+msg.author.username+"**, The correct syntax for sacrificing ranks is `owo sacrifice {rank}`!",3000);
			else
				sellRank(msg,con,rank,p.send,global);

		//if neither...
		}else{
			p.send("**🚫 |** I could not find that animal or rank!",3000);
		}
	}

})

function sellAnimal(msg,con,animal,count,send,global){
	if(count!="all"&&count<=0){
		send("**🚫 |** You need to sacrifice more than 1 silly~",3000);
		return;
	}
	var sql = "UPDATE autohunt NATURAL JOIN animal SET essence = essence + "+(count*animal.points)+", count = count - "+count+" WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= "+count+";";
	if(count=="all"){
		sql = "SELECT count FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"';";
		sql += "UPDATE autohunt NATURAL JOIN animal SET essence = essence + (count*"+animal.points+"), count = 0 WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= 1;";
	}
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(count=="all"){
			if(result[1].affectedRows<=0){
				send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
			}else{
				count = result[0][0].count;
				send("**🔪 | "+msg.author.username+"** sacrificed **"+global.unicodeAnimal(animal.value)+"x"+count+"** for **"+essence+" "+(count*animal.points)+"**");
			}
		}else if(result.affectedRows>0){
			send("**🔪 | "+msg.author.username+"** sacrificed **"+global.unicodeAnimal(animal.value)+"x"+count+"** for **"+essence+" "+(count*animal.points)+"**");
		}else{
			send("**🚫 | "+msg.author.username+"**, You can't sacrifice more than you have silly! >:c",3000);
		}
	});
}

function sellRank(msg,con,rank,send,global){
	var animals = "('"+rank.animals.join("','")+"')";
	var sql = "SELECT SUM(count) AS total FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+";";
	sql += "UPDATE autohunt SET essence = essence + ((SELECT COALESCE(SUM(count),0) FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+")*"+rank.points+") WHERE id = "+msg.author.id+";";
	sql += "UPDATE animal SET count = 0 WHERE id = "+msg.author.id+" AND name IN "+animals+" AND count > 0;";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(result[2].affectedRows<=0){
			send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
		}else{
			count = result[0][0].total;
			send("**🔪 | "+msg.author.username+"** sacrificed **"+rank.emoji+"x"+count+"** for **"+essence+" "+(count*rank.points)+"**");
		}
	});
}
