/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const global = require('../../../utils/global.js');
const animalUtil = require('../battle/util/animalUtil.js');
const animalUtil2 = require('../zoo/animalUtil.js');
const levels = require('../../../utils/levels.js');
let animals;
try {
	animals = require('../../../../../tokens/owo-animals.json');
} catch (err) {
	console.error('Could not find owo-animals.json, attempting to use ./secret file...');
	animals = require('../../../../secret/owo-animals.json');
	console.log('Found owo-animals.json file in secret folder!');
}

module.exports = new CommandInterface({
	alias: ['my', 'me', 'guild'],

	args: 'points|guild|zoo|money|cookie|pet|huntbot|luck|curse|daily|battle|level|shards [global]',

	desc: 'Displays your ranking of each category!\nYou can choose you rank within the server or globally!\nYou can also shorten the command like in the example!',

	example: ['owo my zoo', 'owo my cowoncy global', 'owo my p g'],

	related: ['owo top'],

	permissions: ['sendMessages'],

	group: ['rankings'],

	cooldown: 60000,
	half: 20,
	six: 200,
	bot: true,

	execute: async function (p) {
		if (p.command == 'guild') await display(p, p.con, p.msg, ['guild']);
		else await display(p, p.con, p.msg, p.args);
	},
});

/**
 * Check for valid arguments to display leaderboards
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg 	- Discord's message
 * @param {string[]}		args 	- Command arguments
 */
async function display(p, con, msg, args) {
	let aglobal = false;
	let invalid = false;
	let points = false;
	let guild = false;
	let zoo = false;
	let money = false;
	let rep = false;
	let pet = false;
	let team = false;
	let huntbot, luck, curse, daily, battle, level, shard;

	for (var i = 0; i < args.length; i++) {
		if (
			!points &&
			!guild &&
			!money &&
			!zoo &&
			!rep &&
			!pet &&
			!huntbot &&
			!luck &&
			!curse &&
			!team &&
			!daily &&
			!battle &&
			!level &&
			!shard
		) {
			if (args[i] === 'points' || args[i] === 'point' || args[i] === 'p') points = true;
			else if (args[i] === 'guild' || args[i] === 'server' || args[i] === 'g' || args[i] === 's')
				guild = true;
			else if (args[i] === 'zoo' || args[i] === 'z') zoo = true;
			else if (
				args[i] === 'cowoncy' ||
				args[i] === 'money' ||
				args[i] === 'c' ||
				args[i] === 'm' ||
				args[i] === 'cash'
			)
				money = true;
			else if (
				args[i] === 'cookies' ||
				args[i] === 'cookie' ||
				args[i] === 'rep' ||
				args[i] === 'r'
			)
				rep = true;
			else if (args[i] === 'pets' || args[i] === 'pet') pet = true;
			else if (
				args[i] === 'huntbot' ||
				args[i] === 'hb' ||
				args[i] === 'autohunt' ||
				args[i] === 'ah'
			)
				huntbot = true;
			else if (args[i] === 'luck' || args[i] === 'pray') luck = true;
			else if (args[i] === 'curse') curse = true;
			else if (args[i] === 'battle' || args[i] === 'streak') battle = true;
			else if (args[i] === 'level' || args[i] === 'lvl' || args[i] === 'xp') level = true;
			else if (args[i] === 'daily') daily = true;
			else if (
				args[i] === 'shards' ||
				args[i] === 'shard' ||
				args[i] === 'ws' ||
				args[i] === 'weaponshard'
			)
				shard = true;
			else if (args[i] === 'global' || args[i] === 'g') aglobal = true;
			else invalid = true;
		} else if (args[i] === 'global' || args[i] === 'g') aglobal = true;
		else invalid = true;
	}

	if (invalid) {
		p.errorMsg(', Invalid ranking type!', 3000);
	} else {
		if (points) getPointRanking(aglobal, con, msg, p);
		else if (guild) getGuildRanking(con, msg, msg.channel.guild.id, p);
		else if (zoo) getZooRanking(aglobal, con, msg, p);
		else if (money) getMoneyRanking(aglobal, con, msg, p);
		else if (rep) getRepRanking(aglobal, con, msg, p);
		else if (pet) getPetRanking(aglobal, con, msg, p);
		else if (huntbot) getHuntbotRanking(aglobal, con, msg, p);
		else if (luck) getLuckRanking(aglobal, con, msg, p);
		else if (curse) getCurseRanking(aglobal, con, msg, p);
		else if (team) getTeamRanking(aglobal, con, msg, p);
		else if (battle) getBattleRanking(aglobal, con, msg, p);
		else if (daily) getDailyRanking(aglobal, con, msg, p);
		else if (level) await getLevelRanking(aglobal, p);
		else if (shard) getShardRanking(aglobal, con, msg, p);
		else getPointRanking(aglobal, con, msg, p);
	}
}

