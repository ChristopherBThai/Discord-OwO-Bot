const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["daily"],

	args:"",

	desc:"Grab you daily cowoncy every 23H! Daily streaks will give you extra cowoncy!",

	example:[],

	related:["owo money"],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		var msg = p.msg,con = p.con;
		var sql = "SELECT TIMESTAMPDIFF(HOUR,daily,NOW()) AS hour,TIMESTAMPDIFF(MINUTE,daily,NOW()) AS minute,TIMESTAMPDIFF(SECOND,daily,NOW()) AS second FROM cowoncy WHERE id = "+msg.author.id+" AND TIMESTAMPDIFF(HOUR,daily,NOW())<23;"+
			"SELECT TIMESTAMPDIFF(DAY,daily,NOW()) AS day,patreonDaily,daily_streak FROM cowoncy LEFT JOIN user ON cowoncy.id = user.id WHERE cowoncy.id = "+msg.author.id+";";
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			if(rows[0][0]!=undefined){
				var hour = 22 - rows[0][0].hour;
				var min= 59 - (rows[0][0].minute%60);
				var sec = 59 - (rows[0][0].second%60);
				p.send("**⏱ | Nu! "+msg.author.username+"! You need to wait __"+hour+" H "+min+" M "+sec+" S__**");
			}else{
				var streak = 0;
				var patreon = false;

				if(rows[1][0]!=undefined){
					streak = rows[1][0].daily_streak;
					if(rows[1][0].patreonDaily==1)
						patreon = true;
				}

				//Calculate daily amount
				var gain = 100 + Math.floor(Math.random()*100);
				var extra = 0;

				if(rows[1][0]&&rows[1][0].day>2) streak = 0;
				else streak++;

				gain = gain+(streak*25);
				if(gain > 1000) gain = 1000
				if(patreon) extra = gain;

				var text = "**💰 |** Here's your daily **<:cowoncy:416043450337853441> __"+gain+" Cowoncy__, "+msg.author.username+"**!";
				if((streak-1)>0)
					text += "\n**<:blank:427371936482328596> |** You're on a **__"+(streak-1)+"__ daily streak**!";
				if(extra>0)
					text += "\n**<:blank:427371936482328596> |** You got an extra **"+extra+" Cowoncy** for being a <:patreon:449705754522419222> Patreon!";

				sql = "INSERT INTO cowoncy (id,money) VALUES ("+msg.author.id+","+(gain+extra)+") ON DUPLICATE KEY UPDATE daily_streak = "+streak+", money = money + "+(gain+extra)+",daily = NOW();";
				con.query(sql,function(err,rows,fields){
					if(err){console.error(err);return;}
					p.logger.value('cowoncy',(gain+extra),['command:daily','id:'+msg.author.id]);
					p.send(text);
				});
			}
		});
	}

})
