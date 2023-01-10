/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const ranks = [
	['common', 'cw', 'commonweapons', 'commonweapon'],
	['uncommon', 'uw', 'uncommonweapons', 'uncommonweapon'],
	['rare', 'rw', 'rareweapon', 'rareweapons'],
	['epic', 'ew', 'epicweapons', 'epicweapon'],
	[
		'mythic',
		'mythical',
		'mw',
		'mythicalweapons',
		'mythicalweapon',
		'mythicweapons',
		'mythicweapon',
	],
	['legendary', 'lw', 'legendaryweapons', 'legendaryweapon'],
	['fabled', 'fable', 'fw', 'fabledweapons', 'fabledweapon', 'fableweapons', 'fableweapon'],
];
const shardEmoji = '<:weaponshard:655902978712272917>';
const dismantleEmoji = '🔨';
const weaponUtil = require('./util/weaponUtil.js');
const WeaponInterface = require('./WeaponInterface.js');

module.exports = new CommandInterface({
	alias: ['weaponshard', 'ws', 'weaponshards', 'dismantle'],

	args: '',

	desc: '',

	example: [''],

	related: ['owo weapon'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 5000,
	half: 80,
	six: 500,
	bot: true,

	execute: async function (p) {
		if (!p.args.length) {
			await displayWeaponShards(p);
		} else {
			let arg = p.args[0].toLowerCase();
			for (let i in ranks) {
				if (ranks[i].includes(arg)) {
					await dismantleRank(p, i);
					return;
				}
			}
			await dismantleId(p, arg);
		}
	},
});

async function displayWeaponShards(p) {
	let sql = `SELECT shards.count FROM shards INNER JOIN user ON shards.uid = user.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	let shards = 0;
	if (result && result[0]) shards = result[0].count;
	shards = p.global.toFancyNum(shards);

	p.replyMsg(shardEmoji, `, you currently have **${shards}** Weapon Shards!`);
}

async function dismantleRank(p, rankLoc) {
	// (min,max]
	let min = 0,
		max = 0;
	for (let i = 0; i <= rankLoc; i++) {
		let rank = WeaponInterface.ranks[i];
		min = max;
		max += rank[0];
	}
	min *= 100;
	max *= 100;

	/* Grab the item we will sell */
	let sql = `SELECT user.uid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat
		FROM user
			LEFT JOIN user_weapon a ON user.uid = a.uid
			LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid
		WHERE user.id = ${p.msg.author.id} AND avg > ${min} AND avg <= ${max} AND a.pid IS NULL LIMIT 500;`;

	let result = await p.query(sql);

	/* not a real weapon! */
	if (!result[0]) {
		p.errorMsg(', you do not have any weapons with this rank!', 3000);
		return;
	}

	/* Parse emoji and uwid */
	let weapon = weaponUtil.parseWeaponQuery(result);
	let weapons = [];
	let weaponsSQL = [];
	let price = weaponUtil.shardPrices[WeaponInterface.ranks[rankLoc][1]];
	let rank = WeaponInterface.ranks[rankLoc][2] + ' **' + WeaponInterface.ranks[rankLoc][1] + '**';
	for (var key in weapon) {
		let tempWeapon = weaponUtil.parseWeapon(weapon[key]);
		if (!tempWeapon.unsellable) {
			weapons.push(tempWeapon.emoji);
			weaponsSQL.push(tempWeapon.ruwid);
		}
	}
	weaponsSQL = '(' + weaponsSQL.join(',') + ')';

	if (weapons.length <= 0) {
		p.errorMsg(', you do not have any weapons with this rank!', 3000);
		return;
	}

	if (!price) {
		p.errorMsg(', Something went terribly wrong...');
		return;
	}

	let uid = result[0].uid;

	sql = `DELETE user_weapon_passive FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE id = ${p.msg.author.id}
			AND user_weapon_passive.uwid IN ${weaponsSQL}
			AND user_weapon.pid IS NULL;`;
	sql += `DELETE user_weapon FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		WHERE id = ${p.msg.author.id}
			AND user_weapon.uwid IN ${weaponsSQL}
			AND user_weapon.pid IS NULL;`;

	result = await p.query(sql);

	/* Check if deleted */
	if (result[1].affectedRows == 0) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* calculate rewards */
	price *= result[1].affectedRows;

	sql = `INSERT INTO shards (uid,count) VALUES (${uid},${price}) ON DUPLICATE KEY UPDATE count = count + ${price};`;
	result = await p.query(sql);

	p.replyMsg(
		dismantleEmoji,
		`, You dismantled all of your ${rank} weapons for **${price}** ${shardEmoji} WeaponShards!\n${
			p.config.emoji.blank
		} **| Dismantled:** ${weapons.join('')}`
	);
	p.logger.incr('shards', price, { type: 'dismantle' }, p.msg);
}

async function dismantleId(p, uwid) {
	uwid = weaponUtil.expandUWID(uwid);
	if (!uwid) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* Grab the item we will dismantle */
	let sql = `SELECT user.uid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname
		FROM user
			LEFT JOIN user_weapon a ON user.uid = a.uid
			LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid
			LEFT JOIN animal c ON a.pid = c.pid
		WHERE user.id = ${p.msg.author.id} AND a.uwid = ${uwid};`;

	let result = await p.query(sql);

	/* not a real weapon! */
	if (!result[0]) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* If an animal is using the weapon */
	if (result[0] && result[0].name) {
		p.errorMsg(', please unequip the weapon to dismantle it!', 3000);
		return;
	}

	/* Parse stats to determine price */
	let weapon = weaponUtil.parseWeaponQuery(result);
	for (let key in weapon) {
		weapon = weaponUtil.parseWeapon(weapon[key]);
	}

	if (!weapon) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* Is this weapon sellable? */
	if (weapon.unsellable) {
		p.errorMsg(', This weapon cannot be dismantled!');
		return;
	}

	/* Get weapon price */
	let price = weaponUtil.shardPrices[weapon.rank.name];
	if (!price) {
		p.errorMsg(', Something went terribly wrong...');
		return;
	}

	let uid = result[0].uid;

	sql = `DELETE user_weapon_passive FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE id = ${p.msg.author.id}
			AND user_weapon_passive.uwid = ${uwid}
			AND user_weapon.pid IS NULL;`;
	sql += `DELETE user_weapon FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		WHERE id = ${p.msg.author.id}
			AND user_weapon.uwid = ${uwid}
			AND user_weapon.pid IS NULL;`;
	result = await p.query(sql);

	/* Check if deleted */
	if (result[1].affectedRows == 0) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* Give shards*/
	sql = `INSERT INTO shards (uid,count) VALUES (${uid},${price}) ON DUPLICATE KEY UPDATE count = count + ${price};`;
	result = await p.query(sql);

	p.replyMsg(
		dismantleEmoji,
		`, You dismantled a(n) **${weapon.rank.name} ${weapon.name}**  ${weapon.rank.emoji}${
			weapon.emoji
		} for **${p.global.toFancyNum(price)}** ${shardEmoji} Weapon Shard${price == 1 ? '' : 's'}!`
	);
	p.logger.incr('shards', price, { type: 'dismantle' }, p.msg);
}
