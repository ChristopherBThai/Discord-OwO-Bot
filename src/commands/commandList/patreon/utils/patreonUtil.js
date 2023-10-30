/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.giveCustomBattle = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT into alterbattle (uid, type, color, footer, author) VALUES
		(${uid}, 'win', 65280,
			'You won in {turns} turns! Your team gained {xp} xp! Streak: {streak}', '{username} goes into battle'),
		(${uid}, 'lose', 16711680,
			'You lost in {turns} turns! Your team gained {xp} xp! You lost your streak of {streak} wins...', '{username} goes into battle'),
		(${uid}, 'tie', 6381923,
			"It\'s a tie in {turns} turns! Your team gained {xp} xp! Streak: {streak}", '{username} goes into battle');`;
	await p.query(sql);
};

exports.giveCustomHunt = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO alterhunt (uid, type) VALUES
		(${uid}, 'gems'),
		(${uid}, 'nogems');`;
	await p.query(sql);
};

exports.giveCustomCowoncy = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'cowoncy', 'display');`;
	await p.query(sql);
};

exports.giveCustomGive = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'give', 'give'),
		(${uid}, 'give',  'none'),
		(${uid}, 'give',  'senderlimit'),
		(${uid}, 'give',  'senderoverlimit'),
		(${uid}, 'give',  'receivelimit'),
		(${uid}, 'give',  'receiveoverlimit'),
		(${uid}, 'give',  'receive');`;
	await p.query(sql);
};

exports.giveCustomPray = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'pray', 'pray'),
		(${uid}, 'pray', 'prayself'),
		(${uid}, 'pray', 'receivepray'),
		(${uid}, 'pray', 'curse'),
		(${uid}, 'pray', 'curseself'),
		(${uid}, 'pray',  'receivecurse');`;
	await p.query(sql);
};

exports.giveCustomInventory = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'inventory',  'display');`;
	await p.query(sql);
};

exports.giveCustomDaily = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'daily', 'display'),
		(${uid}, 'daily', 'marriage')`;
	await p.query(sql);
};

exports.giveCustomWeapon = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'weapon',  'display');`;
	await p.query(sql);
};

exports.giveCustomCookie = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'cookie',  'ready'),
		(${uid}, 'cookie',  'give'),
		(${uid}, 'cookie',  'cooldown'),
		(${uid}, 'cookie',  'receive');`;
	await p.query(sql);
};
