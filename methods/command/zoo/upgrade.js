const CommandInterface = require('../../commandinterface.js');

const autohuntUtil = require('./autohuntutil.js');
const essence = "<a:essence:451638978299428875>";
const traits = {};
const cooldown = ["cooldown","timer"];
for(var i=0;i<cooldown.length;i++)
	traits[cooldown[i]] = "cooldown";
const cost = ["cost","price"];
for(var i=0;i<cost.length;i++)
	traits[cost[i]] = "cost";
const duration = ["duration","totaltime","time"];
for(var i=0;i<duration.length;i++)
	traits[duration[i]] = "duration";


module.exports = new CommandInterface({
	
	alias:["upgrade"],

	args:"{trait} {count}",

	desc:"Use animal essence to upgrade autohunt!",

	example:["owo upgrade cooldown 200","owo upgrade cost 5000"],

	related:["owo autohunt","owo sacrifice"],

	cooldown:1000,
	half:120,
	six:500,

	execute: function(p){
		var global=p.global,con=p.con,msg=p.msg,args=p.args;

		var count = undefined;
		var trait = undefined;

		//if arg0 is an int
		if(global.isInt(args[0])){
			trait = traits[args[1]];
			count = parseInt(args[0]);

		//if arg1 is an int
		}else if(global.isInt(args[1])){
			trait = traits[args[0]];
			count = parseInt(args[1]);

		}else{
			p.send("**🚫 |** Please include how many animal essence to use!",3000);
			return;
		}
		
		//Check if valid args
		if(!trait){
			p.send("**🚫 |** I could not find that autohunt trait!\n**<:blank:427371936482328596> |** You can choose from: `cooldown`, `duration`, or `cost`",3000);
			return;
		}
		if(!count||count<=0){
			p.send("**🚫 |** You need to use more than 1 animal essence silly~",3000);
			return;
		}

		var sql = "SELECT * FROM autohunt WHERE id = "+msg.author.id+";";
		sql += "UPDATE autohunt SET essence = essence - "+count+","+trait+"="+trait+"+"+count+" WHERE id = "+msg.author.id+" AND essence >= "+count+";";
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			console.log(result);
			if(!result[0][0]||result[1].affectedRows==0){
				p.send("**🚫 | "+msg.author.username+"** You do not have enough animal essence!",3000);
				return;
			}
			var stat = autohuntUtil.getLvl(result[0][0][trait],count,trait);
			var text = "** | "+msg.author.username+"**, You successfully upgraded `"+trait+"` with "+essence+" **"+count+"**!"; 
			if(stat.lvlup)
				text += "\n**<:blank:427371936482328596> |** HuntBot Leveled Up!!";
			text += "\n**<:blank:427371936482328596> |** `"+trait+": "+stat.stat+stat.prefix+" -  Lvl "+stat.lvl+" ["+stat.currentxp+"/"+stat.maxxp+"]`";
			p.send(text);
		});

	}

})