async function displayRanking(con, msg, sql, title, subText, p) {
	let rows = await p.query(sql);
	let above = rows[0];
	let below = rows[1];
	let me = rows[2][0];
	if (!me) {
		p.send("You're at the very bottom c:");
		return;
	}
	let userRank = parseInt(me.rank);
	let rank = userRank - above.length;
	let embed = '';

	//People above user
	for (let ele of above.reverse()) {
		let id = String(ele.id);
		if (id !== '' && id !== null && !isNaN(id)) {
			let user = await p.fetch.getUser(id, true);
			let name = '';
			if (user === undefined || user.username === undefined) name = 'User Left Discord';
			else name = '' + user.username;
			name = name.replace('discord.gg', 'discord,gg').replace(/(```)/g, '`\u200b``');
			embed += '#' + rank + '\t' + name + '\n' + subText(ele) + '\n';
			rank++;
		} else if (rank == 0) rank = 1;
	}

	//Current user
	let uname;
	if ((uname = await p.fetch.getUser(me.id, true))) uname = uname.username;
	else uname = 'you';
	uname = uname.replace('discord.gg', 'discord,gg').replace(/(```)/g, '`\u200b``');
	embed += '< ' + rank + '   ' + uname + ' >\n' + subText(me) + '\n';
	rank++;

	//People below user
	for (let ele of below) {
		var id = String(ele.id);
		if (id !== '' && id !== null && !isNaN(id)) {
			var user = await p.fetch.getUser(id, true);
			var name = '';
			if (user === undefined || user.username === undefined) name = 'User Left Discord';
			else name = '' + user.username;
			name = name.replace('discord.gg', 'discord,gg');
			embed += '#' + rank + '\t' + name + '\n' + subText(ele) + '\n';
			rank++;
		}
	}

	//Add top and bottom
	embed =
		'```md\n< ' +
		uname +
		"'s " +
		title +
		' >\n> Your rank is: ' +
		userRank +
		'\n>' +
		subText(rows[2][0]) +
		'\n\n' +
		(userRank > 3 ? '>...\n' : '') +
		embed;
	if (rank - userRank == 3) embed += '>...\n';

	let date = new Date();
	embed +=
		'\n' +
		date.toLocaleString('en-US', {
			month: '2-digit',
			day: '2-digit',
			year: 'numeric',
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
		}) +
		'```';
	p.send(embed);
}

/**
 * displays global ranking
 */
function getPointRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count DESC LIMIT 2;';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN (' +
			users +
			') ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.count,u1.id,u1.count FROM user AS u LEFT JOIN ( SELECT id,count FROM user WHERE id IN (' +
			users +
			') ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count DESC LIMIT 2;';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count AND id IN (' +
			users +
			') ) AS rank FROM user u WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'OwO Ranking',
		function (query) {
			return '\t\tsaid owo ' + global.toFancyNum(query.count) + ' times!';
		},
		p
	);
}

function getZooRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,' +
			points +
			' AS points FROM animal_count ORDER BY points ASC ) AS a1 ON a1.points > ' +
			apoints +
			' WHERE a.id = ' +
			msg.author.id +
			' ORDER BY a1.points ASC LIMIT 2;';
		sql +=
			'SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,' +
			points +
			' AS points FROM animal_count ORDER BY points DESC ) AS a1 ON a1.points < ' +
			apoints +
			' WHERE a.id = ' +
			msg.author.id +
			' ORDER BY a1.points DESC LIMIT 2;';
		sql +=
			'SELECT *,' +
			points +
			' AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE ' +
			points +
			' > ' +
			apoints +
			' ) AS rank FROM animal_count a WHERE a.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,' +
			points +
			' AS points FROM animal_count WHERE id IN (' +
			users +
			') ORDER BY points ASC ) AS a1 ON a1.points > ' +
			apoints +
			' WHERE a.id = ' +
			msg.author.id +
			' ORDER BY a1.points ASC LIMIT 2;';
		sql +=
			'SELECT a.id,a1.* FROM animal_count AS a LEFT JOIN ( SELECT *,' +
			points +
			' AS points FROM animal_count WHERE id IN (' +
			users +
			') ORDER BY points DESC ) AS a1 ON a1.points < ' +
			apoints +
			' WHERE a.id = ' +
			msg.author.id +
			' ORDER BY a1.points DESC LIMIT 2;';
		sql +=
			'SELECT *,' +
			points +
			' AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE ' +
			points +
			' > ' +
			apoints +
			' AND id IN (' +
			users +
			') ) AS rank FROM animal_count a WHERE a.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Zoo Ranking',
		function (query) {
			return (
				'\t\t' + global.toFancyNum(query.points) + ' zoo points: ' + animalUtil2.zooScore(query)
			);
		},
		p
	);
}

function getMoneyRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.money ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.money DESC LIMIT 2;';
		sql +=
			'SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money ) AS rank FROM cowoncy u WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN (' +
			users +
			') ORDER BY money ASC ) AS u1 ON u1.money > u.money WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.money ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.money ,u1.id,u1.money FROM cowoncy AS u LEFT JOIN ( SELECT id,money FROM cowoncy WHERE id IN (' +
			users +
			') ORDER BY money DESC ) AS u1 ON u1.money < u.money WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.money DESC LIMIT 2;';
		sql +=
			'SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > u.money AND id IN (' +
			users +
			') ) AS rank FROM cowoncy u WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Money Ranking',
		function (query) {
			return '\t\tCowoncy: ' + global.toFancyNum(query.money);
		},
		p
	);
}

function getRepRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count DESC LIMIT 2;';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count ) AS rank FROM rep u WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN (' +
			users +
			') ORDER BY count ASC ) AS u1 ON u1.count > u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.count ,u1.id,u1.count FROM rep AS u LEFT JOIN ( SELECT id,count FROM rep WHERE id IN (' +
			users +
			') ORDER BY count DESC ) AS u1 ON u1.count < u.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.count DESC LIMIT 2;';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > u.count AND id IN (' +
			users +
			') ) AS rank FROM rep u WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Cookie Ranking',
		function (query) {
			return '\t\tCookies: ' + global.toFancyNum(query.count);
		},
		p
	);
}

function getPetRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT * FROM animal WHERE (xp) > (SELECT xp FROM animal WHERE id = ' +
			msg.author.id +
			' ORDER BY xp DESC LIMIT 1) ORDER BY xp ASC LIMIT 2;';
		sql +=
			'SELECT * FROM animal WHERE (xp)  < (SELECT xp FROM animal WHERE id = ' +
			msg.author.id +
			' ORDER BY xp DESC LIMIT 1) ORDER BY xp DESC LIMIT 2;';
		sql +=
			'SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE (xp > c.xp)) AS rank FROM animal c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY c.xp DESC LIMIT 1;';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT * FROM animal WHERE id IN (' +
			users +
			') AND (xp) > (SELECT xp FROM animal WHERE id = ' +
			msg.author.id +
			' ORDER BY xp DESC LIMIT 1) ORDER BY xp ASC LIMIT 2;';
		sql +=
			'SELECT * FROM animal WHERE id  IN (' +
			users +
			') AND (xp)  < (SELECT xp FROM animal WHERE id = ' +
			msg.author.id +
			' ORDER BY xp DESC LIMIT 1) ORDER BY xp DESC LIMIT 2;';
		sql +=
			'SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE id IN (' +
			users +
			') AND (xp > c.xp)) AS rank FROM animal c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY c.xp DESC LIMIT 1;';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Pet Ranking',
		function (query) {
			let result = '\t\t';
			if (query.nickname) result += query.nickname + ' ';
			let lvl = animalUtil.toLvl(query.xp);
			result += `Lvl. ${lvl.lvl} ${lvl.currentXp}xp`;
			return result;
		},
		p
	);
}

function getHuntbotRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT id,total FROM autohunt WHERE total > (SELECT total FROM autohunt WHERE id = ' +
			msg.author.id +
			') ORDER BY total ASC LIMIT 2;';
		sql +=
			'SELECT id,total FROM autohunt WHERE total < (SELECT total FROM autohunt WHERE id = ' +
			msg.author.id +
			') ORDER BY total DESC LIMIT 2;';
		sql +=
			'SELECT id,total, (SELECT COUNT(*)+1 FROM autohunt WHERE autohunt.total > c.total) AS rank FROM autohunt c WHERE c.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT id,total FROM autohunt WHERE id IN (' +
			users +
			') AND total > (SELECT total FROM autohunt WHERE id = ' +
			msg.author.id +
			') ORDER BY total ASC LIMIT 2;';
		sql +=
			'SELECT id,total FROM autohunt WHERE id IN (' +
			users +
			') AND total < (SELECT total FROM autohunt WHERE id = ' +
			msg.author.id +
			') ORDER BY total DESC LIMIT 2;';
		sql +=
			'SELECT id,total, (SELECT COUNT(*)+1 FROM autohunt WHERE id IN (' +
			users +
			') AND autohunt.total > c.total) AS rank FROM autohunt c WHERE c.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'HuntBot Ranking',
		function (query) {
			return '\t\tEssence: ' + global.toFancyNum(query.total);
		},
		p
	);
}

function getLuckRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT id,lcount FROM luck WHERE lcount > (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount ASC LIMIT 2;';
		sql +=
			'SELECT id,lcount FROM luck WHERE lcount < (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount DESC LIMIT 2;';
		sql +=
			'SELECT id,lcount,(SELECT COUNT(*)+1 FROM luck WHERE lcount > u.lcount ) AS rank FROM luck u WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT id,lcount FROM luck WHERE id IN (' +
			users +
			') AND lcount > (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount ASC LIMIT 2;';
		sql +=
			'SELECT id,lcount FROM luck WHERE id IN (' +
			users +
			') AND lcount < (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount DESC LIMIT 2;';
		sql +=
			'SELECT id,lcount,(SELECT COUNT(*)+1 FROM luck WHERE lcount > u.lcount AND id IN (' +
			users +
			') ) AS rank FROM luck u WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Luck Ranking',
		function (query) {
			return '\t\tLuck: ' + global.toFancyNum(query.lcount);
		},
		p
	);
}

function getCurseRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT id,lcount FROM luck WHERE lcount < (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount DESC LIMIT 2;';
		sql +=
			'SELECT id,lcount FROM luck WHERE lcount > (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount ASC LIMIT 2;';
		sql +=
			'SELECT id,lcount,(SELECT COUNT(*)+1 FROM luck WHERE lcount < u.lcount ) AS rank FROM luck u WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT id,lcount FROM luck WHERE id IN (' +
			users +
			') AND lcount < (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount DESC LIMIT 2;';
		sql +=
			'SELECT id,lcount FROM luck WHERE id IN (' +
			users +
			') AND lcount > (SELECT lcount FROM luck WHERE id = ' +
			msg.author.id +
			') ORDER BY lcount ASC LIMIT 2;';
		sql +=
			'SELECT id,lcount,(SELECT COUNT(*)+1 FROM luck WHERE lcount < u.lcount AND id IN (' +
			users +
			') ) AS rank FROM luck u WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Curse Ranking',
		function (query) {
			return '\t\tLuck: ' + global.toFancyNum(query.lcount);
		},
		p
	);
}

/**
 * displays guild's ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		id 	- User's id
 */
