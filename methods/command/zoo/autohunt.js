const CommandInterface = require('../../commandinterface.js');

const autohuntutil = require('./autohuntutil.js');
const animalUtil = require('./animalUtil.js');
const global = require('../../../util/global.js');
const letters = "abcdefghijklmnopqrstuvwxyz";
const botrank = "SELECT (COUNT(*)) AS rank, (SELECT COUNT(*) FROM autohunt) AS total FROM autohunt WHERE (essence+duration+efficiency+cost) >= COALESCE((SELECT (essence+duration+efficiency+cost) AS total FROM autohunt WHERE id = ";
const logger = require('../../../util/logger.js');

module.exports = new CommandInterface({
	
	alias:["autohunt","huntbot","hb"],

	args:"{cowoncy}",

	desc:"Use autohunt to hunt for animals automatically! Upgrade huntbot for more efficient hunts!",

	example:["owo autohunt","owo autohunt 1000"],

	related:["owo sacrifice","owo upgrade"],

	cooldown:1000,
	half:100,
	six:500,

	execute: function(p){
		var args=p.args,con=p.con;
		if(args.length==0)
			display(p.msg,con,p.send);
		else
			autohunt(p.msg,con,p.args,p.global,p.send);
	}

});

function claim(msg,con,query,bot){
	var timer = parseInt(query.timer);
	if(timer<query.huntmin){
		var time = query.huntmin-timer;
		var min = time%60;
		var hour = Math.trunc(time/60);
		var percent = generatePercent(timer,query.huntmin,25);
		return {time:(((hour>0)?hour+"H ":"")+min+"M"),bar:percent.bar,percent:percent.percent,count:Math.trunc(query.huntcount*(timer/query.huntmin))};
	}

	var sql = "SELECT patreonAnimal FROM user WHERE id = "+msg.author.id+";";
	sql += "UPDATE autohunt SET huntmin = 0,huntcount=0 WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		var patreon = false;
		if(result[0][0]&&result[0][0].patreonAnimal==1)
			patreon = true;
		var total = {};
		var digits = 1;
		for(var i=0;i<query.huntcount;i++){
			var animal = animalUtil.randAnimal(patreon);
			if(total[animal[1]]){
				total[animal[1]].count++;
				if(total[animal[1]].count>digits)
					digits = total[animal[1]].count;
			}else{
				total[animal[1]] = {count:1,rank:animal[2]};
			}
		}
		digits= Math.trunc(Math.log10(digits)+1);
		var text = "**"+bot+" |** `BEEP BOOP. I AM BACK WITH "+query.huntcount+" ANIMALS`";
		var count = 0;
		sql = "";
		for(var animal in total){
			if(count%5==0)
				text += "\n**<:blank:427371936482328596> |** ";
			text += animal+animalUtil.toSmallNum(total[animal].count,digits)+"  ";
			count++;
			sql += "INSERT INTO animal (id,name,count,totalcount) VALUES ("+msg.author.id+",'"+animal+"',"+total[animal].count+","+total[animal].count+") ON DUPLICATE KEY UPDATE count = count + "+total[animal].count+",totalcount = totalcount + "+total[animal].count+";";
			sql += "INSERT INTO animal_count (id,"+total[animal].rank+") VALUES ("+msg.author.id+","+total[animal].count+") ON DUPLICATE KEY UPDATE "+total[animal].rank+" = "+total[animal].rank+"+"+total[animal].count+";";
		}
		con.query(sql,function(err,result){
			if(err) {console.error(err);return;}
			msg.channel.send(text).catch(err => {console.error(err)});
		});
	});
}

