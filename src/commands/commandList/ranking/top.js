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
const WeaponInterface = require('../battle/WeaponInterface.js');
const weaponUtil = require('../battle/util/weaponUtil.js');

const weaponArgs = Object.keys(WeaponInterface.weapons).map((id) => {
	return 'w' + (100 + parseInt(id));
});

module.exports = new CommandInterface({
	alias: ['top', 'rank', 'ranking'],

	args: 'points|guild|zoo|money|cookie|pet|huntbot|luck|curse|battle|daily|level|shard|w|w{wid} [global] {count}',

	desc: 'Displays the top ranking of each category!',

	example: ['owo top zoo', 'owo top cowoncy global', 'owo top p g'],

	related: ['owo my'],

	permissions: ['sendMessages'],

	group: ['rankings'],

	cooldown: 60000,
	half: 20,
	six: 200,
	bot: true,

	execute: async function (p) {
		await display(p, p.con, p.msg, p.args);
	},
});

/**
 * Check for valid arguments to display leaderboards
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg 	- Discord's message
 * @param {string[]}		args 	- Command arguments
 */
async function display(p, con, msg, args) {
	//check for args
	let globala = false;

	let points = false;
	let guild = false;
	let money = false;
	let zoo = false;
	let rep = false;
	let pet = false;
	let huntbot, luck, curse, daily, battle, level, shard, tt;

	let invalid = false;
	let count = 5;

	for (let i = 0; i < args.length; i++) {
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
			!daily &&
			!battle &&
			!level &&
			!shard &&
			!tt
		) {
			if (args[i] === 'points' || args[i] === 'point' || args[i] === 'p') points = true;
			else if (args[i] === 'guild' || args[i] === 'server' || args[i] === 's' || args[i] === 'g')
				guild = true;
			else if (args[i] === 'zoo' || args[i] === 'z') zoo = true;
			else if (
				args[i] === 'cowoncy' ||
				args[i] === 'money' ||
				args[i] === 'm' ||
				args[i] === 'c' ||
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
			else if (args[i] === 'daily') daily = true;
			else if (args[i] === 'level' || args[i] === 'lvl' || args[i] === 'xp') level = true;
			else if (
				args[i] === 'shards' ||
				args[i] === 'shard' ||
				args[i] === 'ws' ||
				args[i] === 'weaponshard'
			)
				shard = true;
			else if (
				['tt', 'takedown', 'takdowntracker', 'tracker', 'weapon', 'w'].includes(args[i]) ||
				weaponArgs.includes(args[i])
			)
				tt = args[i];
			else if (args[i] === 'global' || args[i] === 'g') globala = true;
			else if (global.isInt(args[i])) count = parseInt(args[i]);
			else invalid = true;
		} else if (args[i] === 'global' || args[i] === 'g') globala = true;
		else if (global.isInt(args[i])) count = parseInt(args[i]);
		else invalid = true;
	}
	if (count > 25) count = 25;
	else if (count < 1) count = 5;

	if (invalid) {
		p.errorMsg(', Invalid ranking type!', 3000);
	} else {
		if (points) getRanking(globala, con, msg, count, p);
		else if (guild) getGuildRanking(con, msg, count, p);
		else if (zoo) getZooRanking(globala, con, msg, count, p);
		else if (money) getMoneyRanking(globala, con, msg, count, p);
		else if (rep) getRepRanking(globala, con, msg, count, p);
		else if (pet) getPetRanking(globala, con, msg, count, p);
		else if (huntbot) getHuntbotRanking(globala, con, msg, count, p);
		else if (luck) getLuckRanking(globala, con, msg, count, p);
		else if (curse) getCurseRanking(globala, con, msg, count, p);
		else if (battle) getBattleRanking(globala, con, msg, count, p);
		else if (daily) getDailyRanking(globala, con, msg, count, p);
		else if (level) await getLevelRanking(globala, p, count);
		else if (shard) getShardRanking(globala, con, msg, count, p);
		else if (tt) getTTRanking(globala, con, msg, count, p, tt);
		else getRanking(globala, con, msg, count, p);
	}
}

