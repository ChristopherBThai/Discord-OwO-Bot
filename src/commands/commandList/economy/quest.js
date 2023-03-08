/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

/*
 * Quest command.
 * Users can claim 1 quest a day up to 3 quests in total
 */

const dateUtil = require('../../../utils/dateUtil.js');
const global = require('../../../utils/global.js');
const questJson = require('../../../data/quests.json');

module.exports = new CommandInterface({
	alias: ['quest', 'q'],

	args: '[rr | lock | unlock] {num}',

	desc: 'Grab a quest everyday! Complete them to earn rewards! You also have one quest reroll per day! You can earn a new quest after 12am PST',

	example: ['owo quest', 'owo quest rr 1', 'owo quest lock 1', 'owo quest unlock 1'],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['economy'],

	related: [],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		if (
			p.args.length == 2 &&
			(p.args[0] == 'rr' || p.args[0] == 'reroll') &&
			p.global.isInt(p.args[1])
		)
			await rrQuest(p);
		else if (
			p.args.length == 2 &&
			(p.args[0] == 'lock' || p.args[0] == 'unlock') &&
			p.global.isInt(p.args[1])
		)
			await lockUnlockQuest(p);
		else await addQuest(p);
	},
});

async function rrQuest(p) {
	/* Parse which quest to alter */
	let qnum = parseInt(p.args[1]) - 1;

	/* Query timer info */
	let sql =
		'SELECT questrrTime FROM timers WHERE uid = (SELECT uid FROM user WHERE id = ' +
		p.msg.author.id +
		');';
	sql +=
		'SELECT qid, locked FROM user INNER JOIN quest ON user.uid = quest.uid WHERE id = ' +
		p.msg.author.id +
		' ORDER BY qid ASC;';
	let result = await p.query(sql);

	/* Parse dates */
	let afterMid = dateUtil.afterMidnight(result[0][0] ? result[0][0].questrrTime : undefined);

	/* After midnight? */
	if (!afterMid || !afterMid.after) {
		p.errorMsg(', you already rerolled a quest today silly head!', 3000);
		return;
	}

	/* Is there even a quest to reroll? */
	let valid = false;
	let locked = false;
	for (let i in result[1]) {
		if (!valid && i == qnum) {
			valid = true;
			qnum = result[1][i].qid;
			locked = result[1][i].locked;
		}
	}
	if (!valid) {
		p.errorMsg(', Could not locate the quest.', 3000);
		return;
	}

	/* alright, we can now find a new quest! */
	let quest = getQuest(p.msg.author.id, { qnum }, undefined, locked);

	/* Replace the quest in query */
	sql =
		'DELETE FROM quest WHERE uid = (SELECT uid FROM user WHERE id = ' +
		p.msg.author.id +
		') AND qid = ' +
		qnum +
		';';
	sql += quest.sql;
	sql +=
		'UPDATE timers LEFT JOIN user ON timers.uid = user.uid SET questrrTime = ' +
		afterMid.sql +
		' WHERE id = ' +
		p.msg.author.id +
		';';
	sql +=
		'SELECT * FROM quest WHERE uid = (SELECT uid FROM user WHERE id = ' +
		p.msg.author.id +
		') ORDER BY qid asc;';
	result = await p.query(sql);

	/* Display the result */
	let quests = parseQuests(p.msg.author.id, result[3], afterMid);
	let embed = constructEmbed(p, afterMid, quests);

	p.send({ embed });
}

