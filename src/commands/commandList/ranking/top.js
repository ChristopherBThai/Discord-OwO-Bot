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
	alias: ['top', 'rank', 'ranking'],

	args: 'points|guild|zoo|money|cookie|pet|huntbot|luck|curse|battle|daily|level|shard [global] {count}',

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
	let globala = false;
	let rankType = '';

	let count = 5;

	for (let i = 0; i < args.length; i++) {
		if (!rankType) {
			switch (args[i]) {
			case 'points': case 'point': case 'p':
				rankType = 'points';
				break;
			case 'guild': case 'g': case 'server': case 's':
				rankType = 'guild';
				break;
			case 'zoo': case 'z':
				rankType = 'zoo';
				break;
			case 'cowoncy': case 'money': case 'c': case 'm': case 'cash':
				rankType = 'money';
				break;
			case 'cookies': case 'cookie': case 'rep': case 'reputation': case 'r':
				rankType = 'rep';
				break;
			case 'pets': case 'pet':
				rankType = 'pet';
				break;
			case 'huntbot': case 'hb': case 'autohunt': case 'ah':
				rankType = 'huntbot';
				break;
			case 'luck': case 'pray':
				rankType = 'luck';
				break;
			case 'curse':
				rankType = 'curse';
				break;
			case 'battle': case 'streak':
				rankType = 'battle';
				break;
			case 'daily':
				rankType = 'daily';
				break;
			case 'level': case 'lvl': case 'xp':
				rankType = 'level';
				break;
			case 'shards': case 'shard': case 'ws': case 'weaponshards': case 'weaponshard':
				rankType = 'shard';
				break;
			case 'marriage': case 'marry':
				rankType = 'marriage';
				break;
			case 'global':
				globala = true;
				break;
			default:
				if (global.isInt(args[i])) {
					count = parseInt(args[i]);
				} else {
					p.errorMsg(', Invalid ranking type!', 3000);
					return;
				}
			}
		} else if (args[i] === 'global' || args[i] === 'g') globala = true;
		else if (global.isInt(args[i])) count = parseInt(args[i]);
		else {
			p.errorMsg(', Invalid ranking type!', 3000);
			return;
		}
	}
	if (count > 25) count = 25;
	else if (count < 1) count = 5;

	switch (rankType) {
	case 'points':
		getRanking(globala, con, msg, count, p);
		break;
	case 'guild':
		getGuildRanking(con, msg, count, p);
		break;
	case 'zoo':
		getZooRanking(globala, con, msg, count, p);
		break;
	case 'money':
		getMoneyRanking(globala, con, msg, count, p);
		break;
	case 'rep':
		getRepRanking(globala, con, msg, count, p);
		break;
	case 'pet':
		getPetRanking(globala, con, msg, count, p);
		break;
	case 'huntbot':
		getHuntbotRanking(globala, con, msg, count, p);
		break;
	case 'luck':
		getLuckRanking(globala, con, msg, count, p);
		break;
	case 'curse':
		getCurseRanking(globala, con, msg, count, p);
		break;
	case 'battle':
		getBattleRanking(globala, con, msg, count, p);
		break;
	case 'daily':
		getDailyRanking(globala, con, msg, count, p);
		break;
	case 'level':
		getLevelRanking(globala, p, count);
		break;
	case 'shard':
		getShardRanking(globala, con, msg, count, p);
		break;
	case 'marriage':
		getMarriageRanking(globala, con, msg, count, p);
		break;
	default:
		getRanking(globala, con, msg, count, p);
	}
}

