/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const alterWeapon = require('../../patreon/alterWeapon.js');
const alterWeaponDisplay = require('../../patreon/alterWeaponDisplay.js');

const prices = {
	Common: 100,
	Uncommon: 250,
	Rare: 400,
	Epic: 600,
	Mythical: 5000,
	Legendary: 15000,
	Fabled: 50000,
};
exports.shardPrices = {
	Common: 1,
	Uncommon: 3,
	Rare: 5,
	Epic: 25,
	Mythical: 300,
	Legendary: 1000,
	Fabled: 5000,
};
const ranks = [
	['cw', 'commonweapons', 'commonweapon'],
	['uw', 'uncommonweapons', 'uncommonweapon'],
	['rw', 'rareweapon', 'rareweapons'],
	['ew', 'epicweapons', 'epicweapon'],
	['mw', 'mythicalweapons', 'mythicalweapon', 'mythicweapons', 'mythicweapon'],
	['lw', 'legendaryweapons', 'legendaryweapon'],
	['fw', 'fabledweapons', 'fabledweapon', 'fableweapons', 'fableweapon'],
];

const weaponEmoji = '🗡';
const weaponPerPage = 15;
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';
const rewindEmoji = '⏪';
const fastForwardEmoji = '⏩';
const sortEmoji = '🔃';

/* All weapons */
let weapons = {};
let availableWeapons = {};
setTimeout(() => {
	weapons = WeaponInterface.weapons;
	for (let key in weapons) {
		let weapon = weapons[key];
		if (!weapon.disabled) availableWeapons[key] = weapon;
	}
}, 0);

const getRandomWeapon = (exports.getRandomWeapon = function (wid) {
	let weapon;

	if (wid) {
		weapon = weapons[wid];
		if (!weapon) throw 'No weapon with id: ' + wid;
	} else {
		/* Grab a random weapon */
		let keys = Object.keys(availableWeapons);
		let random = keys[Math.floor(Math.random() * keys.length)];
		weapon = availableWeapons[random];
	}

	/* Initialize random stats */
	weapon = new weapon();

	return weapon;
});

exports.getRandomWeapons = function (uid, count, wid) {
	let randomWeapons = [];
	for (let i = 0; i < count; i++) {
		let tempWeapon = getRandomWeapon(wid);
		let weaponSql = `INSERT INTO user_weapon (uid,wid,stat,avg) VALUES (${uid ? uid : '?'},${
			tempWeapon.id
		},'${tempWeapon.sqlStat}',${tempWeapon.avgQuality});`;
		let passiveSql = 'INSERT INTO user_weapon_passive (uwid,pcount,wpid,stat) VALUES ';
		for (let j = 0; j < tempWeapon.passives.length; j++) {
			let tempPassive = tempWeapon.passives[j];
			passiveSql += `(?,${j},${tempPassive.id},'${tempPassive.sqlStat}'),`;
		}
		passiveSql = `${passiveSql.slice(0, -1)};`;

		tempWeapon.weaponSql = weaponSql;
		tempWeapon.passiveSql = passiveSql;
		randomWeapons.push(tempWeapon);
	}

	return randomWeapons;
};

exports.getItems = async function (p) {
	let sql = `SELECT wid,count(uwid) AS count FROM user_weapon WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) GROUP BY wid`;
	let result = await p.query(sql);
	let items = {};
	for (let i = 0; i < result.length; i++) {
		let key = result[i].wid;
		if (weapons[key])
			items[key] = {
				id: key + 100,
				count: result[i].count,
				emoji: weapons[key].getEmoji,
			};
	}
	return items;
};

let parseWeapon = (exports.parseWeapon = function (data) {
	if (!data.parsed) {
		/* Parse stats */
		data.stat = data.stat.split(',');
		if (data.stat[0] == '') data.stat = [];
		for (let i = 0; i < data.stat.length; i++) data.stat[i] = parseInt(data.stat[i]);

		/* Grab all passives */
		for (let i = 0; i < data.passives.length; i++) {
			let stats = data.passives[i].stat.split(',');
			for (let j = 0; j < stats.length; j++) stats[j] = parseInt(stats[j]);
			let passive = new WeaponInterface.allPassives[data.passives[i].id](stats);
			passive.pcount = data.passives[i].pcount;
			data.passives[i] = passive;
		}
		data.parsed = true;
	}

	/* Convert data to actual weapon data */
	if (!weapons[data.id]) return;
	let weapon = new weapons[data.id](data.passives, data.stat);
	weapon.uwid = data.uwid;
	weapon.ruwid = data.ruwid;
	weapon.pid = data.pid;
	weapon.animal = data.animal;

	return weapon;
});