async function lockUnlockQuest(p) {
	/* Parse which quest to alter */
	let qnum = parseInt(p.args[1]) - 1;

	let sql = `SELECT qid FROM user INNER JOIN quest ON user.uid = quest.uid WHERE id = ${p.msg.author.id} ORDER BY qid ASC;`;
	let result = await p.query(sql);

	/* Is there even a quest to lock? */
	let valid = false;
	for (let i in result) {
		if (!valid && i == qnum) {
			valid = true;
			qnum = result[i].qid;
		}
	}
	if (!valid) {
		p.errorMsg(', Could not locate the quest.', 3000);
		return;
	}
	let lock = false;
	if (p.args[0].toLowerCase() == 'lock') {
		lock = true;
	}

	sql = `UPDATE quest SET locked = ${lock} WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND qid = ${qnum};`;
	sql += `SELECT * FROM quest WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) ORDER BY qid asc;`;
	sql += `SELECT questTime FROM timers WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;

	result = await p.query(sql);

	/* Parse dates */
	let afterMid = dateUtil.afterMidnight(result[2][0] ? result[2][0].questTime : undefined);

	let quests = parseQuests(p.msg.author.id, result[1], afterMid);

	/*Create embed */
	let embed = constructEmbed(p, afterMid, quests);

	p.send({ embed });
}

async function addQuest(p) {
	/* Query for user info */
	let sql =
		'SELECT questTime FROM timers WHERE uid = (SELECT uid FROM user WHERE id = ' +
		p.msg.author.id +
		');';
	sql +=
		'SELECT * FROM quest WHERE uid = (SELECT uid FROM user WHERE id = ' +
		p.msg.author.id +
		') ORDER BY qid asc;';

	/* Query sql */
	let result = await p.query(sql);

	/* If there is no timer data, make one */
	if (!result[0][0]) {
		sql = 'INSERT IGNORE INTO user (id,count) values (' + p.msg.author.id + ',0);';
		sql +=
			'INSERT INTO timers (uid) values ((SELECT uid FROM user WHERE id = ' +
			p.msg.author.id +
			'));';
		await p.query(sql);
	}

	/* Parse dates */
	let afterMid = dateUtil.afterMidnight(result[0][0] ? result[0][0].questTime : undefined);

	/* Check if its past midnight and number of quest < 3, if so add 1 quest */
	let quest;
	if (afterMid && afterMid.after && result[1].length < 3)
		quest = getQuest(p.msg.author.id, undefined, afterMid.sql);

	let quests = parseQuests(p.msg.author.id, result[1], afterMid, quest);

	/* Combine sql statements */
	sql = '';
	if (quest) sql += quest.sql;
	if (quests) sql += quests.sql;

	if (sql != '') await p.query(sql);

	/*Create embed */
	let embed = constructEmbed(p, afterMid, quests);

	p.send({ embed });
}

function constructEmbed(p, afterMid, quests) {
	return {
		color: p.config.embed_color,
		footer: {
			text: `Next quest in: ${afterMid.hours}H ${afterMid.minutes}M ${afterMid.seconds}S`,
		},
		author: {
			name: `${p.msg.author.username}#${p.msg.author.discriminator}'s Quest Log`,
			icon_url: p.msg.author.avatarURL,
		},
		description: quests.text,
	};
}

function getQuest(id, qid, afterMidSQL) {
	/* Grab a random quest catagory */
	let key = Object.keys(questJson);
	key = key[Math.floor(Math.random() * key.length)];
	let quest = questJson[key];

	/* Grab random quest level */
	let rand = Math.random();
	let loc = 0;
	for (let i = 0; i < quest.chance.length; i++) {
		loc += quest.chance[i];
		if (rand <= loc) {
			loc = i;
			i = quest.chance.length;
		}
	}

	/* Grab prize type */
	let prize = 'cowoncy';
	rand = Math.random();
	if (rand > 0.75) prize = 'crate';
	else if (rand > 0.5) prize = 'lootbox';
	else if (rand > 0.25) prize = 'shards';

	/* Construct insert sql */
	let sql = `INSERT IGNORE INTO quest (uid, qid, qname, level, prize, count, locked) values (
			(SELECT uid FROM user WHERE id = ${id}),
			${qid ? qid.qnum : 3},
			'${key}',
			${loc},
			'${prize}',
			0,
			0	
		);`;
	/* Reset timer if its from daily quest */
	if (!qid) {
		sql += `INSERT INTO timers (uid,questTime) VALUES ((SELECT uid FROM user WHERE id = ${id}),${afterMidSQL}) ON DUPLICATE KEY UPDATE questTime = ${afterMidSQL};`;
	}

	return { sql, key, level: loc, prize };
}