function getGuildRanking(con, msg, id, p) {
	//Sql statements
	let sql =
		'SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count ASC ) AS g1 ON g1.count > g.count WHERE g.id = ' +
		id +
		' ORDER BY g1.count ASC LIMIT 2;';
	sql +=
		'SELECT g.id,g.count,g1.id,g1.count FROM guild AS g LEFT JOIN ( SELECT id,count FROM guild ORDER BY count DESC ) AS g1 ON g1.count < g.count WHERE g.id = ' +
		id +
		' ORDER BY g1.count DESC LIMIT 2;';
	sql +=
		'SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = ' +
		id +
		';';

	//Sql query
	con.query(sql, async function (err, rows, _fields) {
		if (err) throw err;
		let above = rows[0];
		let below = rows[1];
		let me = rows[2][0];
		if (!me) {
			p.send("You haven't said 'owo' yet!");
			return;
		}
		let guildRank = parseInt(me.rank);
		let rank = guildRank - above.length;
		let embed = '';

		//People above user
		for (let ele of above.reverse()) {
			let id = String(ele.id);
			if (id !== '' && id !== null && !isNaN(id)) {
				let name = await p.fetch.getGuild(id, true);
				if (!name || name == '') name = 'Guild Left Bot';
				else name = name.name;
				name = name.replace('discord.gg', 'discord,gg');
				embed +=
					'#' +
					rank +
					'\t' +
					name +
					'\n\t\tcollectively said owo ' +
					global.toFancyNum(ele.count) +
					' times!\n';
				rank++;
			} else if (rank == 0) rank = 1;
		}

		//Current user
		let uname = await p.fetch.getGuild(me.id, true);
		if (!uname || uname == '') uname = 'Guild Left Bot';
		else uname = uname.name;
		uname = uname.replace('discord.gg', 'discord,gg');
		embed +=
			'< ' +
			rank +
			'   ' +
			uname +
			' >\n\t\tcollectively said owo ' +
			global.toFancyNum(me.count) +
			' times!\n';
		rank++;

		//People below user
		for (let ele of below) {
			let id = String(ele.id);
			if (id !== '' && id !== null && !isNaN(id)) {
				let name = await p.fetch.getGuild(id, true);
				if (!name || name == '') name = 'Guild Left Bot';
				else name = name.name;
				name = name.replace('discord.gg', 'discord,gg');
				embed +=
					'#' +
					rank +
					'\t' +
					name +
					'\n\t\tcollectively said owo ' +
					global.toFancyNum(ele.count) +
					' times!\n';
				rank++;
			}
		}

		//Add top and bottom
		if (guildRank > 3)
			embed =
				'```md\n< ' +
				uname +
				"'s Global Ranking >\n> Your guild rank is: " +
				guildRank +
				'\n>\t\tcollectively said owo ' +
				global.toFancyNum(rows[2][0].count) +
				' times!\n\n>...\n' +
				embed;
		else
			embed =
				'```md\n< ' +
				uname +
				"'s Global Ranking >\n> Your guild rank is: " +
				guildRank +
				'\n>\t\tcollectively said owo ' +
				global.toFancyNum(rows[2][0].count) +
				' times!\n\n' +
				embed;

		if (rank - guildRank == 3) embed += '>...\n';

		let date = new Date();
		embed +=
			'\n*owo counting has a 10s cooldown* | ' +
			date.toLocaleString('en-US', {
				month: '2-digit',
				day: '2-digit',
				year: 'numeric',
				hour12: false,
				hour: '2-digit',
				minute: '2-digit',
			}) +
			'```';
		p.send(embed, null, null, { split: { prepend: '```md\n', append: '```' } });
	});
}

function getTeamRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT * FROM animal WHERE (xp) > (SELECT xp FROM animal NATURAL JOIN cowoncy WHERE id = ' +
			msg.author.id +
			' AND pet = name) ORDER BY xp ASC LIMIT 2;';
		sql +=
			'SELECT * FROM animal WHERE (xp)  < (SELECT xp FROM animal NATURAL JOIN cowoncy WHERE id = ' +
			msg.author.id +
			' AND pet = name) ORDER BY xp DESC LIMIT 2;';
		sql +=
			'SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE (xp > c.xp)) AS rank FROM animal c NATURAL JOIN cowoncy WHERE c.id = ' +
			msg.author.id +
			' AND c.name = pet  ORDER BY xp DESC LIMIT 1;';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT * FROM animal WHERE id IN (' +
			users +
			') AND (lvl,xp) > (SELECT lvl,xp FROM animal NATURAL JOIN cowoncy WHERE id = ' +
			msg.author.id +
			' AND pet = name) ORDER BY lvl ASC, xp ASC LIMIT 2;';
		sql +=
			'SELECT * FROM animal WHERE id IN (' +
			users +
			') AND (lvl,xp) < (SELECT lvl,xp FROM animal NATURAL JOIN cowoncy WHERE id = ' +
			msg.author.id +
			' AND pet = name) ORDER BY lvl DESC, xp DESC LIMIT 2;';
		sql +=
			'SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE id IN (' +
			users +
			') AND ((lvl > c.lvl) OR (lvl = c.lvl AND xp > c.xp))) AS rank FROM animal c NATURAL JOIN cowoncy WHERE c.id = ' +
			msg.author.id +
			' AND c.name = pet ORDER BY lvl DESC, xp DESC LIMIT 1;';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Pet Ranking',
		function (query) {
			var result = '\t\t';
			if (query.nickname) result += query.nickname + ' ';
			result += 'Lvl:' + query.lvl + ' Att:' + query.att + ' Hp:' + query.hp;
			return result;
		},
		p
	);
}