function displayRanking(con, msg, count, globalRank, sql, title, subText, p) {
	con.query(sql, async function (err, rows, _fields) {
		if (err) {
			console.error(err);
			return;
		}
		let rank = 1;
		let embed = '```md\n< ' + title + ' >\n';
		if (rows[1][0] !== undefined && rows[1][0] !== null) {
			embed += '> Your Rank: ' + rows[1][0].rank + '\n';
			embed += subText(rows[1][0], 0);
		}
		for (let ele of rows[0]) {
			let id = String(ele.id);
			let name = '';

			let user = await p.fetch.getUser(id, true);
			if (!user) name = 'User Left Bot';
			else name = '' + p.getUniqueName(user);

			name = name.replace('discord.gg', 'discord,gg').replace(/(```)/g, '`\u200b``');
			embed += '#' + rank + '\t' + name + subText(ele, rank);
			rank++;
		}
		let date = new Date();
		embed +=
			date.toLocaleString('en-US', {
				month: '2-digit',
				day: '2-digit',
				year: 'numeric',
				hour12: false,
				hour: '2-digit',
				minute: '2-digit',
			}) + '```';
		p.send(embed, null, null, { split: { prepend: '```md\n', append: '```' } });
	});
}

/**
 * Top OwO Rankings
 * @param {boolean}		globalRank	- Global rankings
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT * FROM user ORDER BY count DESC LIMIT ' + count + ';';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE count > u.count) AS rank FROM user u WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let userids = global.getids(msg.channel.guild.members);
		sql =
			'SELECT * FROM user WHERE id IN ( ' + userids + ' ) ORDER BY count DESC LIMIT ' + count + ';';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM user WHERE id IN (' +
			userids +
			') AND count > u.count) AS rank FROM user u WHERE u.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global OwO Rankings' : 'OwO Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tyou said owo ' + global.toFancyNum(query.count) + ' times!\n\n';
			else return '\n\t\tsaid owo ' + global.toFancyNum(query.count) + ' times!\n';
		},
		p
	);
}

/**
 * displays zoo ranking
 */
function getZooRanking(globalRank, con, msg, count, p) {
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `SELECT *
		FROM animal_count
		${globalRank ? '' : `WHERE id IN (${users})`}
		ORDER BY total DESC
		LIMIT ${count};`;
	sql += `SELECT *,
			(
				SELECT COUNT(*) + 1
				FROM animal_count
				WHERE total > a.total
					${globalRank ? '' : `AND id IN (${users})`}
			) AS rank
		FROM animal_count a
		WHERE a.id = ${p.msg.author.id};`;

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global Zoo Rankings' : 'Zoo Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0)
				return (
					'>\t\t' +
					global.toFancyNum(query.total) +
					' zoo points: ' +
					animalUtil2.zooScore(query) +
					'\n\n'
				);
			else
				return (
					'\n\t\t' +
					global.toFancyNum(query.total) +
					' zoo points: ' +
					animalUtil2.zooScore(query) +
					'\n'
				);
		},
		p
	);
}

/**
 * displays cowoncy ranking
 */
function getMoneyRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT * FROM cowoncy ORDER BY money DESC LIMIT ' + count + ';';
		sql +=
			'SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE money > c.money) AS rank FROM cowoncy c WHERE c.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT * FROM cowoncy WHERE id IN (' + users + ') ORDER BY money DESC LIMIT ' + count + ';';
		sql +=
			'SELECT id,money,(SELECT COUNT(*)+1 FROM cowoncy WHERE id IN (' +
			users +
			') AND money > c.money) AS rank FROM cowoncy c WHERE c.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global Cowoncy Rankings' : 'Cowoncy Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tCowoncy: ' + global.toFancyNum(query.money) + '\n\n';
			else return '\n\t\tCowoncy: ' + global.toFancyNum(query.money) + '\n';
		},
		p
	);
}

/**
 * displays rep ranking
 */
function getRepRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT * FROM rep ORDER BY count DESC LIMIT ' + count + ';';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE count > c.count) AS rank FROM rep c WHERE c.id = ' +
			msg.author.id +
			';';
	} else {
		var users = global.getids(msg.channel.guild.members);
		sql = 'SELECT * FROM rep WHERE id IN (' + users + ') ORDER BY count DESC LIMIT ' + count + ';';
		sql +=
			'SELECT id,count,(SELECT COUNT(*)+1 FROM rep WHERE id IN (' +
			users +
			') AND count > c.count) AS rank FROM rep c WHERE c.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global Cookie Rankings' : 'Cookie Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tCookies: ' + global.toFancyNum(query.count) + '\n\n';
			else return '\n\t\tCookies: ' + global.toFancyNum(query.count) + '\n';
		},
		p
	);
}

/**
 * displays pet ranking
 */
function getPetRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT * FROM animal ORDER BY xp DESC LIMIT ' + count + ';';
		sql +=
			'SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE xp > c.xp) AS rank FROM animal c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY xp DESC LIMIT 1;';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql = 'SELECT * FROM animal WHERE id IN (' + users + ') ORDER BY xp DESC LIMIT ' + count + ';';
		sql +=
			'SELECT *,(SELECT COUNT(*)+1 FROM animal WHERE id IN (' +
			users +
			') AND xp > c.xp) AS rank FROM animal c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY xp DESC LIMIT 1;';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global Pet Rankings' : 'Pet Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			let result = '\t\t ';
			if (query.nickname) result += query.nickname + ' ';
			let lvl = animalUtil.toLvl(query.xp);
			result += `Lvl. ${lvl.lvl} ${lvl.currentXp}xp\n`;
			if (rank == 0) return '>' + result + '\n';
			else return '\n' + result;
		},
		p
	);
}

/**
 * Top HuntBot Rankings
 */
function getHuntbotRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT id,total FROM autohunt ORDER BY total DESC LIMIT ' + count + ';';
		sql +=
			'SELECT id,total, (SELECT COUNT(*)+1 FROM autohunt WHERE autohunt.total > c.total) AS rank FROM autohunt c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY total DESC LIMIT 1;';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT id,total FROM autohunt WHERE id IN (' +
			users +
			') ORDER BY total DESC LIMIT ' +
			count +
			';';
		sql +=
			'SELECT id,total, (SELECT COUNT(*)+1 FROM autohunt WHERE id IN (' +
			users +
			') AND autohunt.total > c.total) AS rank FROM autohunt c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY total DESC LIMIT 1;';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global HuntBot Rankings' : 'HuntBot Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tEssence: ' + global.toFancyNum(query.total) + '\n\n';
			else return '\n\t\tEssence: ' + global.toFancyNum(query.total) + '\n';
		},
		p
	);
}

/**
 * Top HuntBot Rankings
 */
function getLuckRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT * FROM luck ORDER BY lcount DESC LIMIT ' + count + ';';
		sql +=
			'SELECT *, (SELECT COUNT(*)+1 FROM luck WHERE lcount > c.lcount) AS rank FROM luck c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY lcount DESC LIMIT 1;';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT * FROM luck WHERE id IN (' + users + ') ORDER BY lcount DESC LIMIT ' + count + ';';
		sql +=
			'SELECT *, (SELECT COUNT(*)+1 FROM luck WHERE id IN (' +
			users +
			') AND lcount > c.lcount) AS rank FROM luck c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY lcount DESC LIMIT 1;';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global Luck Rankings' : 'Luck Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tLuck: ' + global.toFancyNum(query.lcount) + '\n\n';
			else return '\n\t\tLuck: ' + global.toFancyNum(query.lcount) + '\n';
		},
		p
	);
}

/**
 * Top HuntBot Rankings
 */
function getCurseRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT * FROM luck ORDER BY lcount ASC LIMIT ' + count + ';';
		sql +=
			'SELECT *, (SELECT COUNT(*)+1 FROM luck WHERE lcount < c.lcount) AS rank FROM luck c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY lcount DESC LIMIT 1;';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql = 'SELECT * FROM luck WHERE id IN (' + users + ') ORDER BY lcount ASC LIMIT ' + count + ';';
		sql +=
			'SELECT *, (SELECT COUNT(*)+1 FROM luck WHERE id IN (' +
			users +
			') AND lcount < c.lcount) AS rank FROM luck c WHERE c.id = ' +
			msg.author.id +
			' ORDER BY lcount DESC LIMIT 1;';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank ? 'Global Curse Rankings' : 'Curse Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tLuck: ' + global.toFancyNum(query.lcount) + '\n\n';
			else return '\n\t\tLuck: ' + global.toFancyNum(query.lcount) + '\n';
		},
		p
	);
}

/**
 * displays guild ranking
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Message}	msg	- User's message
 * @param {int} 		count 	- number of ranks to display
 */
