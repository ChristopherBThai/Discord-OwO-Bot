const CommandInterface = require('../../commandinterface.js');

/*
 * Quest command.
 * Users can claim 1 quest a day up to 3 quests in total
 */

const dateUtil = require('../../../util/dateUtil.js');
const global = require('../../../util/global.js');
const questJson = require('../../../json/quests.json');

module.exports = new CommandInterface({

	alias:["quest"],

	args:"",

	desc:"Grab a quest everyday! Complete them to earn rewards! You can earn a new quest after 12am PST",

	example:[],

	related:[],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		/* Query for user info */
		var sql = "SELECT questTime FROM timers WHERE uid = (SELECT uid FROM user WHERE id = "+p.msg.author.id+");";
		sql += "SELECT * FROM quest WHERE uid = (SELECT uid FROM user WHERE id = "+p.msg.author.id+") ORDER BY qid asc;";
		try{
			/* Query sql */
			var result = await p.query(sql).catch(err => {
				throw new p.Error(err,"MySQL",sql);
			});

			/* If there is no timer data, make one */
			if(!result[0][0]){
				sql = "INSERT IGNORE INTO user (id,count) values ("+p.msg.author.id+",0);";
				sql += "INSERT INTO timers (uid) values ((SELECT uid FROM user WHERE id = "+p.msg.author.id+"));";
				await p.query(sql).catch(err => {
					throw new p.Error(err,"MySQL",sql);
				});
			}

			/* Parse dates */
			var afterMid = dateUtil.afterMidnight((result[0][0])?result[0][0].questTime:undefined);

			/* Check if its past midnight and number of quest < 3, if so add 1 quest */
			if(afterMid&&afterMid.after&&result[1].length<3)
				var quest = getQuest(p.msg.author.id);

			var quests = parseQuests(p.msg.author.id,result[1],afterMid,quest);

			/* Combine sql statements */
			sql = "";
			if(quest) sql += quest.sql;
			if(quests) sql += quests.sql;

			if(sql!="")
				await p.query(sql).catch(err => {console.error(err)});

			/*Create embed */
			var embed = {
				"color":p.config.embed_color,
				"footer":{
					"text": "Next quest in: "+afterMid.hours+" H "+afterMid.minutes+" M "+afterMid.seconds+" S"
				},
				"author": {
					"name": p.msg.author.username+"'s Quest Log",
					"icon_url":p.msg.author.avatarURL
				},
				"description":quests.text
			};

			p.send({embed});
		}catch(err){console.error(err);}
	}

})

function getQuest(id){
	/* Grab a random quest catagory */
	var key = Object.keys(questJson);
	key = key[Math.floor(Math.random()*key.length)];
	var quest = questJson[key];

	/* Grab random quest level */
	var rand = Math.random();
	var loc = 0;
	for(let i=0;i<quest.chance.length;i++){
		loc += quest.chance[i];
		if(rand <= loc){
			loc = i;
			i = quest.chance.length;
		}
	}

	/* Grab prize type */
	var prize = "cowoncy";
	rand = Math.random();
	if(rand > .6) prize = "crate";
	else if(rand > .3) prize = "lootbox";

	/* Construct insert sql */
	var sql = `INSERT IGNORE INTO quest (uid,qid,qname,level,prize,count) values (
			IF((SELECT * FROM (SELECT COUNT(*) FROM quest left join user on quest.uid = user.uid WHERE id = ${id}) AS t)<3,
				(SELECT uid FROM user WHERE id = ${id}),
				NULL
			  ),
			3,
			'${key}',
			${loc},
			'${prize}',
			0
		);`
	sql += `INSERT INTO timers (uid,questTime) VALUES ((SELECT uid FROM user WHERE id = ${id}),NOW()) ON DUPLICATE KEY UPDATE questTime = NOW();`;

	return {sql:sql,
		key:key,
		level:loc,
		prize:prize}
}

function parseQuests(id,result,afterMid,quest){
	/* Reorder qid to proper qid */
	var sql = "";
	if(quest){
		var order = [];
		for(let i=0;i<result.length;i++){
			order.push(result[i].qid);
		}
		order.push(3);
		for(let i=0;i<order.length;i++){
			sql += "UPDATE quest SET qid = "+i+" WHERE qid = "+order[i]+" AND uid = (SELECT uid FROM user WHERE id = "+id+");";
		}
		result.push({qname:quest.key,level:quest.level,prize:quest.prize,count:0});
	}
	
	var text = "";
	for(let i=0;i<result.length;i++){
		texts = parseQuest(result[i]);
		text += "**"+(i+1)+". "+texts.text+"**";
		text += "\n<:blank:427371936482328596>`‣ Reward:` "+texts.reward;
		text += "\n<:blank:427371936482328596>`‣ Progress: ["+texts.progress+"]`\n";
	}

	if(text=="") text = "UwU You finished all of your quests! Come back tomorrow! <3";

	return {sql:sql,text:text};
}

function parseQuest(questInfo){
	var quest = questJson[questInfo.qname];
	if(questInfo.prize=="cowoncy"){
		//var reward = global.toFancyNum(quest.cowoncy[questInfo.level]) + " 💵";
		var reward = global.toFancyNum(quest.cowoncy[questInfo.level]) + " <:cowoncy:416043450337853441>";
	}else if(questInfo.prize=="lootbox"){
		var reward = "<:box:427352600476647425>".repeat(quest.lootbox[questInfo.level]);
	}else if(questInfo.prize=="crate"){
		var reward = "<:crate:523771259302182922>".repeat(quest.crate[questInfo.level]);
	}
	var count = quest.count[questInfo.level];
	if(global.isInt(count))
		var progress = questInfo.count+"/"+count;
	else
		var progress = questInfo.count+"/3";

	switch(questInfo.qname){
		case "hunt":
			var text = "Manually hunt "+count+" times!";
			break;
		case "battle":
			var text = "Battle "+count+" times!";
			break;
		case "gamble":
			var text = "Gamble "+count+" times!";
			break;
		case "drop":
			var text = "Drop cowoncy "+count+" times!";
			break;
		case "emoteTo":
			var text = "Use an emote on someone "+count+" times!";
			break;
		case "emoteBy":
			var text = "Have a friend emote to you "+count+" times!";
			break;
		case "find":
			var text = "Find 3 animals that are "+count+" rank!";
			break;
		default:
			var text = "Invalid Quest";
			break;
	}

	return {text:text,reward:reward,progress:progress};
}
