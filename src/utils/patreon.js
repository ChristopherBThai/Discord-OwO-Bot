/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

let mysql;

exports.parsePatreon = function (query) {
	if (!query || !query.patreonMonths) return null;

	// parse variables
	let months = query.patreonMonths;
	let started = query.patreonTimer;
	let passed = query.monthsPassed;
	let type = query.patreonType;
	let animal = false;
	let cowoncy = false;

	// parse benefits
	switch (type) {
		case 1:
			animal = true;
			break;
		case 3:
			animal = true;
			cowoncy = true;
			break;
		default:
			return null;
	}

	// Already expired
	if (passed >= months) return null;

	// parse expire date
	if (!started || !months) return null;
	let expireDate = new Date(started);
	expireDate.setMonth(expireDate.getMonth() + months);

	return { animal, cowoncy, expireDate };
};

exports.parseSecondPatreon = function (query) {
	const expireDate = new Date(query.endDate);
	let animal = false;
	let cowoncy = false;

	if (expireDate < new Date()) return null;

	// parse benefits
	switch (query.patreonType) {
		case 1:
			animal = true;
			break;
		case 3:
			animal = true;
			cowoncy = true;
			break;
		default:
			return null;
	}

	return { animal, cowoncy, expireDate };
};

exports.update = function (guild, oldMember, newMember) {
	if (guild.id != '420104212895105044') return;

	if (oldMember.roles.includes('449429399217897473')) {
		if (!newMember.roles.includes('449429399217897473')) {
			lostDaily(newMember);
		}
	} else {
		if (newMember.roles.includes('449429399217897473')) {
			gainedDaily(newMember);
		}
	}
	if (oldMember.roles.includes('449429255781351435')) {
		if (!newMember.roles.includes('449429255781351435')) {
			lostAnimal(newMember);
		}
	} else {
		if (newMember.roles.includes('449429255781351435')) {
			gainedAnimal(newMember);
		}
	}
};

exports.left = async function (guild, member) {
	if (guild.id != '420104212895105044') return;

	let sql =
		'UPDATE IGNORE user SET patreonDaily = 0,patreonAnimal = 0 WHERE id = ' + member.id + ';';
	await mysql.query(sql);
};

function messageUser(_user) {
	return;
	/*
	sender.msgUser(
		user.id,
		'Thank you for supporting owo bot! Every dollar counts and I appreciate your donation!! If you encounter any problems, let me know!\n\nXOXO,\n**Scuttler#0001**'
	);
	*/
}

async function gainedDaily(user) {
	let sql =
		'INSERT INTO user (id,count,patreonDaily) VALUES (' +
		user.id +
		',0,1) ON DUPLICATE KEY ' +
		'UPDATE patreonDaily = 1;';
	sql += 'SELECT * FROM user WHERE id = ' + user.id + ';';
	let result = await mysql.query(sql);
	if (result[1][0] && result[1][0].patreonAnimal == 0) await messageUser(user);
}

async function lostDaily(user) {
	let sql = 'UPDATE IGNORE user SET patreonDaily = 0 WHERE id = ' + user.id + ';';
	await mysql.query(sql);
}

async function gainedAnimal(user) {
	let sql =
		'INSERT INTO user (id,count,patreonAnimal) VALUES (' +
		user.id +
		',0,1) ON DUPLICATE KEY ' +
		'UPDATE patreonAnimal = 1;';
	sql += 'SELECT * FROM user WHERE id = ' + user.id + ';';
	let result = await mysql.query(sql);
	if (result[1][0] && result[1][0].patreonDaily == 0) await messageUser(user);
}

async function lostAnimal(user) {
	let sql = 'UPDATE IGNORE user SET patreonAnimal = 0 WHERE id = ' + user.id + ';';
	await mysql.query(sql);
}

exports.checkPatreon = function (p, userID) {
	p.pubsub.publish('checkPatreon', { userID });
};

exports.init = function (main) {
	mysql = main.mysqlhandler;
	// sender = main.sender;
};