let parseWeaponQuery = (exports.parseWeaponQuery = function (query) {
	/* Group weapons by uwid and add their respective passives */
	let weapons = {};
	for (let i = 0; i < query.length; i++) {
		if (query[i].uwid) {
			let key = '_' + query[i].uwid;
			if (!(key in weapons)) {
				weapons[key] = {
					uwid: shortenUWID(query[i].uwid),
					ruwid: query[i].uwid,
					pid: query[i].pid,
					id: query[i].wid,
					stat: query[i].stat,
					animal: {
						name: query[i].name,
						nickname: query[i].nickname,
					},
					passives: [],
				};
			}
			if (query[i].wpid) {
				weapons[key].passives.push({
					id: query[i].wpid,
					pcount: query[i].pcount,
					stat: query[i].pstat,
				});
			}
		}
	}
	return weapons;
});

/* Displays weapons with multiple pages */
let display = (exports.display = async function (p, pageNum = 0, sort = 0, opt) {
	if (!opt) opt = {};
	let { users, msg, user } = opt;
	if (!users) users = [];
	if (!user) user = p.msg.author;
	users.push(user.id);

	/* Construct initial page */
	let page = await getDisplayPage(p, user, pageNum, sort, opt);
	if (!page) return;

	/* Send msg and add reactions */
	if (!msg) msg = await p.send({ embed: page.embed });
	else await msg.edit({ embed: page.embed });

	if (page.maxPage > 19) await msg.addReaction(rewindEmoji);
	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);
	if (page.maxPage > 19) await msg.addReaction(fastForwardEmoji);
	await msg.addReaction(sortEmoji);
	let filter = (emoji, userID) =>
		[sortEmoji, nextPageEmoji, prevPageEmoji, rewindEmoji, fastForwardEmoji].includes(emoji.name) &&
		users.includes(userID);
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	let handler = async function (emoji) {
		try {
			if (page) {
				/* Save the animal's action */
				if (emoji.name === nextPageEmoji) {
					if (pageNum + 1 < page.maxPage) pageNum++;
					else pageNum = 0;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await msg.edit({ embed: page.embed });
				} else if (emoji.name === prevPageEmoji) {
					if (pageNum > 0) pageNum--;
					else pageNum = page.maxPage - 1;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await msg.edit({ embed: page.embed });
				} else if (emoji.name === sortEmoji) {
					sort = (sort + 1) % 4;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await msg.edit({ embed: page.embed });
				} else if (emoji.name === rewindEmoji) {
					pageNum -= 5;
					if (pageNum < 0) pageNum = 0;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await msg.edit({ embed: page.embed });
				} else if (emoji.name === fastForwardEmoji) {
					pageNum += 5;
					if (pageNum >= page.maxPage) pageNum = page.maxPage - 1;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await msg.edit({ embed: page.embed });
				}
			}
		} catch (err) {
			/* empty */
		}
	};

	collector.on('collect', handler);
	collector.on('end', async function (_collected) {
		if (page) {
			page.embed.color = 6381923;
			await msg.edit({
				content: 'This message is now inactive',
				embed: page.embed,
			});
		}
	});
});

const declineEmoji = '👎';
const acceptEmoji = '👍';

