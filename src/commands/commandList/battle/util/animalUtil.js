/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');

exports.stats = function (animal, flags) {
	/* Parse animal stats */
	let lvl = this.toLvl(animal.xp);
	if (flags && flags.level) lvl.lvl = flags.level;
	/* Parse base animal stat*/
	let stats = this.parseStats(animal.animal, lvl.lvl);

	stats.lvl = lvl.lvl;
	stats.xp = [lvl.currentXp, lvl.maxXp];

	this.weaponStats(stats, animal.weapon);

	/* Make sure bonus hp/wp is added */
	stats.hp[0] = stats.hp[1] + stats.hp[3];
	stats.wp[0] = stats.wp[1] + stats.wp[3];

	/* add the mr/pr percentages */
	stats.mrp = WeaponInterface.resToPrettyPercent(stats.mr[0] + stats.mr[1]);
	stats.prp = WeaponInterface.resToPrettyPercent(stats.pr[0] + stats.pr[1]);

	animal.stats = stats;
};

exports.weaponStats = function (stats, weapon) {
	/* Add Bonus Stats */
	if (weapon) weapon.alterStats(stats);
};

/* Parse animal stats based on level */
exports.parseStats = function (animal, lvl) {
	let stats = {};
	let baseHp = 500 + lvl * (animal.hpr * 2);
	stats.hp = [baseHp, baseHp, baseHp, 0];
	let baseWp = 500 + lvl * (animal.wpr * 2);
	stats.wp = [baseWp, baseWp, baseWp, 0];
	let baseAtt = 100 + lvl * animal.attr;
	stats.att = [baseAtt, 0];
	let baseMag = 100 + lvl * animal.magr;
	stats.mag = [baseMag, 0];
	let basePr = 25 + lvl * animal.prr * 2;
	stats.pr = [basePr, 0];
	let baseMr = 25 + lvl * animal.mrr * 2;
	stats.mr = [baseMr, 0];
	return stats;
};

/* Converts xp to lvl */
exports.toLvl = function (xp) {
	let lvl = 1;
	while (xp >= getXP(lvl)) {
		xp -= getXP(lvl);
		lvl++;
	}
	return { lvl, currentXp: xp, maxXp: getXP(lvl) };
};

/* converts lvl to xp */
function getXP(lvl) {
	return Math.pow(lvl, 4) + 1000;
}

/* Returns sql for giving xp to animal */
exports.giveXP = function (pid, xp) {
	let sql = `UPDATE IGNORE animal SET xp = xp + ${xp} WHERE pid = ${pid};`;
	return sql;
};

const barLength = 24;
exports.bar = function (stats) {
	let bar = '';
	let hp = stats.hp[0] / (stats.hp[1] + stats.hp[3]);
	hp = Math.ceil(barLength * hp);
	if (hp < 0) hp = 0;
	for (let i = 0; i < barLength; i++) {
		if (i < hp) bar += '█';
		else bar += '▁';
	}
	bar += '\n';
	let wp = stats.wp[0] / (stats.wp[1] + stats.wp[3]);
	wp *= Math.ceil(barLength * wp);
	if (wp < 0) wp = 0;
	for (let i = 0; i < barLength; i++) {
		if (i < wp) bar += '▰';
		else bar += '▱';
	}
	return bar;
};
