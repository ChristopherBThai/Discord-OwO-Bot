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

	execute: function(p){
		var msg = p.msg,con = p.con;
		var gain = 100 + Math.floor(Math.random()*100);
		var sql = "SELECT TIMESTAMPDIFF(HOUR,daily,NOW()) AS hour,TIMESTAMPDIFF(MINUTE,daily,NOW()) AS minute,TIMESTAMPDIFF(SECOND,daily,NOW()) AS second FROM cowoncy WHERE id = "+msg.author.id+" AND TIMESTAMPDIFF(HOUR,daily,NOW())<23;"+
			"INSERT INTO cowoncy (id,money) VALUES ("+msg.author.id+","+gain+") ON DUPLICATE KEY UPDATE daily_streak = IF(TIMESTAMPDIFF(DAY,daily,NOW())>1,0,IF(TIMESTAMPDIFF(HOUR,daily,NOW())<23,daily_streak,daily_streak+1)), money = IF(TIMESTAMPDIFF(HOUR,daily,NOW()) >= 23,IF("+gain+"+(daily_streak*25)>1000,money+1000,money+("+gain+"+(daily_streak*25))),money), daily = IF(TIMESTAMPDIFF(HOUR,daily,NOW()) >= 23,NOW(),daily);"+
			"SELECT daily_streak FROM cowoncy WHERE id = "+msg.author.id+";";
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			if(rows[0][0]!=undefined){
				var hour = 22 - rows[0][0].hour;
				var min= 59 - (rows[0][0].minute%60);
				var sec = 59 - (rows[0][0].second%60);
				p.send("**⏱ | Nu! "+msg.author.username+"! You need to wait __"+hour+" H "+min+" M "+sec+" S__**");
			}else{
				var streak = 0;
				if(rows[2][0]!=undefined)
					streak = rows[2][0].daily_streak;
				var totalgain = gain+(streak*25);
				if(totalgain > 1000)
					totalgain = 1000
				var text = "**💰 |** Here's your daily **<:cowoncy:416043450337853441> __"+totalgain+" Cowoncy__, "+msg.author.username+"**!";
				if(streak>0)
					text += "\n**<:blank:427371936482328596> |** You're on a **__"+(streak+1)+"__ daily streak**!";
				p.send(text);
			}
		});
	}

})
