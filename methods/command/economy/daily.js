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
		var sql = "SELECT daily,patreonDaily,daily_streak,uid FROM cowoncy LEFT JOIN user ON cowoncy.id = user.id WHERE cowoncy.id = "+msg.author.id+";";
		sql += "SELECT * FROM user_announcement where uid = (SELECT uid FROM user WHERE id = "+msg.author.id+") AND (aid = (SELECT aid FROM announcement ORDER BY aid DESC limit 1) OR disabled = 1);"
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}

			/* Parse user's date info */
			var afterMid = dateUtil.afterMidnight((rows[0][0])?rows[0][0].daily:undefined);

			/* If it's not past midnight */
			if(afterMid&&!afterMid.after){
				p.send("**⏱ |** Nu! **"+msg.author.username+"**! You need to wait **"+afterMid.hours+"H "+afterMid.minutes+"M "+afterMid.seconds+"S**");

			/* Past midnight */
			}else{
				sql = "";
				
				/* Grab streak/patreon status */
				var streak = 0;
				var patreon = false;
				if(rows[0][0]){
					streak = rows[0][0].daily_streak;
					if(rows[0][0].patreonDaily==1)
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

				/* Determine lootbox or crate */
				let box = {};
				if(Math.random()<.5){
					box.sql = "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+p.msg.author.id+",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
					box.text = "\n**<:box:427352600476647425> |** You received a lootbox!"
				}else{
					box.sql = "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
					box.text = "\n**<:crate:523771259302182922> |** You received a weapon crate!";
				}

				/* Check if the user has not seen latest announcement */
				var announcement = false;
				if(!rows[1][0]){
					announcement = true;
					sql = "SELECT * FROM announcement ORDER BY aid DESC LIMIT 1;";
					var uid = undefined;
					if(rows[0][0]) uid = rows[0][0].uid;
					if(!uid) sql += "INSERT IGNORE INTO user (id,count) VALUES ("+p.msg.author.id+",0);";
					sql += "INSERT INTO user_announcement (uid,aid) VALUES ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"),(SELECT aid FROM announcement ORDER BY aid DESC LIMIT 1)) ON DUPLICATE KEY UPDATE aid = (SELECT aid FROM announcement ORDER BY aid DESC LIMIT 1);"
				}

				var text = "**💰 |** Here's your daily **<:cowoncy:416043450337853441> __"+gain+" Cowoncy__, "+msg.author.username+"**!";
				if((streak-1)>0)
					text += "\n**<:blank:427371936482328596> |** You're on a **__"+(streak-1)+"__ daily streak**!";
				if(extra>0)
					text += "\n**<:blank:427371936482328596> |** You got an extra **"+extra+" Cowoncy** for being a <:patreon:449705754522419222> Patreon!";
				text += box.text;
				text += "\n**⏱ |** Your next daily is in: "+afterMid.hours+"H "+afterMid.minutes+"M "+afterMid.seconds+"S";

				sql += "INSERT INTO cowoncy (id,money) VALUES ("+msg.author.id+","+(gain+extra)+") ON DUPLICATE KEY UPDATE daily_streak = "+streak+", money = money + "+(gain+extra)+",daily = NOW();";
				sql += box.sql;
				con.query(sql,function(err,rows,fields){
					if(err){console.error(err);return;}
					p.logger.value('cowoncy',(gain+extra),['command:daily','id:'+msg.author.id]);
					if(announcement&&rows[0][0]){
						var url = rows[0][0].url;
						p.msg.channel.send(text,{file:url}).catch(err =>{
							p.send(text);
							console.error(err);
						});
					}else p.send(text);
				});
			}
		});
	}

})