function parseQuests(id, result, afterMid, quest) {
	/* Reorder qid to proper qid */
	let sql = '';
	if (quest) {
		let order = [];
		for (let i = 0; i < result.length; i++) {
			order.push(result[i].qid);
		}
		order.push(3);
		for (let i = 0; i < order.length; i++) {
			sql += `UPDATE quest SET qid = ${i} WHERE qid = ${order[i]} AND uid = (SELECT uid FROM user WHERE id = ${id});`;
		}
		result.push({
			qname: quest.key,
			level: quest.level,
			prize: quest.prize,
			count: 0,
		});
	}

	let text = '';
	for (let i = 0; i < result.length; i++) {
		const texts = parseQuest(result[i]);
		text += `**${i + 1}. ${texts.text}**`;
		text += `\n<:blank:427371936482328596>\`‣ Reward:\` ${texts.reward}`;
		text += `\n<:blank:427371936482328596>\`‣ Progress: [${texts.progress}]\`\n`;
		if (texts.locked) {
			text += '<:blank:427371936482328596>`‣ 🔒 Locked`\n';
		}
	}

	if (text == '') text = 'UwU You finished all of your quests! Come back tomorrow! <3';

	return { sql, text };
}

function parseQuest(questInfo) {
	let quest = questJson[questInfo.qname];
	let reward, text, progress;

	if (questInfo.prize == 'cowoncy') {
		reward = global.toFancyNum(quest.cowoncy[questInfo.level]) + ' <:cowoncy:416043450337853441>';
	} else if (questInfo.prize == 'lootbox') {
		reward = '<:box:427352600476647425>'.repeat(quest.lootbox[questInfo.level]);
	} else if (questInfo.prize == 'crate') {
		reward = '<:crate:523771259302182922>'.repeat(quest.crate[questInfo.level]);
	} else if (questInfo.prize == 'shards') {
		reward =
			global.toFancyNum(quest.shards[questInfo.level]) + ' <:weaponshard:655902978712272917>';
	}

	let count = quest.count[questInfo.level];
	if (global.isInt(count)) {
		progress = questInfo.count + '/' + count;
	} else {
		progress = questInfo.count + '/3';
	}
	let locked = !!questInfo.locked;

	switch (questInfo.qname) {
		case 'hunt':
			text = 'Manually hunt ' + count + ' times!';
			break;
		case 'battle':
			text = 'Battle ' + count + ' times!';
			break;
		case 'gamble':
			text = 'Gamble ' + count + ' times!';
			break;
		case 'owo':
			text = "Say 'owo' " + count + ' times!';
			break;
		case 'emoteTo':
			text = 'Use an action command on someone ' + count + ' times!';
			break;
		case 'emoteBy':
			text = 'Have a friend use an action command on you ' + count + ' times!';
			break;
		case 'find':
			text = 'Hunt 3 animals that are ' + count + ' rank!';
			break;
		case 'cookieBy':
			text = 'Receive a cookie from ' + count + ' friends!';
			break;
		case 'prayBy':
			text = 'Have a friend pray to you ' + count + ' times!';
			break;
		case 'curseBy':
			text = 'Have a friend curse you ' + count + ' times!';
			break;
		case 'friendlyBattle':
			text = 'Battle with a friend ' + count + ' times!';
			break;
		case 'xp':
			text = 'Earn  ' + count + ' xp from hunting and battling!';
			break;
		default:
			text = 'Invalid Quest';
			break;
	}

	return { text, reward, progress, locked };
}