function autohunt(msg,con,args,global,send){
	var cowoncy;
	var password;
	if(global.isInt(args[0])){
		cowoncy = parseInt(args[0]);
		password = args[1];
	}else if(global.isInt(args[1])){
		cowoncy = parseInt(args[1]);
		password = args[0];
	}

	if(password)
		password = password.toLowerCase();

	if(!cowoncy){
		send("**🚫 | "+msg.author.username+"**, Wrong syntax!",3000);
		return;
	}
	
	if(cowoncy<=0){
		send("**🚫 | "+msg.author.username+"**, Invalid cowoncy amount!",3000);
		return;
	}

	var sql = "SELECT *,TIMESTAMPDIFF(MINUTE,start,NOW()) AS timer,TIMESTAMPDIFF(MINUTE,passwordtime,NOW()) AS pwtime FROM autohunt WHERE id = "+msg.author.id+";";
	sql += "SELECT * FROM cowoncy WHERE id = "+msg.author.id+";";
	sql += botrank + msg.author.id+"),0);";
	con.query(sql,function(err,result){
		if(err){console.error(err);return;}

		//Get emoji
		var bot = autohuntutil.getBot(result[2][0]);

		//Check if still hunting
		var hunting;
		if(result[0][0]&&result[0][0].huntmin!=0){
			hunting = claim(msg,con,result[0][0],bot);
			if(hunting)
				send("**"+bot+" |** `BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN "+hunting.time+"`\n**<:blank:427371936482328596> |** `"+hunting.percent+"% DONE | "+hunting.count+" ANIMALS CAPTURED`\n**<:blank:427371936482328596> |** "+hunting.bar);
			return;
		}

		//Check if enough cowoncy
		if(!result[1][0]||result[1][0].money<cowoncy){
			send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
			return;
		}

		//Check if password
		//no pw set
		if(!result[0][0]||result[0][0].password==undefined||result[0][0].password==''||result[0][0].pwtime>=10){
			var rand = "";
			for(var i=0;i<5;i++)
				rand += letters.charAt(Math.floor(Math.random()*letters.length));
			sql = "INSERT INTO autohunt (id,start,huntcount,huntmin,password,passwordtime) VALUES ("+msg.author.id+",NOW(),0,0,'"+rand+"',NOW()) ON DUPLICATE KEY UPDATE password = '"+rand+"',passwordtime = NOW();";
			con.query(sql,function(err,result){
				if(err){console.error(err);return;}
				autohuntutil.captcha(msg,rand,"**"+bot+" | "+msg.author.username+"**, Here is your password!\n**<:blank:427371936482328596> |** Use the command `owo autohunt "+cowoncy+" {password}`");
			});
			return;
		}
		//pw is set and wrong
		if(result[0][0].password!=password){
			if(!password)
				send("**🚫 | "+msg.author.username+"**, Please include your password! The command is `owo autohunt "+cowoncy+" {password}`!\n**<:blank:427371936482328596> |** Password will reset in "+(10-result[0][0].pwtime)+" minutes");
			else
				send("**🚫 | "+msg.author.username+"**, Wrong password! The command is `owo autohunt "+cowoncy+" {password}`!\n**<:blank:427371936482328596> |** Password will reset in "+(10-result[0][0].pwtime)+" minutes");
			return;
		}

		//Extract info
		var duration,efficiency,cost,essence,maxhunt;
		if(result[0][0]){
			duration = autohuntutil.getLvl(result[0][0].duration,0,"duration");
			efficiency= autohuntutil.getLvl(result[0][0].efficiency,0,"efficiency");
			cost= autohuntutil.getLvl(result[0][0].cost,0,"cost");
			essence = result[0][0].essence;
		}else{
			duration = autohuntutil.getLvl(0,0,"duration");
			efficiency= autohuntutil.getLvl(0,0,"efficiency");
			cost= autohuntutil.getLvl(0,0,"cost");
			essence = 0;
		}
		maxhunt = Math.floor(duration.stat*efficiency.stat);

		//Format cowoncy
		cowoncy -= cowoncy%cost.stat;
		if(cowoncy>maxhunt*cost.stat)
			cowoncy = maxhunt*cost.stat;

		var huntcount = Math.trunc(cowoncy/cost.stat);
		var huntmin = Math.ceil((huntcount/efficiency.stat)*60);

		var sql = "UPDATE cowoncy SET money = money - "+cowoncy+" WHERE id = "+msg.author.id+";";
		sql += "INSERT INTO autohunt (id,start,huntcount,huntmin,password) VALUES ("+msg.author.id+",NOW(),"+huntcount+","+huntmin+",'') ON DUPLICATE KEY UPDATE start = NOW(), huntcount = "+huntcount+",huntmin = "+huntmin+",password = '';";
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			logger.value('cowoncy',cowoncy,['command:autohunt','id:'+msg.author.id,'amount:'+cowoncy]);
			var min = huntmin%60;
			var hour = Math.trunc(huntmin/60);
			var timer = "";
			if(hour>0) timer = hour+"H"+min+"M";
			else timer = min+"M";
			send("**"+bot+" |** `BEEP BOOP. `**`"+msg.author.username+"`**`, YOU SPENT "+cowoncy+" cowoncy`\n**<:blank:427371936482328596> |** `I WILL BE BACK IN "+timer+" WITH "+huntcount+" ANIMALS`");
		});
	});
}

