const CommandInterface = require('../../commandinterface.js');

/*
 * Daily command.
 * Users can claim a daily once per day after midnight
 */

const dateUtil = require('../../../util/dateUtil.js');

module.exports = new CommandInterface({

	alias:["daily"],

	args:"",

	desc:"Grab you daily cowoncy every day after 12am PST! Daily streaks will give you extra cowoncy!",

	example:[],

	related:["owo money"],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		/* Query for user info */
		var msg = p.msg,con = p.con;
		var sql = "SELECT daily,patreonDaily,daily_streak FROM cowoncy LEFT JOIN user ON cowoncy.id = user.id WHERE cowoncy.id = "+msg.author.id+";";
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}

			/* Parse user's date info */
			var afterMid = (rows[0])?dateUtil.afterMidnight(rows[0].daily):undefined;

			/* If it's not past midnight */
			if(afterMid&&!afterMid.after){
				p.send("**⏱ |** Nu! **"+msg.author.username+"**! You need to wait **"+afterMid.hours+"H "+afterMid.minutes+"M "+afterMid.seconds+"S**");

			/* Past midnight */
			}else{
				
				/* Grab streak/patreon status */
				var streak = 0;
				var patreon = false;
				if(rows[0]){
					streak = rows[0].daily_streak;
					if(rows[0].patreonDaily==1)
						patreon = true;
				}

				//Calculate daily amount
				var gain = 100 + Math.floor(Math.random()*100);
				var extra = 0;

				/* Reset streak if its over 1 whole day */
				if(afterMid&&afterMid.withinDay) streak++;
				else streak = 1;

				/* Calculate streak/patreon cowoncy */
				gain += (streak*25);
				if(gain > 1000) gain = 1000
				if(patreon) extra = gain;

				var text = "**💰 |** Here's your daily **<:cowoncy:416043450337853441> __"+gain+" Cowoncy__, "+msg.author.username+"**!";
				if((streak-1)>0)
					text += "\n**<:blank:427371936482328596> |** You're on a **__"+(streak-1)+"__ daily streak**!";
				if(extra>0)
					text += "\n**<:blank:427371936482328596> |** You got an extra **"+extra+" Cowoncy** for being a <:patreon:449705754522419222> Patreon!";
				text += "\n**⏱ |** Your next daily is in: "+afterMid.hours+"H "+afterMid.minutes+"M "+afterMid.seconds+"S";

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