function getBattleRanking(globalRank, con, msg, p) {
	let sql;
	const teamSql = `SELECT pt_tmp.pgid FROM user u_tmp
				INNER JOIN pet_team pt_tmp
					ON pt_tmp.uid = u_tmp.uid
				LEFT JOIN pet_team_active pt_act
					ON pt_tmp.pgid = pt_act.pgid
			WHERE u_tmp.id = ${p.msg.author.id}
			ORDER BY pt_act.pgid DESC, pt_tmp.pgid ASC
			LIMIT 1`;
	if (globalRank) {
		sql = `SELECT tmp.tname,tmp.id,tmp.streak
			FROM pet_team AS pt
				LEFT JOIN ( SELECT tname,id,streak
					FROM pet_team pt2
						INNER JOIN user u2 ON pt2.uid = u2.uid
					ORDER BY streak ASC ) AS tmp
					ON tmp.streak > pt.streak
			WHERE pt.pgid = (${teamSql})
			ORDER BY tmp.streak
			ASC LIMIT 2;`;
		sql += `SELECT tmp.tname,tmp.id,tmp.streak
			FROM pet_team AS pt
				LEFT JOIN ( SELECT tname,id,streak
					FROM pet_team pt2
						INNER JOIN user u2 ON pt2.uid = u2.uid
					ORDER BY streak DESC ) AS tmp
					ON tmp.streak < pt.streak
			WHERE pt.pgid = (${teamSql})
			ORDER BY tmp.streak
			DESC LIMIT 2;`;
		sql += `SELECT pt.tname,u.id,pt.streak,(SELECT COUNT(*)+1 FROM pet_team WHERE streak > pt.streak) AS rank
			FROM user u
				INNER JOIN pet_team pt ON pt.uid = u.uid
				LEFT JOIN pet_team_active pt_act ON pt.pgid = pt_act.pgid
			WHERE u.id = ${p.msg.author.id}
			ORDER BY pt_act.pgid DESC, pt.pgid ASC
			LIMIT 1;`;
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql = `SELECT tmp.tname,tmp.id,tmp.streak
			FROM pet_team AS pt
				LEFT JOIN ( SELECT tname,id,streak
					FROM pet_team pt2
						INNER JOIN user u2 ON pt2.uid = u2.uid
					WHERE id in (${users})
					ORDER BY streak ASC ) AS tmp
					ON tmp.streak > pt.streak
			WHERE pt.pgid = (${teamSql})
			ORDER BY tmp.streak
			ASC LIMIT 2;`;
		sql += `SELECT tmp.tname,tmp.id,tmp.streak
			FROM pet_team AS pt
				LEFT JOIN ( SELECT tname,id,streak
					FROM pet_team pt2
						INNER JOIN user u2 ON pt2.uid = u2.uid
					WHERE id in (${users})
					ORDER BY streak DESC ) AS tmp
					ON tmp.streak < pt.streak
			WHERE pt.pgid = (${teamSql})
			ORDER BY tmp.streak
			DESC LIMIT 2;`;
		sql += `SELECT pt.tname,u.id,pt.streak,(SELECT COUNT(*)+1 FROM user INNER JOIN pet_team ON user.uid = pet_team.uid WHERE id IN (${users}) AND streak > pt.streak) AS rank
			FROM user u
				INNER JOIN pet_team pt ON pt.uid = u.uid
				LEFT JOIN pet_team_active pt_act ON pt.pgid = pt_act.pgid
			WHERE u.id = ${p.msg.author.id}
			ORDER BY pt_act.pgid DESC, pt.pgid ASC
			LIMIT 1;`;
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Battle Streak Ranking',
		function (query) {
			return (
				'\t\t' +
				(query.tname ? query.tname + ' - ' : '') +
				'Streak: ' +
				global.toFancyNum(query.streak)
			);
		},
		p
	);
}
function getDailyRanking(globalRank, con, msg, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT u.id,u.daily_streak,u1.id,u1.daily_streak FROM cowoncy AS u LEFT JOIN ( SELECT id,daily_streak FROM cowoncy ORDER BY daily_streak ASC ) AS u1 ON u1.daily_streak > u.daily_streak WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.daily_streak ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.daily_streak,u1.id,u1.daily_streak FROM cowoncy AS u LEFT JOIN ( SELECT id,daily_streak FROM cowoncy ORDER BY daily_streak DESC ) AS u1 ON u1.daily_streak < u.daily_streak WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.daily_streak DESC LIMIT 2;';
		sql +=
			'SELECT id,daily_streak,(SELECT COUNT(*)+1 FROM cowoncy WHERE daily_streak > u.daily_streak) AS rank FROM cowoncy u WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT u.id,u.daily_streak,u1.id,u1.daily_streak FROM cowoncy AS u LEFT JOIN ( SELECT id,daily_streak FROM cowoncy WHERE id IN (' +
			users +
			') ORDER BY daily_streak ASC ) AS u1 ON u1.daily_streak > u.daily_streak WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.daily_streak ASC LIMIT 2;';
		sql +=
			'SELECT u.id,u.daily_streak ,u1.id,u1.daily_streak FROM cowoncy AS u LEFT JOIN ( SELECT id,daily_streak FROM cowoncy WHERE id IN (' +
			users +
			') ORDER BY daily_streak DESC ) AS u1 ON u1.daily_streak < u.daily_streak WHERE u.id = ' +
			msg.author.id +
			' ORDER BY u1.daily_streak DESC LIMIT 2;';
		sql +=
			'SELECT id,daily_streak ,(SELECT COUNT(*)+1 FROM cowoncy WHERE daily_streak > u.daily_streak AND id IN (' +
			users +
			') ) AS rank FROM cowoncy u WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Daily Streak Ranking',
		function (query) {
			return '\t\tStreak: ' + global.toFancyNum(query.daily_streak);
		},
		p
	);
}

