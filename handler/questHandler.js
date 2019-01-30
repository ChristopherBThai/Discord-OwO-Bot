/*
 * Handles quest counter/rewards
 */

const quests = require('./../json/quests.json');
const Error = require('./errorHandler.js');
const mysql = new (require('./mysqlHandler.js'))();
const global = require('./../util/global.js');
const findQuest = {"rare":["common","uncommon"],
	"epic":["common","uncommon","rare"],
	"mythical":["common","uncommon","rare","epic"]};

module.exports = class Quest{

	/* Constructer to grab mysql connection */
	constructor() {
	}

	/* progress in a specific quest */
	async increment(msg,questName,count=1,extra){
		/* Grab current quest progress */
		var result = await mysql.query(
			"SELECT * FROM quest WHERE qname = ? AND uid = (SELECT uid FROM user WHERE id = ?);",
			[questName,BigInt((questName=="emoteBy")?extra.id:msg.author.id)]
		).catch(console.error);
		
		if(!result[0]) return;

		for(var i=0;i<result.length;i++)
			await check(msg,questName,result[i],count,extra);
	}
}

/* Check if user finished quest or increment quest progress */
async function check(msg,questName,result,count,extra){
	/* Parse data for quest */
	var quest = quests[questName];
	if(!quest||!result) return;
	var current = result.count + count;
	var level = result.level;
	var needed = quest.count[level];
	var rewardType = result.prize;
	var reward = quest[rewardType][level];

	/* Check if valid */
	if(questName=="find"){
		needed = 3;
		/* Check if the tier matches */
		if(quest.count[level] in extra){
			current += extra[quest.count[level]] -1;
			count = extra[quest.count[level]];
		}
		else return;
	}

	/* Check if the quest is complete */
	var text,rewardSql;
	if(current >= needed){
		var sql = "DELETE FROM quest WHERE qid = ? AND qname = ? AND uid = (SELECT uid FROM user WHERE id = ?);";
		var variables = [result.qid,questName,BigInt((questName=="emoteBy")?extra.id:msg.author.id)];
		var text = "**📜 | "+((questName=="emoteBy")?extra.username:msg.author.username)+"**! You finished a quest and earned: ";
		if(rewardType=="lootbox"){
			text += "<:box:427352600476647425>".repeat(reward);
			rewardSql = "INSERT INTO lootbox (id,boxcount,claim) VALUES (?,?,'2017-01-01 10:10:10') ON DUPLICATE KEY UPDATE boxcount = boxcount + ?;";
			var rewardVar = [BigInt((questName=="emoteBy")?extra.id:msg.author.id),reward,reward];
		}else if(rewardType=="crate"){
			text += "<:crate:523771259302182922>".repeat(reward);
			rewardSql = "INSERT INTO crate (uid,boxcount,claim) VALUES ((SELECT uid FROM user WHERE id = ?),?,'2017-01-01 10:10:10') ON DUPLICATE KEY UPDATE boxcount = boxcount + ?;";
			var rewardVar = [BigInt((questName=="emoteBy")?extra.id:msg.author.id),reward,reward];
		}else{
			text += global.toFancyNum(reward)+" <:cowoncy:416043450337853441>";
			rewardSql = "INSERT INTO cowoncy (id,money) VALUES (?,?) ON DUPLICATE KEY UPDATE money = money + ?";
			var rewardVar = [BigInt((questName=="emoteBy")?extra.id:msg.author.id),reward,reward];
		}
		text += "!";
	}else{
		var sql = "UPDATE IGNORE quest SET count = count + ? WHERE qid = ? AND qname = ? AND uid = (SELECT uid FROM user WHERE id = ?);";
		var variables = [count,result.qid,questName,BigInt((questName=="emoteBy")?extra.id:msg.author.id)];
	}

	/* Query sql */
	var result = await mysql.query(sql,variables).catch(console.error);
	if(result.affectedRows==1&&rewardSql){
		await mysql.query(rewardSql,rewardVar).then(
				await msg.channel.send(text).catch(console.error)
			).catch(console.error);
	}
}