function display(msg,con,send){
	var sql = "SELECT *,TIMESTAMPDIFF(MINUTE,start,NOW()) AS timer FROM autohunt WHERE id = "+msg.author.id+";";
	sql += botrank + msg.author.id+"),0);";
	con.query(sql,function(err,result){
		if(err){console.error(err);return;}
		
		//Get emoji
		var bot = autohuntutil.getBot(result[1][0]);

		var hunting;
		if(result[0][0]&&result[0][0].huntmin!=0){
			hunting = claim(msg,con,result[0][0],bot);
			if(!hunting)
				return;
		}
		var duration,efficiency,cost,essence,maxhunt;
		if(result[0][0]){
			duration = autohuntutil.getLvl(result[0][0].duration,0,"duration");
			efficiency= autohuntutil.getLvl(result[0][0].efficiency,0,"efficiency");
			cost= autohuntutil.getLvl(result[0][0].cost,0,"cost");
			essence = result[0][0].essence;
		}else{
			duration = autohuntutil.getLvl(0,0,"duration");
			efficiency= autohuntutil.getLvl(0,0,"efficiency");
			cost= autohuntutil.getLvl(0,0,"cost");
			essence = 0;
		}

		duration.percent = generatePercent(duration.currentxp,duration.maxxp).bar;
		efficiency.percent = generatePercent(efficiency.currentxp,efficiency.maxxp).bar;
		cost.percent = generatePercent(cost.currentxp,cost.maxxp).bar;

		if(duration.max) duration.value = "`Lvl "+duration.lvl+" [MAX]`\n"+generatePercent(1,1).bar;
			else duration.value = "`Lvl "+duration.lvl+" ["+duration.currentxp+"/"+duration.maxxp+"]`\n"+duration.percent;
		if(efficiency.max) efficiency.value = "`Lvl "+efficiency.lvl+" [MAX]`\n"+generatePercent(1,1).bar;
			else efficiency.value = "`Lvl "+efficiency.lvl+" ["+efficiency.currentxp+"/"+efficiency.maxxp+"]`\n"+efficiency.percent;
		if(cost.max) cost.value = "`Lvl "+cost.lvl+" [MAX]`\n"+generatePercent(1,1).bar;
			else cost.value = "`Lvl "+cost.lvl+" ["+cost.currentxp+"/"+cost.maxxp+"]`\n"+cost.percent;

		maxhunt = Math.floor(duration.stat*efficiency.stat);
		const embed = {
			"color": 4886754,
			"author": {
				"name": msg.author.username+"'s HuntBot",
				"icon_url": msg.author.avatarURL
				},
			"fields": [{
					"name": bot+" `BEEP. BOOP. I AM HUNTBOT. I WILL HUNT FOR YOU MASTER.`",
					"value": "Use the command `owo autohunt {cowoncy}` to get started.\nYou can use `owo upgrade {trait}` to upgrade the traits below.\nTo obtain more essence, use `owo sacrifice {animal} {count}`.\n\n",
					"inline":false 
				},
				{
					"name": "⏱ Efficiency - `"+efficiency.stat+efficiency.prefix+"`",
					"value": efficiency.value,
					"inline": true
				},
				{
					"name": "⏳ Duration - `"+duration.stat+duration.prefix+"`",
					"value": duration.value,
					"inline": true
				},
				{
					"name": "<:cowoncy:416043450337853441> Cost - `"+cost.stat+cost.prefix+"`",
					"value": cost.value,
					"inline": true
				},
				{
					"name": "<a:essence:451638978299428875> Animal Essence - `"+essence+"`",
					"value": "`Current Max Autohunt: "+maxhunt+" animals for "+(maxhunt*cost.stat)+" cowoncy`",
					"inline": false 
				}
				]
		};
		if(hunting){
			embed.fields.push({
				"name": bot+" HUNTBOT is currently hunting!",
				"value": "`BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN "+hunting.time+"`\n`"+hunting.percent+"% DONE | "+hunting.count+" ANIMALS CAPTURED`\n"+hunting.bar
			});
		}
		msg.channel.send({ embed })
			.catch(err => msg.channel.send("**🚫 |** I don't have permission to send embedded links! :c")
				.catch(err => console.error(err)));
	});
}

function generatePercent(current,max,length){
	var percent = current/max;
	var result = "`[";
	if(!length) length = 16;
	for(var i=0;i<length;i++){
		if(i<percent*length)
			result += "■";
		else
			result += "□";
	}
	percent = Math.trunc(percent*10000)/100;
	result += "]`";
	return {bar:result,percent:percent};
}
