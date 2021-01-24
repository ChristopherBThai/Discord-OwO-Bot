/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

/*
 * Daily command.
 * Users can claim a daily once per day after midnight
 */

const dateUtil = require('../../../utils/dateUtil.js');
const levels = require('../../../utils/levels.js');
const rings = require('../../../data/rings.json');

module.exports = new CommandInterface({

	alias:["daily"],

	args:"",

	desc:"Grab your daily cowoncy every day after 12am PST! Daily streaks will give you extra cowoncy!",

	example:[],

	related:["owo money"],

	permissions:["sendMessages","embedLinks","attachFiles"],

	group:["economy"],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: async function(p){
		/* Query for user info */
		let msg = p.msg,con = p.con;
		let sql = "SELECT daily,daily_streak,user.uid,IF(patreonDaily = 1 OR ((TIMESTAMPDIFF(MONTH,patreonTimer,NOW())<patreonMonths) AND patreonType = 3),1,0) as patreon  FROM cowoncy LEFT JOIN user ON cowoncy.id = user.id LEFT JOIN patreons ON user.uid = patreons.uid WHERE cowoncy.id = "+msg.author.id+";";
		sql += "SELECT * FROM user_announcement where uid = (SELECT uid FROM user WHERE id = "+msg.author.id+") AND (aid = (SELECT aid FROM announcement ORDER BY aid DESC limit 1) OR disabled = 1);"
		sql += `SELECT 
					u1.id AS id1,c1.daily AS daily1,c1.daily_streak AS streak1,
					u2.id AS id2,c2.daily AS daily2,c2.daily_streak AS streak2,
					marriage.* 
				FROM marriage 
					LEFT JOIN user AS u1 ON marriage.uid1 = u1.uid 
						LEFT JOIN cowoncy AS c1 ON c1.id = u1.id
					LEFT JOIN user AS u2 ON marriage.uid2 = u2.uid 
						LEFT JOIN cowoncy AS c2 ON c2.id = u2.id
					LEFT JOIN user AS temp ON marriage.uid1 = temp.uid OR marriage.uid2 = temp.uid
				WHERE temp.id = ${p.msg.author.id};`;

		let rows = await p.query(sql);

		/* Parse user's date info */
		let afterMid = dateUtil.afterMidnight((rows[0][0])?rows[0][0].daily:undefined);
		
		if (!rows[0][0]) {
			await p.query(`INSERT IGNORE INTO user (id, count) VALUES (${p.msg.author.id}, 0); INSERT IGNORE INTO cowoncy (id, money) VALUES (${p.msg.author.id}, 0);`);
		}

		/* If it's not past midnight */
		if(afterMid&&!afterMid.after){
			/* double check marriage */
			if(rows[2][0]&&rows[2][0].daily1&&rows[2][0].daily2){
				afterMid = dateUtil.afterMidnight(rows[2][0].claimDate);
				if(afterMid.after){
					const u1Date = dateUtil.afterMidnight(rows[2][0].daily1);
					const u2Date = dateUtil.afterMidnight(rows[2][0].daily2);
					if (!u1Date.after && !u2Date.after) {
						let totalStreak = rows[2][0].streak1 + rows[2][0].streak2;
						let totalGain = Math.round(100 + Math.floor(Math.random()*100)+totalStreak*12.5);
						if(totalGain>1000) totalGain = 1000;
						sql = `UPDATE marriage SET claimDate = ${afterMid.sql}, dailies = dailies + 1 WHERE uid1 = ${rows[2][0].uid1} AND uid2 = ${rows[2][0].uid2} AND dailies = ${rows[2][0].dailies};`;
						let result = await p.query(sql);
						if (result.changedRows) {
							let so;
							if(p.msg.author.id == rows[2][0].id1){
								so = await p.fetch.getUser(rows[2][0].id2);
							} else {
								so = await p.fetch.getUser(rows[2][0].id1);
							}
							const ring = rings[rows[2][0].rid];
							let text = ring.emoji+"** |** You and "+(so?so.username:"your partner")+" received <:cowoncy:416043450337853441> **"+totalGain+" Cowoncy** and a ";

							sql = `UPDATE cowoncy SET money = money + ${totalGain} WHERE id IN (${rows[2][0].id1},${rows[2][0].id2});`;
							if(Math.random()<.5){
								sql += "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+rows[2][0].id2+",1,0,'2017-01-01'),("+rows[2][0].id2+",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
								text += "<:box:427352600476647425> **lootbox**!";
							}else{
								sql += "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+rows[2][0].id1+"),0,1,0,'2017-01-01'),((SELECT uid FROM user WHERE id = "+rows[2][0].id2+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
								text += "<:crate:523771259302182922> **weapon crate**!";
							}
							await p.query(sql);
							p.send(text);
							return;
						}
					}
				}
			}
			p.send("**⏱ |** Nu! **"+msg.author.username+"**! You need to wait **"+afterMid.hours+"H "+afterMid.minutes+"M "+afterMid.seconds+"S**");

		/* Past midnight */
		}else{
			sql = "";

			/* Grab streak/patreon status */
			var streak = 0;
			var patreon = false;
			if(rows[0][0]){
				streak = rows[0][0].daily_streak;
				if(rows[0][0].patreon==1)
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
				box.text = "\n**<:box:427352600476647425> |** You received a **lootbox**!"
			}else{
				box.sql = "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
				box.text = "\n**<:crate:523771259302182922> |** You received a **weapon crate**!";
			}

			/* Check if the user has not seen latest announcement */
			let announcement = false;
			if(!rows[1][0]){
				announcement = true;
				sql = "SELECT * FROM announcement ORDER BY aid DESC LIMIT 1;";
				var uid = undefined;
				if(rows[0][0]) uid = rows[0][0].uid;
				if(!uid) sql += "INSERT IGNORE INTO user (id,count) VALUES ("+p.msg.author.id+",0);";
				sql += "INSERT INTO user_announcement (uid,aid) VALUES ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"),(SELECT aid FROM announcement ORDER BY aid DESC LIMIT 1)) ON DUPLICATE KEY UPDATE aid = (SELECT aid FROM announcement ORDER BY aid DESC LIMIT 1);"
			}
			
			let moneybag = '💰';
			let text = moneybag+" **| "+msg.author.username+"**, Here is your daily **<:cowoncy:416043450337853441> "+gain+" Cowoncy**!";
			if((streak-1)>0)
				text += "\n**<:blank:427371936482328596> |** You're on a **"+(streak-1)+" daily streak**!";
			if(extra>0)
				text += "\n**<:blank:427371936482328596> |** You got an extra **"+extra+" Cowoncy** for being a <:patreon:449705754522419222> Patreon!";
			text += box.text;

			const cowoncySql = `UPDATE cowoncy SET money = money + ${gain+extra}, daily_streak = ${streak}, daily = ${afterMid.sql} WHERE id = ${p.msg.author.id} ${!!rows[0][0] ? ` AND daily_streak = ${rows[0][0].daily_streak}` : ''} ;`;
			sql += box.sql;


			// Check if married
			let marriageText = "";
			if(rows[2][0]&&rows[2][0].daily1&&rows[2][0].daily2){

				// daily can only be claimed the day after married
				afterMid = dateUtil.afterMidnight(rows[2][0].marriedDate);
				if(afterMid.after){

					let soID,soStreak,soDaily;
					if(p.msg.author.id == rows[2][0].id1){
						soID = rows[2][0].id2;
						soStreak = rows[2][0].streak2;
						soDaily = rows[2][0].daily2;
					}else{
						soID = rows[2][0].id1;
						soStreak = rows[2][0].streak1;
						soDaily = rows[2][0].daily1;
					}

					// If the parter has claimed their daily.. bonuses!
					afterMid = dateUtil.afterMidnight(soDaily);
					if(!afterMid.after){
						let totalStreak = streak + soStreak;
						let totalGain = Math.round(100 + Math.floor(Math.random()*100)+totalStreak*12.5);
						if(totalGain>1000) totalGain = 1000;
						sql += `UPDATE cowoncy SET money = money + ${totalGain} WHERE id IN (${soID},${p.msg.author.id});`;
						sql += `UPDATE marriage SET claimDate = ${afterMid.sql}, dailies = dailies + 1 WHERE uid1 = ${rows[2][0].uid1} AND uid2 = ${rows[2][0].uid2};`;

						let so = await p.fetch.getUser(soID);
						let ring = rings[rows[2][0].rid];
						text += "\n"+ring.emoji+"** |** You and "+(so?so.username:"your partner")+" received <:cowoncy:416043450337853441> **"+totalGain+" Cowoncy** and a ";

						if(Math.random()<.5){
							sql += "INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES ("+p.msg.author.id+",1,0,'2017-01-01'),("+soID+",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
							text += "<:box:427352600476647425> **lootbox**!";
						}else{
							sql += "INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"),0,1,0,'2017-01-01'),((SELECT uid FROM user WHERE id = "+soID+"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
							text += "<:crate:523771259302182922> **weapon crate**!";
						}
					}
				}
			}

			text += "\n**⏱ |** Your next daily is in: "+afterMid.hours+"H "+afterMid.minutes+"M "+afterMid.seconds+"S";

			rows = await p.query(cowoncySql);
			if (!rows.changedRows) {
				p.errorMsg(", you already claimed your daily!");
				return;
			}
			rows = await p.query(sql);
			p.logger.incr(`cowoncy`, gain + extra, {type:'daily'}, p.msg);
			if(announcement&&rows[0][0]){
				let url = rows[0][0].url;
				let embed;
				if(url)
					embed = {
						image:{url},
						color:p.config.embed_color,
						timestamp:new Date(rows[0][0].adate)
					};
				await p.send({content:text,embed});
			}else p.send(text);
			levels.giveUserXP(p.msg.author.id,100);
		}
	}

})