const points =
	'(common*' +
	animals.points.common +
	'+' +
	'uncommon*' +
	animals.points.uncommon +
	'+' +
	'rare*' +
	animals.points.rare +
	'+' +
	'epic*' +
	animals.points.epic +
	'+' +
	'mythical*' +
	animals.points.mythical +
	'+' +
	'special*' +
	animals.points.special +
	'+' +
	'patreon*' +
	animals.points.patreon +
	'+' +
	'cpatreon*' +
	animals.points.cpatreon +
	'+' +
	'hidden*' +
	animals.points.hidden +
	'+' +
	'gem*' +
	animals.points.gem +
	'+' +
	'distorted*' +
	animals.points.distorted +
	'+' +
	'bot*' +
	animals.points.bot +
	'+' +
	'legendary*' +
	animals.points.legendary +
	'+' +
	'fabled*' +
	animals.points.fabled +
	')';
const apoints =
	'(a.common*' +
	animals.points.common +
	'+' +
	'a.uncommon*' +
	animals.points.uncommon +
	'+' +
	'a.rare*' +
	animals.points.rare +
	'+' +
	'a.epic*' +
	animals.points.epic +
	'+' +
	'a.mythical*' +
	animals.points.mythical +
	'+' +
	'a.special*' +
	animals.points.special +
	'+' +
	'a.patreon*' +
	animals.points.patreon +
	'+' +
	'a.cpatreon*' +
	animals.points.cpatreon +
	'+' +
	'a.hidden*' +
	animals.points.hidden +
	'+' +
	'a.gem*' +
	animals.points.gem +
	'+' +
	'a.distorted*' +
	animals.points.distorted +
	'+' +
	'a.bot*' +
	animals.points.bot +
	'+' +
	'a.legendary*' +
	animals.points.legendary +
	'+' +
	'a.fabled*' +
	animals.points.fabled +
	')';

