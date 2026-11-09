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
	alias: ['my', 'me', 'guild'],

	args: 'points|guild|zoo|money|cookie|pet|huntbot|luck|curse|battle|daily|level|shard|weapon|w{wid} [global]',

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
	let huntbot, luck, curse, daily, battle, level, shard, tt;

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
			!daily &&
			!battle &&
			!level &&
			!shard &&
			!tt
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
			else if (
				['tt', 'takedown', 'takdowntracker', 'tracker', 'weapon', 'w'].includes(args[i]) ||
				weaponArgs.includes(args[i])
			)
				tt = args[i];
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
		else if (battle) getBattleRanking(aglobal, con, msg, p);
		else if (daily) getDailyRanking(aglobal, con, msg, p);
		else if (level) await getLevelRanking(aglobal, p);
		else if (shard) getShardRanking(aglobal, con, msg, p);
		else if (tt) getTTRanking(aglobal, con, msg, p, tt);
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
			else name = '' + p.getUniqueName(user);
			name = name.replace('discord.gg', 'discord,gg').replace(/(```)/g, '`\u200b``');
			embed += '#' + p.global.toFancyNum(rank) + '\t' + name + '\n' + subText(ele) + '\n';
			rank++;
		} else if (rank == 0) rank = 1;
	}

	//Current user
	let uname;
	if ((uname = await p.fetch.getUser(me.id, true))) uname = p.getUniqueName(uname);
	else uname = 'you';
	uname = uname.replace('discord.gg', 'discord,gg').replace(/(```)/g, '`\u200b``');
	embed += '< ' + p.global.toFancyNum(rank) + '   ' + uname + ' >\n' + subText(me) + '\n';
	rank++;

	//People below user
	for (let ele of below) {
		var id = String(ele.id);
		if (id !== '' && id !== null && !isNaN(id)) {
			var user = await p.fetch.getUser(id, true);
			var name = '';
			if (user === undefined || user.username === undefined) name = 'User Left Discord';
			else name = '' + p.getUniqueName(user);
			name = name.replace('discord.gg', 'discord,gg');
			embed += '#' + p.global.toFancyNum(rank) + '\t' + name + '\n' + subText(ele) + '\n';
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
		p.global.toFancyNum(userRank) +
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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT id, count 
		FROM user
		WHERE count > (
			SELECT count FROM user WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY count ASC LIMIT 2;
	`;
	sql += `
		SELECT id,count  
		FROM user
		WHERE count < (
			SELECT count FROM user WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY count DESC LIMIT 2;
	`;
	sql += `
		SELECT id, count, (
			SELECT COUNT(*)+1
			FROM user
			WHERE count > u.count
				${globalRank ? '' : `AND user.id IN (${users})`}
		) AS rank
		FROM user u
		WHERE u.id = ${p.msg.author.id};
	`;

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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT *
		FROM animal_count
		WHERE total > (
			SELECT total FROM animal_count WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY total ASC LIMIT 2;
	`;
	sql += `
		SELECT *
		FROM animal_count
		WHERE total < (
			SELECT total FROM animal_count WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY total DESC LIMIT 2;
	`;
	sql += `
		SELECT *, (
			SELECT COUNT(*)+1
			FROM animal_count
			WHERE total > u.total
				${globalRank ? '' : `AND id IN (${users})`}
		) AS rank
		FROM animal_count u
		WHERE u.id = ${p.msg.author.id};
	`;

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Zoo Ranking',
		function (query) {
			return (
				'\t\t' + global.toFancyNum(query.total) + ' zoo points: ' + animalUtil2.zooScore(query)
			);
		},
		p
	);
}

function getMoneyRanking(globalRank, con, msg, p) {
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT id, money
		FROM cowoncy
		WHERE money > (
			SELECT money FROM cowoncy WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY money ASC LIMIT 2;
	`;
	sql += `
		SELECT id, money
		FROM cowoncy 
		WHERE money < (
			SELECT money FROM cowoncy WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY money DESC LIMIT 2;
	`;
	sql += `
		SELECT id, money, (
			SELECT COUNT(*)+1
			FROM cowoncy
			WHERE money > u.money
				${globalRank ? '' : `AND id IN (${users})`}
		) AS rank
		FROM cowoncy u
		WHERE u.id = ${p.msg.author.id};
	`;

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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT id, count
		FROM rep
		WHERE count > (
			SELECT count FROM rep WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY count ASC LIMIT 2;
	`;
	sql += `
		SELECT id, count
		FROM rep 
		WHERE count < (
			SELECT count FROM rep WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY count DESC LIMIT 2;
	`;
	sql += `
		SELECT id, count, (
			SELECT COUNT(*)+1
			FROM rep
			WHERE count > u.count
				${globalRank ? '' : `AND id IN (${users})`}
		) AS rank
		FROM rep u
		WHERE u.id = ${p.msg.author.id};
	`;

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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT *
		FROM animal
		WHERE xp > (
			SELECT xp FROM animal WHERE id = ${p.msg.author.id} ORDER BY xp DESC LIMIT 1
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY xp ASC LIMIT 2;
	`;
	sql += `
		SELECT *
		FROM animal
		WHERE xp < (
			SELECT xp FROM animal WHERE id = ${p.msg.author.id} ORDER BY xp DESC LIMIT 1
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY xp DESC LIMIT 2;
	`;
	sql += `
		SELECT *, (
			SELECT COUNT(*)+1
			FROM animal
			WHERE xp > u.xp
				${globalRank ? '' : `AND id IN (${users})`}
		) AS rank
		FROM animal u
		WHERE u.id = ${p.msg.author.id}
		ORDER BY xp DESC LIMIT 1;
	`;

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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT id, total 
		FROM autohunt
		WHERE total > (
			SELECT total FROM autohunt WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY total ASC LIMIT 2;
	`;
	sql += `
		SELECT id, total
		FROM autohunt
		WHERE total < (
			SELECT total FROM autohunt WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY total DESC LIMIT 2;
	`;
	sql += `
		SELECT id, total, (
			SELECT COUNT(*)+1
			FROM autohunt
			WHERE total > u.total
				${globalRank ? '' : `AND id IN (${users})`}
		) AS rank
		FROM autohunt u
		WHERE u.id = ${p.msg.author.id};
	`;

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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT id, lcount 
		FROM luck
		WHERE lcount > (
			SELECT lcount FROM luck WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY lcount ASC LIMIT 2;
	`;
	sql += `
		SELECT id, lcount
		FROM luck
		WHERE lcount < (
			SELECT lcount FROM luck WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY lcount DESC LIMIT 2;
	`;
	sql += `
		SELECT id, lcount, (
			SELECT COUNT(*)+1
			FROM luck
			WHERE lcount > u.lcount
				${globalRank ? '' : `AND id IN (${users})`}
		) AS rank
		FROM luck u
		WHERE u.id = ${p.msg.author.id};
	`;

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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT id, lcount 
		FROM luck
		WHERE lcount < (
			SELECT lcount FROM luck WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY lcount DESC LIMIT 2;
	`;
	sql += `
		SELECT id, lcount
		FROM luck
		WHERE lcount > (
			SELECT lcount FROM luck WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY lcount ASC LIMIT 2;
	`;
	sql += `
		SELECT id, lcount, (
			SELECT COUNT(*)+1
			FROM luck
			WHERE lcount < u.lcount
				${globalRank ? '' : `AND id IN (${users})`}
		) AS rank
		FROM luck u
		WHERE u.id = ${p.msg.author.id};
	`;

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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT id, daily_streak
		FROM cowoncy 
		WHERE daily_streak > (
			SELECT daily_streak FROM cowoncy WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY daily_streak ASC LIMIT 2;
	`;
	sql += `
		SELECT id, daily_streak
		FROM cowoncy 
		WHERE daily_streak < (
			SELECT daily_streak FROM cowoncy WHERE id = ${p.msg.author.id}
		)
			${globalRank ? '' : `AND id IN (${users})`}
		ORDER BY daily_streak DESC LIMIT 2;
	`;
	sql += `
		SELECT id, daily_streak, (
			SELECT COUNT(*)+1
			FROM cowoncy
			WHERE daily_streak > u.daily_streak
				${globalRank ? '' : `AND cowoncy.id IN (${users})`}
		) AS rank
		FROM cowoncy u
		WHERE u.id = ${p.msg.author.id};
	`;

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

async function getLevelRanking(global, p) {
	let userRank, userLevel, ranking, text;
	if (global) {
		userRank = await levels.getUserRank(p.msg.author.id);
		userLevel = await levels.getUserLevel(p.msg.author.id);
		ranking = await levels.getNearbyXP(userRank);
		text =
			'```md\n< ' +
			p.getUniqueName() +
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
			p.getUniqueName() +
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
				let user = p.getUniqueName();
				text += '< ' + counter + '\t' + user + ' >\n';
			} else {
				let user = await p.fetch.getUser(ranking[i]);
				if (!user) user = 'User Left Discord';
				else user = p.getUniqueName(user);
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
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT u.id, s.count 
		FROM shards s INNER JOIN user u ON s.uid = u.uid
		WHERE s.count > (
			SELECT s2.count FROM shards s2 INNER JOIN user u2 ON s2.uid = u2.uid WHERE u2.id = ${
				p.msg.author.id
			}
		)
			${globalRank ? '' : `AND u.id IN (${users})`}
		ORDER BY s.count ASC LIMIT 2;
	`;
	sql += `
		SELECT u.id, s.count 
		FROM shards s INNER JOIN user u ON s.uid = u.uid
		WHERE s.count < (
			SELECT s2.count FROM shards s2 INNER JOIN user u2 ON s2.uid = u2.uid WHERE u2.id = ${
				p.msg.author.id
			}
		)
			${globalRank ? '' : `AND u.id IN (${users})`}
		ORDER BY s.count DESC LIMIT 2;
	`;
	sql += `
		SELECT u.id, s.count, (
			SELECT COUNT(*)+1
			FROM shards s2 INNER JOIN user u2 ON s2.uid = u2.uid
			WHERE s2.count > s.count
				${globalRank ? '' : `AND u2.id IN (${users})`}
		) AS rank
		FROM shards s INNER JOIN user u ON s.uid = u.uid
		WHERE u.id = ${p.msg.author.id};
	`;

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

function getTTRanking(globalRank, con, msg, p, tt) {
	let wid;
	if (/^w\d{3}$/gi.test(tt)) {
		wid = parseInt(tt.substring(1)) - 100;
	}
	let users = globalRank ? null : global.getids(msg.channel.guild.members);
	let sql = `
		SELECT
			u.id,
			uwk.kills, uw.wid, uw.uwid, uw.avg, uw.wear
		FROM user_weapon_kills uwk
			LEFT JOIN user_weapon uw ON uwk.uwid = uw.uwid
			LEFT JOIN user u ON uw.uid = u.uid
		WHERE kills > (
			SELECT uwk2.kills
			FROM user_weapon_kills uwk2
				LEFT JOIN user_weapon uw2 ON uwk2.uwid = uw2.uwid
				LEFT JOIN user u2 ON uw2.uid = u2.uid
			WHERE u2.id = ${p.msg.author.id}
				${wid ? `AND uw2.wid = ${wid}` : ''}
			ORDER by uwk2.kills DESC LIMIT 1
		)
			${globalRank ? '' : `AND u.id IN (${users})`}
			${wid ? `AND uw.wid = ${wid}` : ''}
		ORDER BY kills ASC LIMIT 2;
	`;
	sql += `
		SELECT
			u.id,
			uwk.kills, uw.wid, uw.uwid, uw.avg, uw.wear
		FROM user_weapon_kills uwk
			LEFT JOIN user_weapon uw ON uwk.uwid = uw.uwid
			LEFT JOIN user u ON uw.uid = u.uid
		WHERE kills < (
			SELECT uwk2.kills
			FROM user_weapon_kills uwk2
				LEFT JOIN user_weapon uw2 ON uwk2.uwid = uw2.uwid
				LEFT JOIN user u2 ON uw2.uid = u2.uid
			WHERE u2.id = ${p.msg.author.id}
				${wid ? `AND uw2.wid = ${wid}` : ''}
			ORDER by uwk2.kills DESC LIMIT 1
		)
			${globalRank ? '' : `AND u.id IN (${users})`}
				${wid ? `AND uw.wid = ${wid}` : ''}
		ORDER BY kills DESC LIMIT 2;
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
					${globalRank ? '' : `AND user.id IN (${users})`}
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

	displayRanking(
		con,
		msg,
		sql,
		(globalRank ? 'Global ' : '') + 'Weapon Takedown Ranking',
		function (query) {
			const weaponName = WeaponInterface.weapons[`${query.wid}`].getName;
			const uwid = weaponUtil.shortenUWID(query.uwid);
			const wear = query.wear > 1 ? WeaponInterface.getWear(query.wear).name + ' ' : '';
			const kills = query.kills;
			const avg = query.avg;

			return `\t\t[${global.toFancyNum(kills)}][${uwid}] ${avg}% ${wear}${weaponName}`;
		},
		p
	);
}