function displayRanking(con, msg, count, globalRank, sql, title, subText, p) {
	con.query(sql, async function (err, rows, fields) {
		if (err) {
			console.error(err);
			return;
		}
		let rank = 1;
		let ranking = [];
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
			else name = '' + user.username;
			if ('id2' in ele) {
				// used for marriage leaderboard
				let user2 = await p.fetch.getUser(String(ele.id2), true);
				if (!user)
					name += ' & User Left Bot';
				else
					name += ' & ' + user2.username;
			}
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
	let sql;
	if (globalRank) {
		sql =
			'SELECT *,' +
			points +
			' AS points FROM animal_count ORDER BY points DESC LIMIT ' +
			count +
			';';
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
			'SELECT *,' +
			points +
			' AS points FROM animal_count WHERE id IN (' +
			users +
			') ORDER BY points DESC LIMIT ' +
			count +
			';';
		sql +=
			'SELECT *,' +
			points +
			' AS points,(SELECT COUNT(*)+1 FROM animal_count WHERE ' +
			points +
			' > ' +
			apoints +
			' AND id IN (' +
			users +
			')) AS rank FROM animal_count a WHERE a.id = ' +
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
		(globalRank ? 'Global Zoo Rankings' : 'Zoo Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0)
				return (
					'>\t\t' +
					global.toFancyNum(query.points) +
					' zoo points: ' +
					animalUtil2.zooScore(query) +
					'\n\n'
				);
			else
				return (
					'\n\t\t' +
					global.toFancyNum(query.points) +
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
	let channel = msg.channel;
	//Grabs top 5
	var sql = 'SELECT * FROM guild ORDER BY count DESC LIMIT ' + count + ';';
	sql +=
		'SELECT id,count,(SELECT COUNT(*)+1 FROM guild WHERE count > g.count) AS rank FROM guild g WHERE g.id = ' +
		msg.channel.guild.id +
		';';

	//Create an embeded message
	con.query(sql, async function (err, rows, fields) {
		if (err) {
			console.error(err);
			return;
		}
		let rank = 1;
		let ranking = [];
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
			else user = user.username;
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
			else return '\n\tShards: ' + global.toFancyNum(query.count) + '\n';
		},
		p
	);
}

/**
 * displays marriage ranking
 */
function getMarriageRanking(globalRank, con, msg, count, p) {
	let sql;
	if (globalRank) {
		sql = 'SELECT u.id AS id,uu.id AS id2,dailies FROM marriage INNER JOIN user u ON uid1 = u.uid INNER JOIN user uu ON uid2 = uu.uid ORDER BY dailies DESC LIMIT ' + count + ';';
		sql += 'SELECT u.id AS id,uu.id AS id2,dailies,(SELECT COUNT(*)+1 FROM marriage WHERE dailies > m.dailies ) AS rank FROM marriage m INNER JOIN user u ON uid1 = u.uid INNER JOIN user uu ON uid2 = uu.uid WHERE u.id = ' + msg.author.id + ' OR uu.id = ' + msg.author.id + ';';
	} else {
		let users = global.getids(msg.channel.guild.members);
		sql = 'SELECT u.id AS id, uu.id AS id2, marriage.dailies FROM marriage INNER JOIN user u ON marriage.uid1 = u.uid INNER JOIN user uu ON marriage.uid2 = uu.uid WHERE u.id IN (' + users + ') OR uu.id IN (' + users + ') ORDER BY dailies DESC LIMIT ' + count + ';';
		sql += 'SELECT u.id AS id, uu.id AS id2, m.dailies, (SELECT COUNT(*)+1 FROM marriage mm INNER JOIN user u3 ON mm.uid1 = u3.uid INNER JOIN user u4 ON mm.uid2 = u4.uid WHERE (u3.id IN (' + users + ') OR u4.id IN (' + users + ')) AND mm.dailies > m.dailies ) AS rank FROM marriage m INNER JOIN user u ON m.uid1 = u.uid INNER JOIN user uu ON m.uid2 = uu.uid WHERE u.id = ' + msg.author.id + ' OR uu.id = ' + msg.author.id + ';';
	}

	displayRanking(con, msg, count, globalRank, sql,
		'Top ' + count + ' ' + ((globalRank) ? 'Global Marriage Rankings' : 'Marriage Rankings for ' + msg.channel.guild.name),
		function (query, rank) {
			if (rank == 0) return '>\tDailies Collected Together: ' + global.toFancyNum(query.dailies) + '\n\n';
			else return '\n\tDailies Collected Together: ' + global.toFancyNum(query.dailies) + '\n';
		}
		, p);
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