/* Ask a user to display their weapon */
exports.askDisplay = async function (p, id, opt = {}) {
	if (id == p.msg.author.id) {
		display(p);
		return;
	}
	if (id == p.client.user.id) {
		p.errorMsg("... trust me. You don't want to see what I have.", 3000);
		return;
	}

	let user = p.getMention(id);
	if (!user) {
		p.errorMsg(", I couldn't find that user! :(", 3000);
		return;
	}
	if (user.bot) {
		p.errorMsg(", you dum dum! Bots don't carry weapons!", 3000);
		return;
	}

	let embed = {
		author: {
			name: user.username + ', ' + p.msg.author.username + ' wants to see your weapons!',
			icon_url: p.msg.author.avatarURL,
		},
		description: 'Do you give permission for this user to view your weapons?',
		color: p.config.embed_color,
	};

	let msg = await p.send({ embed });

	await msg.addReaction(acceptEmoji);
	await msg.addReaction(declineEmoji);

	let filter = (emoji, userID) =>
		(emoji.name === acceptEmoji || emoji.name === declineEmoji) && user.id === userID;
	let collector = p.reactionCollector.create(msg, filter, { time: 60000 });
	collector.on('collect', async (emoji) => {
		collector.stop('done');
		if (emoji.name == declineEmoji) {
			embed.color = 16711680;
			msg.edit({ embed });
		} else {
			try {
				await msg.removeReactions();
			} catch (e) {
				/* empty */
			}
			display(p, 0, 0, {
				users: [p.msg.author.id],
				msg,
				user: user,
				wid: opt.wid,
			});
		}
	});

	collector.on('end', async function (reason) {
		if (reason != 'done') {
			embed.color = 6381923;
			await msg.edit({ content: 'This message is now inactive', embed });
		}
	});
};

/* Gets a single page */
let getDisplayPage = async function (p, user, page, sort, opt = {}) {
	let { wid } = opt;
	/* Query all weapons */
	let sql = `SELECT temp.*,user_weapon_passive.wpid,user_weapon_passive.pcount,user_weapon_passive.stat as pstat
		FROM
			(SELECT user_weapon.uwid,user_weapon.wid,user_weapon.stat,animal.name,animal.nickname
			FROM  user
				INNER JOIN user_weapon ON user.uid = user_weapon.uid
				LEFT JOIN animal ON animal.pid = user_weapon.pid
			WHERE
				user.id = ${user.id} `;
	if (wid) sql += `AND user_weapon.wid = ${wid} `;
	sql += 'ORDER BY ';

	if (sort === 1) sql += 'user_weapon.avg DESC,';
	else if (sort === 2) sql += 'user_weapon.wid DESC, user_weapon.avg DESC,';
	else if (sort === 3) sql += 'user_weapon.pid DESC,';

	sql += ` user_weapon.uwid DESC
			LIMIT ${weaponPerPage}
			OFFSET ${page * weaponPerPage}) temp
		LEFT JOIN
			user_weapon_passive ON temp.uwid = user_weapon_passive.uwid
	;`;
	sql += `SELECT COUNT(uwid) as count FROM user
			INNER JOIN user_weapon ON user.uid = user_weapon.uid
		WHERE
			user.id = ${user.id} `;
	if (wid) sql += `AND user_weapon.wid = ${wid} `;
	sql += ';';
	let result = await p.query(sql);

	/* out of bounds or no weapon */
	if (!result[0][0]) {
		p.errorMsg(', you do not have any weapons, or the page is out of bounds', 3000);
		return;
	}

	/* Parse total weapon count */
	let totalCount = result[1][0].count;
	let nextPage = (page + 1) * weaponPerPage <= totalCount;
	let prevPage = page > 0;
	let maxPage = Math.ceil(totalCount / weaponPerPage);

	/* Parse all weapons */
	let user_weapons = parseWeaponQuery(result[0]);

	/* Parse actual weapon data for each weapon */
	let descHelp =
		'Description: `owo weapon {weaponID}`\nEquip: `owo weapon {weaponID} {animal}`\nUnequip: `owo weapon unequip {weaponID}`\nReroll: `owo w rr {weaponID} [passive|stat]`\nSell: `owo sell {weaponID|commonweapons,rareweapons...}`\nDismantle: `owo dismantle {weaponID|commonweapons,rareweapons...}`\n';
	let desc = '';
	let fieldText;
	let fields = [];
	const user_weapons_2 = [];
	for (let key in user_weapons) {
		let weapon = parseWeapon(user_weapons[key]);
		if (weapon) {
			user_weapons_2.push(weapon);
			let row = '';
			let emoji = `${weapon.rank.emoji}${weapon.emoji}`;
			for (let i = 0; i < weapon.passives.length; i++) {
				let passive = weapon.passives[i];
				emoji += passive.emoji;
			}
			row += `\n\`${user_weapons[key].uwid}\` ${emoji} **${weapon.name}** | Quality: ${weapon.avgQuality}%`;
			if (user_weapons[key].animal.name) {
				let animal = p.global.validAnimal(user_weapons[key].animal.name);
				row += p.replaceMentions(
					` | ${animal.uni ? animal.uni : animal.value} ${
						user_weapons[key].animal.nickname ? user_weapons[key].animal.nickname : ''
					}`
				);
			}
			if (fieldText) {
				if (fieldText.length + row.length >= 1024) {
					fields.push({
						name: p.config.emoji.blank,
						value: fieldText,
					});
					fieldText = row;
				} else {
					fieldText += row;
				}
			} else if (descHelp.length + desc.length + row.length >= 4096) {
				fieldText = row;
			} else {
				desc += row;
			}
		}
	}
	if (fieldText) {
		fields.push({
			name: p.config.emoji.blank,
			value: fieldText,
		});
	}

	/* Construct msg */
	let title = user.username + "'s " + (wid ? weapons[wid].name : 'weapons');
	let embed = {
		author: {
			name: title,
			icon_url: user.avatarURL,
		},
		description: descHelp + desc,
		color: p.config.embed_color,
		footer: {
			text: 'Page ' + (page + 1) + '/' + maxPage + ' | ',
		},
		fields,
	};

	if (sort === 0) embed.footer.text += 'Sorting by id';
	else if (sort === 1) embed.footer.text += 'Sorting by rarity';
	else if (sort === 2) embed.footer.text += 'Sorting by type';
	else if (sort === 3) embed.footer.text += 'Sorting by equipped';

	embed = alterWeapon.alter(user.id, embed, {
		...opt,
		page: page + 1,
		descHelp: descHelp,
		desc: desc,
		weapons: user_weapons_2,
	});

	return { sql, embed, totalCount, nextPage, prevPage, maxPage };
};