function getGuildRanking(con, msg, count, p) {
	//Grabs top 5
	var sql = 'SELECT * FROM guild ORDER BY count DESC LIMIT ' + count + ';';
	sql +=
		'SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = ' +
		msg.channel.guild.id +
		';';

	//Create an embeded message
	con.query(sql, async function (err, rows, _fields) {
		if (err) {
			console.error(err);
			return;
		}
		let rank = 1;
		let embed = '```md\n< Top ' + count + ' Guild OwO Rankings >\n';
		if (rows[1][0] !== undefined && rows[1][0] !== null) {
			embed += '> Your Guild Rank: ' + rows[1][0].rank + '\n';
			embed += '>\t\tcollectively said owo ' + global.toFancyNum(rows[1][0].count) + ' times!\n\n';
		}
		for (let ele of rows[0]) {
			let id = String(ele.id);
			let name = await p.fetch.getGuild(id, true);
			if (!name) name = 'Guild Left Bot';
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
		let date = new Date();
		embed +=
			'\n*Spamming owo will not count!!!* | ' +
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
	});
}

/**
 * Top Battle Rankings
 */
function getBattleRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = `SELECT *
			FROM pet_team
				INNER JOIN user ON user.uid = pet_team.uid
			ORDER BY streak
			DESC LIMIT ${count};`;
		sql += `SELECT pt.tname,u.id,pt.streak,(SELECT COUNT(*)+1 FROM pet_team WHERE streak > pt.streak) AS rank
			FROM user u
				INNER JOIN pet_team pt ON pt.uid = u.uid
				LEFT JOIN pet_team_active pt_act ON pt.pgid = pt_act.pgid
			WHERE u.id = ${p.msg.author.id}
			ORDER BY pt_act.pgid DESC, pt.pgid ASC
			LIMIT 1;`;
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql = `SELECT *
			FROM pet_team
				INNER JOIN user ON pet_team.uid = user.uid
			WHERE id IN (${users})
			ORDER BY streak DESC
			LIMIT ${count};`;
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
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank
				? 'Global Battle Streak Rankings'
				: 'Battle Streak Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0)
				return (
					'>\t\t' +
					(query.tname ? query.tname + ' - ' : '') +
					'Streak: ' +
					global.toFancyNum(query.streak) +
					'\n\n'
				);
			else
				return (
					'\n\t\t' +
					(query.tname ? query.tname + ' - ' : '') +
					'Streak: ' +
					global.toFancyNum(query.streak) +
					'\n'
				);
		},
		p
	);
}

/**
 * Top daily rankings
 */
function getDailyRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT * FROM cowoncy ORDER BY daily_streak DESC LIMIT ' + count + ';';
		sql +=
			'SELECT *, (SELECT COUNT(*)+1 FROM cowoncy WHERE daily_streak > c.daily_streak) AS rank FROM cowoncy c WHERE c.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT * FROM cowoncy WHERE id IN (' +
			users +
			') ORDER BY daily_streak DESC LIMIT ' +
			count +
			';';
		sql +=
			'SELECT *, (SELECT COUNT(*)+1 FROM cowoncy WHERE id IN (' +
			users +
			') AND daily_streak > c.daily_streak) AS rank FROM cowoncy c WHERE c.id = ' +
			msg.author.id +
			';';
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank
				? 'Global Daily Streak Rankings'
				: 'Daily Streak Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tStreak: ' + global.toFancyNum(query.daily_streak) + '\n\n';
			else return '\n\t\tStreak: ' + global.toFancyNum(query.daily_streak) + '\n';
		},
		p
	);
}

async function getLevelRanking(global, p, count) {
	let ranking, userRank, userLevel, text;
	if (global) {
		ranking = await levels.getGlobalRanking(count);
		userRank = await levels.getUserRank(p.msg.author.id);
		userLevel = await levels.getUserLevel(p.msg.author.id);
		text =
			'```md\n< Top ' +
			count +
			' Global Level Rankings >\n> Your Rank: ' +
			p.global.toFancyNum(userRank) +
			'\n>\t\tLvl ' +
			userLevel.level +
			' ' +
			userLevel.currentxp +
			'xp\n\n';
	} else {
		ranking = await levels.getServerRanking(p.msg.channel.guild.id, count);
		userRank = await levels.getUserServerRank(p.msg.author.id, p.msg.channel.guild.id);
		userLevel = await levels.getUserServerLevel(p.msg.author.id, p.msg.channel.guild.id);
		text =
			'```md\n< Top ' +
			count +
			' Level Rankings for ' +
			p.msg.channel.guild.name +
			' >\n> Your Rank: ' +
			p.global.toFancyNum(userRank) +
			'\n>\t\tLvl ' +
			userLevel.level +
			' ' +
			userLevel.currentxp +
			'xp\n\n';
	}
	let counter = 0;

	for (let i in ranking) {
		if (i % 2) {
			let tempLevel = await levels.getLevel(ranking[i]);
			text += '\t\tLvl ' + tempLevel.level + ' ' + tempLevel.currentxp + 'xp\n';
		} else {
			counter++;
			let user = await p.fetch.getUser(ranking[i]);
			if (!user) user = 'User Left Discord';
			else user = p.getUniqueName(user);
			text += '#' + counter + '\t' + user + '\n';
		}
	}

	let date = new Date();
	text +=
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

	p.send(text, null, null, { split: { prepend: '```md\n', append: '```' } });
}

/**
 * displays weaponshard ranking
 */
function getShardRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql =
			'SELECT id,shards.count FROM shards INNER JOIN user ON user.uid = shards.uid ORDER BY shards.count DESC LIMIT ' +
			count +
			';';
		sql +=
			'SELECT id,s.count,(SELECT COUNT(*)+1 FROM shards INNER JOIN user ON user.uid = shards.uid WHERE shards.count > s.count ) AS rank FROM shards s INNER JOIN user u ON u.uid = s.uid WHERE u.id = ' +
			msg.author.id +
			';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql =
			'SELECT id,shards.count FROM shards INNER JOIN user ON user.uid = shards.uid WHERE id IN (' +
			users +
			') ORDER BY shards.count DESC LIMIT ' +
			count +
			';';
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
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank
				? 'Global Weapon Shard Rankings'
				: 'Weapon Shard Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\t\tShards: ' + global.toFancyNum(query.count) + '\n\n';
			else return '\n\t\tShards: ' + global.toFancyNum(query.count) + '\n';
		},
		p
	);
}

/**
 * displays weapon ranking
 */
function getTTRanking(globalRank, con, msg, count, p, tt) {
	let wid;
	if (/^w\d{3}$/gi.test(tt)) {
		wid = parseInt(tt.substring(1)) - 100;
	}
	let sql;
	if (globalRank) {
		sql = `
			SELECT
				uwk.kills,
				uw.wid, uw.uwid, uw.avg, uw.wear,
				u.id
			FROM user_weapon_kills uwk
				LEFT JOIN user_weapon uw ON uwk.uwid = uw.uwid
				LEFT JOIN user u ON uw.uid = u.uid
			${wid ? `WHERE wid = ${wid}` : ''}
			ORDER BY uwk.kills DESC
			LIMIT ${count};
		`;
		sql += `
			SELECT
				uwk.kills,
				uw.wid, uw.uwid, uw.avg, uw.wear,
				u.id,
				(SELECT COUNT(*) + 1 FROM user_weapon_kills WHERE user_weapon_kills.kills > uwk.kills) AS rank
			FROM user_weapon_kills uwk
				LEFT JOIN user_weapon uw ON uwk.uwid = uw.uwid
				LEFT JOIN user u ON uw.uid = u.uid
			WHERE u.id = ${p.msg.author.id}
				${wid ? `AND wid = ${wid}` : ''}
			ORDER BY uwk.kills DESC
			LIMIT 1;
		`;
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql = `
			SELECT
				uwk.kills,
				uw.wid, uw.uwid, uw.avg, uw.wear,
				u.id
			FROM user_weapon_kills uwk
				LEFT JOIN user_weapon uw ON uwk.uwid = uw.uwid
				LEFT JOIN user u ON uw.uid = u.uid
			WHERE u.id IN (${users})
				${wid ? `AND wid = ${wid}` : ''}
			ORDER BY uwk.kills DESC
			LIMIT ${count};
		`;
		sql += `
			SELECT
				uwk.kills,
				uw.wid, uw.uwid, uw.avg, uw.wear,
				u.id,
				(SELECT COUNT(*) + 1
					FROM user_weapon_kills
						LEFT JOIN user_weapon ON user_weapon.uwid = user_weapon_kills.uwid
						LEFT JOIN user ON user_weapon.uid = user.uid
					WHERE user_weapon_kills.kills > uwk.kills
						AND user.id IN (${users})
						${wid ? `AND user_weapon.wid = ${wid}` : ''}
				) AS rank
			FROM user_weapon_kills uwk
				LEFT JOIN user_weapon uw ON uwk.uwid = uw.uwid
				LEFT JOIN user u ON uw.uid = u.uid
			WHERE u.id = ${p.msg.author.id}
				${wid ? `AND wid = ${wid}` : ''}
			ORDER BY uwk.kills DESC
			LIMIT 1;
		`;
	}

	displayRanking(
		con,
		msg,
		count,
		globalRank,
		sql,
		'Top ' +
			count +
			' ' +
			(globalRank
				? 'Global Weapon Takedown Rankings'
				: 'Weapon Takedown Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			const weaponName = WeaponInterface.weapons[`${query.wid}`].getName;
			const uwid = weaponUtil.shortenUWID(query.uwid);
			const wear = query.wear > 1 ? WeaponInterface.getWear(query.wear).name + ' ' : '';
			const kills = query.kills;
			const avg = query.avg;

			if (rank == 0)
				return `>\t\t[${global.toFancyNum(kills)}][${uwid}] ${avg}% ${wear}${weaponName}\n\n`;
			else return `\n\t\t[${global.toFancyNum(kills)}][${uwid}] ${avg}% ${wear}${weaponName}\n`;
		},
		p
	);
}
