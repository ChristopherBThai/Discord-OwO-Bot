const CommandInterface = require('../../commandinterface.js');

const autohuntutil = require('./autohuntutil.js');

module.exports = new CommandInterface({
	
	alias:["autohunt","huntbot"],

	args:"TODO",

	desc:"TODO",

	example:["TODO"],

	related:["owo sacrifice","owo upgrade"],

	cooldown:5000,
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

function claim(msg,con,query){
	return true;
}

function autohunt(msg,con,args,global,send){
	var cowoncy;
	if(global.isInt(args[0])){
		cowoncy = parseInt(args[0]);
	}else{
		send("**🚫 | "+msg.author.username+"**, Wrong syntax!",3000);
		return;
	}
	
	if(cowoncy<=0){
		send("**🚫 | "+msg.author.username+"**, Invalid cowoncy amount!",3000);
		return;
	}

	var sql = "SELECT *,TIMESTAMPDIFF(MINUTE,NOW(),start) AS timer FROM autohunt WHERE id = "+msg.author.id+";";
	sql += "SELECT * FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err){console.error(err);return;}

		//Check if still hunting
		var hunting;
		if(result[0]&&result[0].huntmin!=0){
			hunting = claim(msg,con);
			if(!hunting)
				return;
		}

		//Check if enough cowoncy
		if(!result[1][0]||result[1][0].money<cowoncy){
			send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
			return;
		}

		//Extract info
		var duration,cooldown,cost,essence,maxhunt;
		if(result[0][0]){
			duration = autohuntutil.getLvl(result[0][0].duration,0,"duration");
			cooldown= autohuntutil.getLvl(result[0][0].cooldown,0,"cooldown");
			cost= autohuntutil.getLvl(result[0][0].cost,0,"cost");
			essence = result[0][0].essence;
		}else{
			duration = autohuntutil.getLvl(0,0,"duration");
			cooldown= autohuntutil.getLvl(0,0,"cooldown");
			cost= autohuntutil.getLvl(0,0,"cost");
			essence = 0;
		}
		maxhunt = Math.floor((duration.stat*60*60)/cooldown.stat);

		//Format cowoncy
		cowoncy -= cowoncy%cost.stat;
		if(cowoncy>maxhunt*cost.stat)
			cowoncy = maxhunt*cost.stat;

		var huntcount = Math.trunc(cowoncy/cost.stat);
		var huntmin = Math.ceil((huntcount*cooldown.stat)/60);

		var sql = "UPDATE cowoncy SET money = money - "+cowoncy+" WHERE id = "+msg.author.id+";";
		sql += "INSERT INTO autohunt (id,start,huntcount,huntmin) VALUES ("+msg.author.id+",NOW(),"+huntcount+","+huntmin+") ON DUPLICATE KEY UPDATE start = NOW(), huntcount = "+huntcount+",huntmin = "+huntmin+";";
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			var min = huntmin%60;
			var hour = huntmin/60;
			var timer = "";
			if(hour>0) timer = hour+"H"+min+"M";
			else timer = min+"M";
			send("**🤖 |** `BEEP BOOP. `**`"+msg.author.username+"`**` YOU SPENT `**`"+cowoncy+"`**\n** |** `I WILL BE BACK IN `**`"+timer+"`**` WITH `**`"+huntcount+"`**` ANIMALS`");
		});
	});
}

function display(msg,con,send){
	var sql = "SELECT *,TIMESTAMPDIFF(MINUTE,NOW(),start) AS timer FROM autohunt WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err){console.error(err);return;}
		var hunting;
		if(result[0]&&result[0].huntmin!=0){
			hunting = claim(msg,con);
			if(!hunting)
				return;
		}
		var duration,cooldown,cost,essence,maxhunt;
		if(result[0]){
			duration = autohuntutil.getLvl(result[0].duration,0,"duration");
			cooldown= autohuntutil.getLvl(result[0].cooldown,0,"cooldown");
			cost= autohuntutil.getLvl(result[0].cost,0,"cost");
			essence = result[0].essence;
		}else{
			duration = autohuntutil.getLvl(0,0,"duration");
			cooldown= autohuntutil.getLvl(0,0,"cooldown");
			cost= autohuntutil.getLvl(0,0,"cost");
			essence = 0;
		}
		maxhunt = Math.floor((duration.stat*60*60)/cooldown.stat);
		const embed = {
			"title": " `BEEP. BOOP. I AM HUNTBOT. I WILL HUNT FOR YOU MASTER.`",
		 	"description": "Use the command `owo autohunt {cowoncy}` to get started.\nYou can use `owo upgrade {trait}` to upgrade the traits below.\nTo obtain more essence, use `owo sacrifice {animal} {count}`.",
			"color": 4886754,
			"author": {
				"name": "Scuttler's HuntBot",
				"icon_url": msg.author.avatarURL
				},
			"fields": [{
					"name": "⏱ Cooldown - `"+cooldown.stat+cooldown.prefix+"`",
					"value": "`Lvl "+cooldown.lvl+" ["+cooldown.currentxp+"/"+cooldown.maxxp+"]`",
					"inline": true
				},
				{
					"name": "⏳ Duration - `"+duration.stat+duration.prefix+"`",
					"value": "`Lvl "+duration.lvl+" ["+duration.currentxp+"/"+duration.maxxp+"]`",
					"inline": true
				},
				{
					"name": "<:cowoncy:416043450337853441> Cost - `"+cost.stat+cost.prefix+"`",
					"value": "`Lvl "+cost.lvl+" ["+cost.currentxp+"/"+cost.maxxp+"]`",
					"inline": true
				},
				{
					"name": "<a:essence:451638978299428875> Animal Essence - `"+essence+"`",
					"value": "`Current Max Autohunt: "+maxhunt+" animals for "+(maxhunt*cost.stat)+" cowoncy`",
					"inline": false 
				}
				]
		};
		msg.channel.send({ embed })
			.catch(err => msg.channel.send("**🚫 |** I don't have permission to send embedded links! :c")
				.catch(err => console.error(err)));
	});
}
