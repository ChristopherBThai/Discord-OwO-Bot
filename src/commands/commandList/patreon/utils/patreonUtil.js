/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const teamUtil = require('../../battle/util/teamUtil.js');
const sku = '1164099862984400926';

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
		(${uid}, 'daily', 'cooldown'),
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

exports.giveCustomZoo = async function (p, id) {
	const uid = await p.global.getUid(id);
	const sql = `INSERT INTO \`alter\` (uid, command, type) VALUES
		(${uid}, 'zoo',  'paged'),
		(${uid}, 'zoo',  'message');`;
	await p.query(sql);
};

exports.getSupporterRank = async function (p, user) {
	if (user.supporterRank) {
		const now = new Date();
		const updateDiff = new Date() - user.supporterRank.updatedOn;
		// Refresh if its past a day
		if (updateDiff >= 1000 * 60 * 60 * 24) {
			delete user.supporterRank;
			// User supporter rank is already cached
		} else if (user.supporterRank.endTime > now) {
			return user.supporterRank;
			// If user does not have supporter rank
		} else {
			user.supporterRank.endTime = null;
			user.supporterRank.benefitRank = 0;
			if (updateDiff <= 20 * 1000 /** 60 * 60*/) {
				return user.supporterRank;
			}
		}
	}

	const uid = await p.global.getUid(user.id);
	const sql = `
		SELECT * FROM patreons WHERE uid = ${uid};
		SELECT * FROM patreon_wh WHERE uid = ${uid};
		SELECT * FROM patreon_discord WHERE uid = ${uid};
	`;
	const result = await p.query(sql);

	const supporter = {
		endTime: null,
		benefitRank: 0,
		updatedOn: new Date(),
	};
	if (result[0][0]?.patreonTimer) {
		const benefitRank = result[0][0].patreonType;
		const startTime = new Date(result[0][0].patreonTimer);
		const endTime = new Date(startTime.setMonth(startTime.getMonth() + result[0][0].patreonMonths));
		getBetterSupporterRank(supporter, benefitRank, endTime);
	}
	if (result[1].length) {
		result[1].forEach((row) => {
			const benefitRank = row.patreonType;
			const endTime = new Date(row.endDate);
			getBetterSupporterRank(supporter, benefitRank, endTime);
		});
	}
	if (result[2][0]) {
		const benefitRank = result[2][0].patreonType;
		const endTime = new Date(result[2][0].endDate);
		getBetterSupporterRank(supporter, benefitRank, endTime);
	}

	if (supporter.benefitRank >= 3) {
		let sql = `UPDATE IGNORE pet_team SET disabled = 0 WHERE disabled = 1 AND uid = ${uid};`;
		await p.query(sql);
	} else {
		let sql = `SELECT pt.*, pta.pgid AS active FROM pet_team pt LEFT JOIN pet_team_active pta  ON pt.pgid = pta.pgid WHERE pt.uid = ${uid} ORDER BY pt.pgid ASC;`;
		const result = await p.query(sql);
		const maxTeams = await teamUtil.getMaxTeams.bind(p)(p.msg.author, supporter);
		if (result.length > maxTeams) {
			const pgid = result[result.length - 1].pgid;
			sql = `UPDATE pet_team SET disabled = 1 WHERE pgid = ${pgid};
					DELETE FROM pet_team_active WHERE pgid = ${pgid};`;
			await p.query(sql);
		}
	}

	user.supporterRank = supporter;
	return supporter;
};

function getBetterSupporterRank(supporter, benefitRank, endTime) {
	const now = new Date();
	if (endTime < now) {
		return;
	}
	if (benefitRank > supporter.benefitRank) {
		supporter.endTime = endTime;
		supporter.benefitRank = benefitRank;
	} else if (benefitRank == supporter.benefitRank) {
		if (endTime > supporter.endTime) {
			supporter.endTime = endTime;
		}
	}
}

exports.handleDiscordUpdate = async function (entitlement) {
	let { userId, endDate, error } = parseEntitlment(entitlement);
	if (error) {
		console.error(error + ': ' + JSON.stringify(entitlement, null, 2));
		return;
	}

	const uid = await this.global.getUid(userId);
	let sql = `SELECT * FROM patreon_discord WHERE uid = ${uid};`;
	let result = await this.query(sql);
	let renewal = false;
	if (result[0]) {
		const resultEnd = new Date(result[0].endDate);
		if (resultEnd >= endDate) {
			return;
		}
		renewal = true;
	}
	let mysqlDate = this.global.toMySQL(endDate);
	sql = `INSERT INTO patreon_discord (uid, patreonType, endDate) VALUES (${uid}, 3, ${mysqlDate}) ON DUPLICATE KEY UPDATE endDate = ${mysqlDate};`;
	await this.query(sql);

	if (!renewal) {
		let txt = `${this.config.emoji.owo.woah} **|** Thank you for supporting OwO Bot! Your account should have access to supporter benefits.`;
		txt += `\n${
			this.config.emoji.blank
		} **|** Your benefit will renew on: ${this.global.toDiscordTimestamp(endDate)}`;
		txt += `\n${this.config.emoji.blank} **|** If you have any questions, please stop by our support server: ${this.config.guildlink}`;
		this.sender.msgUser(userId, txt);
	}
};

exports.handleDiscordDelete = async function (entitlement) {
	const userId = entitlement.user_id;
	const uid = await this.global.getUid(entitlement.user_id);
	const sql = `DELETE FROM patreon_discord WHERE uid = ${uid};`;
	const result = await this.query(sql);
	if (result.affectedRows > 0) {
		let txt = `${this.config.emoji.owo.cry} **|** It looks like your Discord payment failed.`;
		txt += `\n${this.config.emoji.blank} **|** You will no longer receive OwO Bot supporter benefits.`;
		txt += `\n${this.config.emoji.blank} **|** If you have any questions, please stop by our support server: ${this.config.guildlink}`;
		this.sender.msgUser(userId, txt);
	}
};

function parseEntitlment(entitlment) {
	if (entitlment.sku_id !== sku) {
		return { error: 'Invalid SKU' };
	}
	const userId = entitlment.user_id;
	if (!userId) {
		return { error: 'Invalid User' };
	}
	let endDate = entitlment.ends_at;
	if (!endDate) {
		return { error: 'Invalid End Time' };
	}
	endDate = new Date(endDate);
	return { userId, endDate };
}
