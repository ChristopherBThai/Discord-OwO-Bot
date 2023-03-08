const redis = require('./redis.js');
const logger = require('./logger.js');
const levelRewards = require('./levelRewards.js');
let macro;
try {
	macro = require('../../../tokens/macro.js');
} catch (err) {
	console.error('Could not find macro.js, attempting to use ./secret file...');
	macro = require('../../secret/macro.js');
	console.log('Found macro.js file in secret folder!');
}
const minXP = 10,
	maxXP = 15,
	dailyLimit = 3000;
var banned = {};

exports.giveXP = async function (msg) {
	// must be a text channel
	if (msg.channel.type === 1) return;

	// Return if on banned or is a bot
	if (isBanned(msg)) return;

	// Set cooldown
	if (!(await redis.sadd('user_xp_cooldown', msg.author.id))) return;

	// Give random amount of xp
	let gain = minXP + Math.floor(Math.random() * (1 + maxXP - minXP));

	//Check if we hit the daily limit of xp
	let limit = await redis.hgetall('xplimit_' + msg.author.id);
	let bonus = 0,
		guildBonus = 0;
	let limitHit, guildLimitHit;
	if (limit && limit.day == getDate()) {
		// If global xp hit daily cap
		if (limit.xp > dailyLimit) limitHit = true;
		else limit.xp = parseInt(limit.xp) + gain;

		if (limit[msg.channel.guild.id]) {
			// If server xp hit daily cap
			if (limit[msg.channel.guild.id] > dailyLimit) guildLimitHit = true;
			else limit[msg.channel.guild.id] = parseInt(limit[msg.channel.guild.id]) + gain;
		} else {
			// first msg in guild
			limit[msg.channel.guild.id] = gain;
			guildBonus = 500;
		}
	} else {
		await redis.del('xplimit_' + msg.author.id);
		limit = { day: getDate(), xp: gain };
		limit[msg.channel.guild.id] = gain;
		// Daily bonus xp
		bonus += 500;
		guildBonus = 500;
	}

	// Check for macros
	if (macro && !macro.levelCheck(msg, limit)) return;

	// Distribute xp
	if (!limitHit || !guildLimitHit) {
		redis
			.hmset('xplimit_' + msg.author.id, limit)
			.then(() => redis.expire('xplimit_' + msg.author.id));
	}
	let xp;
	if (!limitHit) {
		xp = await redis.incr('user_xp', msg.author.id, gain + bonus);
		logger.incr('xp', gain + bonus, {}, msg);
	}
	if (!guildLimitHit) {
		await redis.incr('user_xp_' + msg.channel.guild.id, msg.author.id, gain + guildBonus);
	}

	// Check if user leveled up
	if (!limitHit && xp) {
		let previousLvl = getLevel(xp - (gain + bonus)).level;
		let currentLvl = getLevel(xp).level;
		if (previousLvl != currentLvl) {
			levelRewards.distributeRewards(msg);
		}
	}
};

/* Give xp to a user */
exports.giveUserXP = async function (id, xp) {
	return await redis.incr('user_xp', id, xp);
};

/* Get global user level */
exports.getUserLevel = async function (id) {
	let xp = parseInt(await redis.getXP('user_xp', id));
	return getLevel(xp);
};

/* Get server user level */
exports.getUserServerLevel = async function (id, gid) {
	let xp = parseInt(await redis.getXP('user_xp_' + gid, id));
	return getLevel(xp);
};

/* Get global user rank */
exports.getUserRank = async function (id) {
	let rank = parseInt(await redis.getRank('user_xp', id)) + 1;
	return rank;
};

/* Get server user rank */
exports.getUserServerRank = async function (id, gid) {
	let rank = parseInt(await redis.getRank('user_xp_' + gid, id)) + 1;
	return rank;
};

/* Get top global rankings */
exports.getGlobalRanking = async function (count) {
	return await redis.getTop('user_xp', count);
};

/* Get top server rankings */
exports.getServerRanking = async function (gid, count) {
	return await redis.getTop('user_xp_' + gid, count);
};

/* Get people close to a certain rank */
exports.getNearbyXP = async function (rank, count = 2) {
	let min = rank - count - 1;
	if (min < 0) min = 0;
	return await redis.getRange('user_xp', min, rank + count - 1);
};

/* Get people close to a certain rank */
exports.getNearbyServerXP = async function (rank, gid, count = 2) {
	let min = rank - count - 1;
	if (min < 0) min = 0;
	return await redis.getRange('user_xp_' + gid, min, rank + count - 1);
};

/* XP required for a level */
function getXpRequired(lvl) {
	return 5000 + Math.pow(lvl * 7, 2);
}

/*
let total = 0;
let totali = 0;
for(let i=1;i<51;i++){
	let xp = getXpRequired(i);
	total += xp;
	totali += i;
	console.log(i+" | "+xp+" ("+Math.round(xp/3600)+") | "+total+" ("+Math.round(total/3600)+") | "+totali);
}
*/

/* Get level from xp */
var getLevel = (exports.getLevel = function (xp) {
	if (!xp) xp = 0;
	let lvl = 0;
	let required = getXpRequired(lvl + 1);
	while (xp > required) {
		xp -= required;
		lvl++;
		required = getXpRequired(lvl + 1);
	}
	return { level: lvl, currentxp: xp, maxxp: required };
});

/* Ban a user from getting xp */
function ban(id, time = 1800000) {
	banned[id] = true;
	setTimeout(() => {
		delete banned[id];
	}, time);
}

/* Permma ban a user from getting xp */
/* eslint-disable-next-line */
function permBan(id) {
	banned[id] = true;
}

/* Remove a ban */
/* eslint-disable-next-line */
function removeBan(id) {
	delete banned[id];
}

/* check if banned */
const isBanned = (exports.isBanned = function (msg) {
	return msg.author.bot || banned[msg.author.id] || banned[msg.channel.id];
});

/* Some cheat detection stuff */
macro.initLevelCheck(ban);

/* Gets the current day as a string */
const dateOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
function getDate(date) {
	if (date) return new Date(date).toLocaleDateString('default', dateOptions);
	return new Date().toLocaleDateString('default', dateOptions);
}