exports.describe = async function (p, uwid) {
	uwid = expandUWID(uwid);

	/* Check if valid */
	if (!uwid) {
		p.errorMsg(
			', I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!'
		);
		return;
	}

	/* sql query */
	let sql = `SELECT user.id,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user INNER JOIN user_weapon a ON user.uid = a.uid LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid WHERE a.uwid = ${uwid};`;
	let result = await p.query(sql);

	/* Check if valid */
	if (!result[0]) {
		p.errorMsg(
			', I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!'
		);
		return;
	}

	/* parse weapon to get info */
	let weapon = this.parseWeaponQuery(result);
	weapon = weapon[Object.keys(weapon)[0]];
	weapon = this.parseWeapon(weapon);

	/* If no weapon */
	if (!weapon) {
		p.errorMsg(
			', I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!'
		);
		return;
	}

	/* Parse image url */
	let url = weapon.emoji;
	let temp;
	if ((temp = url.match(/:[0-9]+>/))) {
		temp = 'https://cdn.discordapp.com/emojis/' + temp[0].match(/[0-9]+/)[0] + '.';
		if (url.match(/<a:/)) temp += 'gif';
		else temp += 'png';
		url = temp;
	}

	// Grab user
	let user = await p.fetch.getUser(result[0].id);
	let username = 'A User';
	if (user) username = user.username;

	/* Make description */
	let desc = `**Name:** ${weapon.name}\n`;
	desc += `**Owner:** ${username}\n`;
	desc += `**ID:** \`${shortenUWID(uwid)}\`\n`;
	desc += `**Sell Value:** ${weapon.unsellable ? 'UNSELLABLE' : prices[weapon.rank.name]}\n`;
	desc += `**Quality:** ${weapon.rank.emoji} ${weapon.avgQuality}%\n`;
	desc += `**WP Cost:** ${Math.ceil(weapon.manaCost)} <:wp:531620120976687114>`;
	desc += `\n**Description:** ${weapon.desc}\n`;
	if (weapon.buffList.length > 0) {
		desc += '\n';
		let buffs = weapon.getBuffs();
		for (let i in buffs) {
			desc += `${buffs[i].emoji} **${buffs[i].name}** - ${buffs[i].desc}\n`;
		}
	}
	if (weapon.passives.length <= 0) desc += '\n**Passives:** None';
	for (let i = 0; i < weapon.passives.length; i++) {
		let passive = weapon.passives[i];
		desc += `\n${passive.emoji} **${passive.name}** - ${passive.desc}`;
	}

	/* Construct embed */
	let embed = {
		author: {
			name: username + "'s " + weapon.name,
		},
		color: p.config.embed_color,
		thumbnail: {
			url: url,
		},
		description: desc,
	};
	if (user) {
		embed.author.icon_url = user.avatarURL;
		embed = alterWeaponDisplay.alter(user.id, embed, {
			user,
			weapon,
		});
	}
	p.send({ embed });
};