async function getLevelRanking(global, p) {
	let userRank, userLevel, ranking, text;
	if (global) {
		userRank = await levels.getUserRank(p.msg.author.id);
		userLevel = await levels.getUserLevel(p.msg.author.id);
		ranking = await levels.getNearbyXP(userRank);
		text =
			'```md\n< ' +
			p.msg.author.username +
			"'s Global Level Ranking >\n> Your Rank: " +
			p.global.toFancyNum(userRank) +
			'\n>\t\tLvl ' +
			userLevel.level +
			' ' +
			userLevel.currentxp +
			'xp\n\n';
	} else {
		userRank = await levels.getUserServerRank(p.msg.author.id, p.msg.channel.guild.id);
		userLevel = await levels.getUserServerLevel(p.msg.author.id, p.msg.channel.guild.id);
		ranking = await levels.getNearbyServerXP(userRank, p.msg.channel.guild.id);
		text =
			'```md\n< ' +
			p.msg.author.username +
			"'s Level Ranking for " +
			p.msg.channel.guild.name +
			' >\n> Your Rank: ' +
			p.global.toFancyNum(userRank) +
			'\n>\t\tLvl ' +
			userLevel.level +
			' ' +
			userLevel.currentxp +
			'xp\n\n';
	}

	let counter = userRank - 2;
	if (counter <= 1) counter = 1;
	else text += '>...\n';

	for (let i in ranking) {
		if (i % 2) {
			let tempLevel = await levels.getLevel(ranking[i]);
			text += '\t\tLvl ' + tempLevel.level + ' ' + tempLevel.currentxp + 'xp\n';
		} else {
			if (ranking[i] == p.msg.author.id) {
				let user = p.msg.author.username;
				text += '< ' + counter + '\t' + user + ' >\n';
			} else {
				let user = await p.fetch.getUser(ranking[i]);
				if (!user) user = 'User Left Discord';
				else user = user.username;
				text += '#' + counter + '\t' + user + '\n';
			}
			counter++;
		}
	}
	let date = new Date();
	text +=
		'>...\n\n' +
		date.toLocaleString('en-US', {
			month: '2-digit',
			day: '2-digit',
			year: 'numeric',
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
		}) +
		'```';

	p.send(text, null, null, { split: { prepend: '```md\n', append: '```' } });
}

function getShardRanking(globalRank, con, msg, p) {
	let sql;
	let table = 'user u INNER JOIN shards s ON u.uid = s.uid';
	let table2 = 'user u2 INNER JOIN shards s2 ON u2.uid = s2.uid';
	if (globalRank) {
		sql =
			'SELECT u.id,s.count, u1.id,u1.count FROM ' +
			table +
			' LEFT JOIN ( SELECT id,s2.count FROM ' +
			table2 +
			' ORDER BY s2.count ASC ) AS u1 ON u1.count > s.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY s.count ASC LIMIT 2;';
		sql +=
			'SELECT u.id,s.count, u1.id,u1.count FROM ' +
			table +
			' LEFT JOIN ( SELECT id,s2.count FROM ' +
			table2 +
			' ORDER BY s2.count DESC ) AS u1 ON u1.count < s.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY s.count DESC LIMIT 2;';
		sql +=
			'SELECT id,s.count,(SELECT COUNT(*)+1 FROM shards INNER JOIN user ON user.uid = shards.uid WHERE shards.count > s.count ) AS rank FROM shards s INNER JOIN user u ON u.uid = s.uid WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT u.id,s.count, u1.id,u1.count FROM ' +
			table +
			' LEFT JOIN ( SELECT id,s2.count FROM ' +
			table2 +
			' WHERE id IN (' +
			users +
			') ORDER BY s2.count ASC ) AS u1 ON u1.count > s.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY s.count ASC LIMIT 2;';
		sql +=
			'SELECT u.id,s.count, u1.id,u1.count FROM ' +
			table +
			' LEFT JOIN ( SELECT id,s2.count FROM ' +
			table2 +
			' WHERE id IN (' +
			users +
			') ORDER BY s2.count DESC ) AS u1 ON u1.count < s.count WHERE u.id = ' +
			msg.author.id +
			' ORDER BY s.count DESC LIMIT 2;';
		sql +=
			'SELECT id,s.count,(SELECT COUNT(*)+1 FROM shards INNER JOIN user ON user.uid = shards.uid WHERE id IN (' +
			users +
			') AND shards.count > s.count ) AS rank FROM shards s INNER JOIN user u ON u.uid = s.uid WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Weapon Shard Ranking',
		function (query) {
			return '\t\tShards: ' + global.toFancyNum(query.count);
		},
		p
	);
}
