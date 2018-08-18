const CommandInterface = require('../../commandinterface.js');

const essence = "<a:essence:451638978299428875>";

module.exports = new CommandInterface({
	
	alias:["sacrifice","essence","butcher","sac","sc"],

	args:"{animal|rank} {count}",

	desc:"Sacrifice an animal to turn them into animal essence! Animal essence is used to upgrade your huntbot!",

	example:["owo sacrifice dog","owo sacrifice rare","owo sacrifice bug 100"],

	related:["owo autohunt","owo upgrade"],

	cooldown:1000,
	half:120,
	six:500,
	bot:true,

	execute: function(p){
		var global=p.global,con=p.con,msg=p.msg,args=p.args;

		var name = undefined;
		var count = 1;

		//if arg0 is a count
		if(global.isInt(args[0])||args[0]=="all"){
			if(args[0]!="all") count = parseInt(args[0]);
			else count = "all";
			name = args[1];

		//if arg1 is a count (or not)
		}else{
			if(global.isInt(args[1])||args[1]=="all"){
				if(args[1]!="all") count = parseInt(args[1]);
				else count = "all";
			}else if(args.length==2){
				p.send("**🚫 | "+msg.author.username+"**, Invalid arguments!",3000);
				return;
			}
			name = args[0];
		}

		if(name)
			name = name.toLowerCase();

		//if its an animal...
		if(animal = global.validAnimal(name)){
			if(args.length<3)
				sellAnimal(msg,con,animal,count,p.send,global);
			else
				p.send("**🚫 | "+msg.author.username+"**, The correct syntax for sacrificing ranks is `owo sacrifice {animal} {count}`!",3000);

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
	var sql = "SELECT count FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"';";
	if(count=="all"){
		sql += "INSERT INTO autohunt (id,essence) VALUES ("+msg.author.id+",((SELECT COALESCE(SUM(count),0) FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"')*"+animal.points+")) ON DUPLICATE KEY UPDATE essence = essence + ((SELECT COALESCE(SUM(count),0) FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"')*"+animal.points+");";
		sql += "UPDATE animal SET saccount = saccount + count, count = 0 WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count > 0;";
	}else{
		var points = "(IF((SELECT COALESCE(SUM(count),0) FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= "+count+")>="+count+","+count+",0))";
		sql += "INSERT INTO autohunt (id,essence) VALUES ("+msg.author.id+","+points+"*"+animal.points+") ON DUPLICATE KEY UPDATE essence = essence + ("+points+"*"+animal.points+");";
		sql += "UPDATE animal SET count = count - "+count+", saccount = saccount + "+count+" WHERE id = "+msg.author.id+" AND name = '"+animal.value+"' AND count >= "+count+";";
	}
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(count=="all"){
			if(!result[0][0]||result[0][0].count<=0){
				send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
			}else{
				count = result[0][0].count;
				send("**🔪 | "+msg.author.username+"** sacrificed **"+global.unicodeAnimal(animal.value)+"x"+count+"** for **"+essence+" "+(global.toFancyNum(count*animal.points))+"**");
			}
		}else if(result[2]&&result[2].affectedRows>0){
			send("**🔪 | "+msg.author.username+"** sacrificed **"+global.unicodeAnimal(animal.value)+"x"+count+"** for **"+essence+" "+(global.toFancyNum(count*animal.points))+"**");
		}else{
			send("**🚫 | "+msg.author.username+"**, You can't sacrifice more than you have silly! >:c",3000);
		}
	});
}

function sellRank(msg,con,rank,send,global){
	var animals = "('"+rank.animals.join("','")+"')";
	var points = "((SELECT COALESCE(SUM(count),0) FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+")*"+rank.points+")";

	var sql = "SELECT COALESCE(SUM(count),0) AS total FROM animal WHERE id = "+msg.author.id+" AND name IN "+animals+";";
	sql += "INSERT INTO autohunt (id,essence) VALUES ("+msg.author.id+","+points+") ON DUPLICATE KEY UPDATE essence = essence + "+points+";";
	sql += "UPDATE animal SET saccount = saccount + count, count = 0 WHERE id = "+msg.author.id+" AND name IN "+animals+" AND count > 0;";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(result[2].affectedRows<=0){
			send("**🚫 | "+msg.author.username+"**, You don't have enough animals! >:c",3000);
		}else{
			count = result[0][0].total;
			send("**🔪 | "+msg.author.username+"** sacrificed **"+rank.emoji+"x"+count+"** for **"+essence+" "+(global.toFancyNum(count*rank.points))+"**");
		}
	});
}