exports.equip = async function (p, uwid, pet) {
	uwid = expandUWID(uwid);
	if (!uwid) {
		p.errorMsg(
			', could not find that weapon or animal! The correct command is `owo weapon {weaponID} {animal}`\n' +
				p.config.emoji.blank +
				' **|** The weaponID can be found in the command `owo weapon`'
		);
		return;
	}
	/* Construct sql depending in pet parameter */
	let pid;
	if (p.global.isInt(pet)) {
		pid = `(SELECT pid FROM pet_team_animal c WHERE pos = ${pet}
				AND pgid = (
					SELECT pt2.pgid FROM user u2
						INNER JOIN pet_team pt2
							ON pt2.uid = u2.uid
						LEFT JOIN pet_team_active pt_act
							ON pt2.pgid = pt_act.pgid
					WHERE u2.id = ${p.msg.author.id}
					ORDER BY pt_act.pgid DESC, pt2.pgid ASC
					LIMIT 1)
				)`;
	} else {
		pid = `(SELECT pid FROM animal WHERE name = '${pet.value}' AND id = ${p.msg.author.id})`;
	}
	let sql = `UPDATE IGNORE user_weapon SET pid = NULL WHERE
			uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND
			pid = ${pid} AND
			(SELECT * FROM (SELECT uwid FROM user_weapon WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND uwid = ${uwid}) a) IS NOT NULL;`;
	sql += `UPDATE IGNORE user_weapon SET
			pid = ${pid}
		WHERE
			uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND
			uwid = ${uwid} AND
			${pid} IS NOT NULL;`;
	sql += `SELECT animal.name,animal.nickname,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal ON a.pid = animal.pid WHERE a.uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	let result = await p.query(sql);

	/* Success */
	if (result[1].changedRows > 0) {
		let animal = p.global.validAnimal(result[2][0].name);
		let nickname = result[2][0].nickname;
		let weapon = this.parseWeaponQuery(result[2]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		if (weapon)
			p.replyMsg(
				weaponEmoji,
				p.replaceMentions(
					`, ${animal.uni ? animal.uni : animal.value} **${
						nickname ? nickname : animal.name
					}** is now wielding ${weapon.emoji} **${weapon.name}**!`
				)
			);
		else p.errorMsg(', Could not find a weapon with that id!');

		/* Already equipped */
	} else if (result[1].affectedRows > 0) {
		let animal = p.global.validAnimal(result[2][0].name);
		let nickname = result[2][0].nickname;
		let weapon = this.parseWeaponQuery(result[2]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		if (weapon)
			p.replyMsg(
				weaponEmoji,
				p.replaceMentions(
					`, ${animal.uni ? animal.uni : animal.value} **${
						nickname ? nickname : animal.name
					}** is already wielding ${weapon.emoji} **${weapon.name}**!`
				)
			);
		else p.errorMsg(', Could not find a weapon with that id!');

		/* A Failure (like me!) */
	} else {
		p.errorMsg(
			', could not find that weapon or animal! The correct command is `owo weapon {weaponID} {animal}`\n' +
				p.config.emoji.blank +
				' **|** The weaponID can be found in the command `owo weapon`'
		);
	}
};

exports.unequip = async function (p, uwid) {
	uwid = expandUWID(uwid);
	if (!uwid) {
		p.errorMsg(', Could not find a weapon with that id!');
		return;
	}

	let sql = `SELECT animal.name,animal.nickname,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal ON a.pid = animal.pid WHERE a.uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	sql += `UPDATE IGNORE user_weapon SET pid = NULL WHERE uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	let result = await p.query(sql);

	/* Success */
	if (result[1].changedRows > 0) {
		let animal = p.global.validAnimal(result[0][0].name);
		let nickname = result[0][0].nickname;
		let weapon = this.parseWeaponQuery(result[0]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		if (weapon)
			p.replyMsg(
				weaponEmoji,
				p.replaceMentions(
					`, Unequipped ${weapon.emoji} **${weapon.name}** from ${
						animal.uni ? animal.uni : animal.value
					} **${nickname ? nickname : animal.name}**`
				)
			);
		else p.errorMsg(', Could not find a weapon with that id!');

		/* No body using weapon */
	} else if (result[1].affectedRows > 0) {
		let weapon = this.parseWeaponQuery(result[0]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		if (weapon) p.replyMsg(weaponEmoji, `, No animal is using ${weapon.emoji} **${weapon.name}**`);
		else p.errorMsg(', Could not find a weapon with that id!');

		/* Invalid */
	} else {
		p.errorMsg(', Could not find a weapon with that id!');
	}
};

/* Sells a weapon */
exports.sell = async function (p, uwid) {
	/* Check if we're selling a rank */
	uwid = uwid.toLowerCase();
	for (let i = 0; i < ranks.length; i++) {
		if (ranks[i].includes(uwid)) {
			sellRank(p, i);
			return;
		}
	}

	uwid = expandUWID(uwid);
	if (!uwid) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* Grab the item we will sell */
	let sql = `SELECT a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname
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
		p.errorMsg(', please unequip the weapon to sell it!', 3000);
		return;
	}

	/* Parse stats to determine price */
	let weapon = this.parseWeaponQuery(result);
	for (let key in weapon) {
		weapon = this.parseWeapon(weapon[key]);
	}

	if (!weapon) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* Is this weapon sellable? */
	if (weapon.unsellable) {
		p.errorMsg(', This weapon cannot be sold!');
		return;
	}

	/* Get weapon price */
	let price = prices[weapon.rank.name];
	if (!price) {
		p.errorMsg(', Something went terribly wrong...');
		return;
	}

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

	/* Give cowoncy */
	sql = `UPDATE cowoncy SET money = money + ${price} WHERE id = ${p.msg.author.id}`;
	result = await p.query(sql);

	p.replyMsg(
		weaponEmoji,
		`, You sold a(n) **${weapon.rank.name} ${weapon.name}**  ${weapon.rank.emoji}${weapon.emoji} for **${price}** cowoncy!`
	);
	p.logger.incr('cowoncy', price, { type: 'sell' }, p.msg);
};

let sellRank = (exports.sellRank = async function (p, rankLoc) {
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
	let sql = `SELECT a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat
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
	let weapon = parseWeaponQuery(result);
	let weapons = [];
	let weaponsSQL = [];
	let price;
	let rank;
	for (let key in weapon) {
		let tempWeapon = parseWeapon(weapon[key]);
		if (!tempWeapon.unsellable) {
			weapons.push(tempWeapon.emoji);
			weaponsSQL.push(tempWeapon.ruwid);
		}
		/* Get weapon price */
		if (!price) {
			price = prices[tempWeapon.rank.name];
			rank = tempWeapon.rank.emoji + ' **' + tempWeapon.rank.name + '**';
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

	/* Give cowoncy */
	sql = `UPDATE cowoncy SET money = money + ${price} WHERE id = ${p.msg.author.id}`;
	result = await p.query(sql);

	p.replyMsg(
		weaponEmoji,
		`, You sold all your ${rank} weapons for **${price}** cowoncy!\n${
			p.config.emoji.blank
		} **| Sold:** ${weapons.join('')}`
	);
	p.logger.incr('cowoncy', price, { type: 'sell' }, p.msg);
});

/* Shorten a uwid to base36 */
let shortenUWID = (exports.shortenUWID = function (uwid) {
	if (!uwid) return;
	return uwid.toString(36).toUpperCase();
});

/* expand base36 to decimal */
let expandUWID = (exports.expandUWID = function (euwid) {
	if (!euwid) return;
	euwid = euwid + '';
	if (!/^[a-zA-Z0-9]+$/.test(euwid)) return;
	return parseInt(euwid.toLowerCase(), 36);
});

exports.getWID = function (id) {
	return weapons[id];
};
