/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const teamUtil = require('./teamUtil.js');
const animalUtil = require('../../zoo/animalUtil.js');
const alterWeapon = require('../../patreon/alterWeapon.js');
const alterWeaponDisplay = require('../../patreon/alterWeaponDisplay.js');
const global = require('../../../../utils/global.js');
const mysql = require('../../../../botHandlers/mysqlHandler.js');

WeaponInterface.setWeaponUtil(this);
teamUtil.setWeaponUtil(this);

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

exports.getRandomWeapons = function (count, wid) {
	let randomWeapons = [];
	for (let i = 0; i < count; i++) {
		let tempWeapon = getRandomWeapon(wid);
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
			let passive = new WeaponInterface.allPassives[data.passives[i].id](stats, null, {
				wear: data.wear || 0,
			});
			passive.pcount = data.passives[i].pcount;
			data.passives[i] = passive;
		}
		data.parsed = true;
	}

	/* Convert data to actual weapon data */
	if (!weapons[data.id]) return;
	let weapon = new weapons[data.id](data.passives, data.stat, null, {
		wear: data.wear || 0,
		hasTT: data.hasTT,
		kills: data.kills,
		rrCount: data.rrCount,
		rrAttempt: data.rrAttempt,
	});
	weapon.uwid = data.uwid;
	weapon.ruwid = data.ruwid;
	weapon.pid = data.pid;
	weapon.animal = data.animal;
	weapon.userId = data.userId;
	weapon.favorite = !!data.favorite;

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
					userId: query[i].id,
					ruwid: query[i].uwid,
					pid: query[i].pid,
					id: query[i].wid,
					stat: query[i].stat,
					animal: {
						name: query[i].name,
						nickname: query[i].nickname,
					},
					passives: [],
					wear: query[i].wear || 0,
					hasTT: !!query[i].tt,
					kills: query[i].kills,
					rrAttempt: query[i].rrattempt,
					rrCount: query[i].rrcount,
					favorite: query[i].favorite,
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
	if (opt.wid) {
		opt.widList = [opt.wid.toString()];
		delete opt.wid;
	}
	let { users, msg, user } = opt;
	if (!users) users = [];
	if (!user) user = p.msg.author;
	users.push(user.id);

	/* Construct initial page */
	let page = await getDisplayPage(p, user, pageNum, sort, opt);
	if (!page) return;

	/* Send msg and add reactions */
	if (!msg) msg = await p.send(page.embed);
	else await msg.edit(page.embed);

	let filter = (componentName, user) =>
		['prev', 'next', 'rewind', 'forward', 'sort', 'filter'].includes(componentName) &&
		users.includes(user.id);
	let collector = p.interactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	let handler = async function (component, _user, ack, _err, values) {
		try {
			if (page) {
				/* Save the animal's action */
				if (component === 'next') {
					if (pageNum + 1 < page.maxPage) pageNum++;
					else pageNum = 0;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await ack(page.embed);
				} else if (component === 'prev') {
					if (pageNum > 0) pageNum--;
					else pageNum = page.maxPage - 1;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await ack(page.embed);
				} else if (component === 'sort') {
					sort = values[0];
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await ack(page.embed);
				} else if (component === 'rewind') {
					pageNum -= 5;
					if (pageNum < 0) pageNum = 0;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await ack(page.embed);
				} else if (component === 'forward') {
					pageNum += 5;
					if (pageNum >= page.maxPage) pageNum = page.maxPage - 1;
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await ack(page.embed);
				} else if (component === 'filter') {
					pageNum = 0;
					if (values && values.length) {
						opt.widList = values;
					} else {
						opt.widList = undefined;
					}
					page = await getDisplayPage(p, user, pageNum, sort, opt);
					if (page) await ack(page.embed);
				}
			}
		} catch (err) {
			/* empty */
		}
	};

	collector.on('collect', handler);
	collector.on('end', async (_reason) => {
		if (page) {
			page.embed.embed.color = 6381923;
			page.embed.content = 'This message is now inactive';
			await msg.edit(page.embed);
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
			name: p.getName(user) + ', ' + p.getName() + ' wants to see your weapons!',
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
	let { wid, widList } = opt;
	/* Query all weapons */
	let sql = `SELECT
			temp.*,
			user_weapon_passive.wpid, user_weapon_passive.pcount, user_weapon_passive.stat as pstat
		FROM
			(SELECT
				user_weapon.uwid, user_weapon.wid, user_weapon.stat, user_weapon.rrcount, user_weapon.rrattempt, user_weapon.wear, user_weapon.favorite,
			  animal.name, animal.nickname,
				uwk.uwid as tt, uwk.kills
			FROM  user
				INNER JOIN user_weapon ON user.uid = user_weapon.uid
				LEFT JOIN animal ON animal.pid = user_weapon.pid
				LEFT JOIN user_weapon_kills uwk ON user_weapon.uwid = uwk.uwid
			WHERE
				user.id = ${user.id} `;
	if (wid) {
		sql += `AND user_weapon.wid = ${wid} `;
	} else if (widList) {
		sql += `AND user_weapon.wid IN (${widList.join(',')}) `;
	}
	sql += 'ORDER BY ';

	if (sort === 'rarity') sql += 'user_weapon.avg DESC,';
	else if (sort === 'type') sql += 'user_weapon.wid DESC, user_weapon.avg DESC,';
	else if (sort === 'equipped') sql += 'user_weapon.pid DESC,';
	else if (sort === 'favorite') sql += 'user_weapon.favorite DESC, user_weapon.avg DESC,';
	else if (sort === 'tt') sql += 'uwk.kills DESC,';
	else if (sort === 'wear') sql += 'user_weapon.wear DESC, user_weapon.avg DESC,';

	sql += ` user_weapon.uwid DESC
			LIMIT ${weaponPerPage}
			OFFSET ${page * weaponPerPage}) temp
		LEFT JOIN user_weapon_passive ON temp.uwid = user_weapon_passive.uwid
	;`;
	sql += `SELECT COUNT(uwid) as count FROM user
			INNER JOIN user_weapon ON user.uid = user_weapon.uid
		WHERE
			user.id = ${user.id} `;
	if (wid) {
		sql += `AND user_weapon.wid = ${wid} `;
	} else if (widList) {
		sql += `AND user_weapon.wid IN (${widList.join(',')}) `;
	}
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
	let descUser = `These weapons belong to <@${user.id}>`;
	let descHelp =
		'Description: `owo weapon {weaponID}`\nEquip: `owo weapon {weaponID} {animal}`\nUnequip: `owo weapon unequip {weaponID}`\nReroll: `owo w rr {weaponID} [passive|stat]`\nSell: `owo sell {weaponID|cw,rw,uw...}`\nDismantle: `owo dismantle {weaponID|cw,rw,uw...}`\n';
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
			row += `\n\`${user_weapons[key].uwid}\` ${emoji} ${
				weapon.favorite ? p.config.emoji.star : ''
			}**${weapon.fullName}** ${weapon.avgQuality}%`;
			if (user_weapons[key].animal.name) {
				let animal = p.global.validAnimal(user_weapons[key].animal.name);
				row += p.replaceMentions(
					` ➤  ${animal.uni ? animal.uni : animal.value} ${
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
			} else if (descUser.length + descHelp.length + desc.length + row.length >= 4096) {
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
	let title = p.getName(user) + "'s " + (wid ? weapons[wid].name : 'weapons');
	let embed = {
		author: {
			name: title,
			icon_url: user.avatarURL,
		},
		description: descUser + '\n' + descHelp + desc,
		color: p.config.embed_color,
		footer: {
			text: 'Page ' + (page + 1) + '/' + maxPage + ' | ',
		},
		fields,
	};

	if (sort === 'id') embed.footer.text += 'Sorting by id';
	else if (sort === 'rarity') embed.footer.text += 'Sorting by rarity';
	else if (sort === 'type') embed.footer.text += 'Sorting by type';
	else if (sort === 'equipped') embed.footer.text += 'Sorting by equipped';
	else if (sort === 'favorite') embed.footer.text += 'Sorting by favorited';
	else if (sort === 'tt') embed.footer.text += 'Sorting by takedown tracker';
	else if (sort === 'wear') embed.footer.text += 'Sorting by wear';

	embed = await alterWeapon.alter(p, user, embed, {
		...opt,
		page: page + 1,
		descHelp: descHelp,
		desc: desc,
		weapons: user_weapons_2,
		total: maxPage,
		sort: sort,
	});
	if (embed.embed) {
		embed = embed.embed;
	}

	embed = {
		embed,
		components: getDisplayComponents(maxPage > 19, sort, opt.widList),
	};

	return { sql, embed, totalCount, nextPage, prevPage, maxPage };
};

function getDisplayComponents(showExtraButtons, sort, widList = []) {
	const components = [
		{
			type: 1,
			components: [
				{
					type: 3,
					custom_id: 'sort',
					placeholder: 'Sort by...',
					options: [
						{
							label: 'Favorite',
							value: 'favorite',
							description: 'Sorty by favorited weapons',
							default: sort === 'favorite',
						},
						{
							label: 'Weapon ID',
							value: 'id',
							description: 'Sorty by weapon id',
							default: sort === 'id',
						},
						{
							label: 'Rarity',
							value: 'rarity',
							description: 'Sorty by weapon rarity',
							default: sort === 'rarity',
						},
						{
							label: 'Type',
							value: 'type',
							description: 'Sort by weapon type',
							default: sort === 'type',
						},
						{
							label: 'Equipped',
							value: 'equipped',
							description: 'Sort by equipped weapons',
							default: sort === 'equipped',
						},
						{
							label: 'Takedown Tracker',
							value: 'tt',
							description: 'Sort by takedown tracker kills',
							default: sort === 'tt',
						},
						{
							label: 'Wear',
							value: 'wear',
							description: 'Sort by wear',
							default: sort === 'wear',
						},
					],
				},
			],
		},
		{
			type: 1,
			components: [
				{
					type: 3,
					custom_id: 'filter',
					placeholder: 'Filter by...',
					min_values: 0,
					max_values: Math.min(Object.keys(WeaponInterface.weapons).length, 25),
					options: [],
				},
			],
		},
		{
			type: 1,
			components: [
				{
					type: 2,
					style: 1,
					custom_id: 'prev',
					emoji: {
						id: null,
						name: prevPageEmoji,
					},
				},
				{
					type: 2,
					style: 1,
					custom_id: 'next',
					emoji: {
						id: null,
						name: nextPageEmoji,
					},
				},
			],
		},
	];
	if (showExtraButtons) {
		components[2].components.unshift({
			type: 2,
			style: 1,
			custom_id: 'rewind',
			emoji: {
				id: null,
				name: rewindEmoji,
			},
		});
		components[2].components.push({
			type: 2,
			style: 1,
			custom_id: 'forward',
			emoji: {
				id: null,
				name: fastForwardEmoji,
			},
		});
	}

	for (let wid in WeaponInterface.weapons) {
		const weapon = new WeaponInterface.weapons[wid](null, null, true);
		const emoji = global.parseEmoji(weapon.defaultEmoji);
		components[1].components[0].options.push({
			label: weapon.name,
			value: weapon.id,
			emoji: {
				name: emoji.name,
				id: emoji.id,
			},
			default: widList.includes(weapon.id.toString()),
		});
	}

	return components;
}

exports.describe = async function (p, uwid) {
	uwid = expandUWID(uwid);

	let weapon = await this.getWeapon(uwid);

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
	let user = await p.fetch.getUser(weapon.userId);
	let username = 'A User';
	if (user) username = p.getUniqueName(user);

	/* Make description */
	let desc = `**Name:** ${weapon.name}\n`;
	desc += `**Owner:** ${username}\n`;
	desc += `**ID:** \`${shortenUWID(uwid)}\`\n`;
	desc += `**Sell Value:** ${weapon.unsellable ? 'UNSELLABLE' : prices[weapon.rank.name]}\n`;
	desc += `**Quality:** ${weapon.rank.emoji} ${weapon.avgQuality}%\n`;
	desc += `**Wear:** \`${weapon.wearName?.toUpperCase()}\`\n`;
	if (weapon.hasTakedownTracker) {
		desc += `**Kills:** \`${p.global.toFancyNum(weapon.kills)}\`\n`;
	}
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
			name: p.getName(user) + "'s " + weapon.fullName,
		},
		color: p.config.embed_color,
		thumbnail: {
			url: url,
		},
		description: desc,
		footer: {
			text: `Reroll Changes: ${weapon.rrCount} | Reroll Attempts: ${weapon.rrAttempt}`,
		},
	};
	if (user) {
		embed.author.icon_url = user.avatarURL;
		embed = alterWeaponDisplay.alter(user.id, embed, {
			user,
			weapon,
		});
	}

	if (user.id !== p.msg.author.id) {
		return p.send({ embed });
	}

	const components = [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: weapon.favorite ? 'Unfavorite' : 'Favorite',
					style: weapon.favorite ? 4 : 3,
					custom_id: weapon.favorite ? 'weapon_unfavorite' : 'weapon_favorite',
					emoji: {
						id: null,
						name: p.config.emoji.star,
					},
				},
			],
		},
	];
	const content = { embed, components };

	const msg = await p.send(content);

	let filter = (componentName, reactionUser) =>
		['weapon_favorite', 'weapon_unfavorite'].includes(componentName) &&
		[p.msg.author.id].includes(reactionUser.id);
	let collector = p.interactionCollector.create(msg, filter, {
		time: 900000,
		idle: 300000,
	});

	const uid = await p.global.getUid(user.id);
	collector.on('collect', async (component, _reactionMember, ack, _err) => {
		if (component === 'weapon_favorite') {
			let sql = `UPDATE user_weapon SET favorite = 1 WHERE uwid = ${weapon.ruwid} AND uid = ${uid}`;
			await p.query(sql);
			content.components[0].components[0].label = 'Unfavorite';
			content.components[0].components[0].custom_id = 'weapon_unfavorite';
			content.components[0].components[0].style = 4;
			ack(content);
		} else if (component === 'weapon_unfavorite') {
			let sql = `UPDATE user_weapon SET favorite = 0 WHERE uwid = ${weapon.ruwid} AND uid = ${uid}`;
			await p.query(sql);
			content.components[0].components[0].label = 'Favorite';
			content.components[0].components[0].custom_id = 'weapon_favorite';
			content.components[0].components[0].style = 3;
			ack(content);
		}
	});

	collector.on('end', async (_reason) => {
		content.embed.color = 6381923;
		content.content = 'This message is now inactive';
		content.components[0].components[0].disabled = true;
		await msg.edit(content);
	});
};

exports.equip = async function (p, uwid, pet) {
	const pid = await animalUtil.getPid(p.msg.author.id, pet);
	const uid = await p.global.getUid(p.msg.author.id);
	uwid = expandUWID(uwid);
	if (!uwid || !pid) {
		return;
	}

	let sql = `UPDATE user_weapon SET pid = NULL WHERE pid = ${pid} AND uid = ${uid};`;
	sql += `UPDATE user_weapon SET pid = ${pid} WHERE uid = ${uid} AND uwid = ${uwid};`;
	const con = await p.startTransaction();
	try {
		const result = await con.query(sql);
		if (result[1].changedRows <= 0 && result[1].affectedRows <= 0) {
			await con.rollback();
			return;
		}
		await con.commit();
	} catch (err) {
		con.rollback();
		return;
	}

	const { animal, nickname, weapon } =
		(await teamUtil.getBattleAnimal({ uwid }, p.msg.author.id)) || {};
	if (!animal || !weapon) {
		return;
	}

	p.replyMsg(
		weaponEmoji,
		p.replaceMentions(
			`, ${animal.value} **${nickname}** is now wielding ${weapon.emoji} **${weapon.name}**!`
		)
	);
	return true;
};

exports.unequip = async function (p, uwid) {
	uwid = expandUWID(uwid);
	if (!uwid) {
		p.errorMsg(', Could not find a weapon with that id!');
		return;
	}
	const { animal, nickname, weapon, error } =
		(await teamUtil.getBattleAnimal({ uwid }, p.msg.author.id)) || {};

	if (error || !animal || !weapon) {
		if (error?.weapon) {
			p.errorMsg(', this weapon is not equipped on anyone!');
		} else {
			p.errorMsg(', Could not find a weapon with that id!');
		}
		return;
	}

	const uid = await p.global.getUid(p.msg.author.id);
	let sql = `UPDATE IGNORE user_weapon SET pid = NULL WHERE uwid = ${uwid} AND uid = ${uid};`;
	await p.query(sql);

	p.replyMsg(
		weaponEmoji,
		p.replaceMentions(
			`, Unequipped ${weapon.emoji} **${weapon.name}** from ${animal.value} **${nickname}**`
		)
	);
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
	const weapon = await this.getWeapon(uwid, p.msg.author.id);

	/* not a real weapon! */
	if (!weapon) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* If an animal is using the weapon */
	if (weapon.animal?.name) {
		p.errorMsg(', please unequip the weapon to sell it!', 3000);
		return;
	}

	/* Is this weapon sellable? */
	if (weapon.unsellable) {
		p.errorMsg(', This weapon cannot be sold!');
		return;
	}

	if (weapon.favorite) {
		p.errorMsg(', unfavorite this weapon to sell!');
		return;
	}

	/* Get weapon price */
	let price = prices[weapon.rank.name];
	if (!price) {
		p.errorMsg(', Something went terribly wrong...');
		return;
	}

	let sql = `DELETE user_weapon_passive FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE id = ${p.msg.author.id}
			AND user_weapon_passive.uwid = ${uwid}
			AND user_weapon.pid IS NULL;`;
	sql += `DELETE user_weapon_kills FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		LEFT JOIN user_weapon_kills ON user_weapon.uwid = user_weapon_kills.uwid
		WHERE id = ${p.msg.author.id}
			AND user_weapon_kills.uwid = ${uwid}
			AND user_weapon.pid IS NULL;`;
	sql += `DELETE user_weapon FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		WHERE id = ${p.msg.author.id}
			AND user_weapon.uwid = ${uwid}
			AND user_weapon.pid IS NULL;`;

	let result = await p.query(sql);

	/* Check if deleted */
	if (result[2].affectedRows == 0) {
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
	let lastRank = rankLoc == WeaponInterface.ranks.length - 1;

	/* Grab the item we will sell */
	let sql = `SELECT
			a.uwid, a.wid, a.stat, a.rrcount, a.rrattempt, a.wear,
			b.pcount, b.wpid, b.stat as pstat,
			c.uwid as tt, c.kills
		FROM user
			LEFT JOIN user_weapon a ON user.uid = a.uid
			LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid
			LEFT JOIN user_weapon_kills c ON a.uwid = c.uwid
		WHERE user.id = ${p.msg.author.id} AND avg >${min === 0 ? '=' : ''} ${min} ${
		lastRank ? '' : `AND avg <= ${max}`
	} AND a.pid IS NULL AND a.favorite != 1 LIMIT 500;`;

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
	sql += `DELETE user_weapon_kills FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		LEFT JOIN user_weapon_kills ON user_weapon.uwid = user_weapon_kills.uwid
		WHERE id = ${p.msg.author.id}
			AND user_weapon_kills.uwid IN ${weaponsSQL}
			AND user_weapon.pid IS NULL;`;
	sql += `DELETE user_weapon FROM user
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid
		WHERE id = ${p.msg.author.id}
			AND user_weapon.uwid IN ${weaponsSQL}
			AND user_weapon.pid IS NULL;`;

	result = await p.query(sql);

	/* Check if deleted */
	if (result[2].affectedRows == 0) {
		p.errorMsg(', you do not have a weapon with this id!', 3000);
		return;
	}

	/* calculate rewards */
	price *= result[2].affectedRows;

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

exports.getWeapon = async function (uwid, id) {
	if (!uwid) {
		return null;
	}

	/* sql query */
	let sql = `SELECT
				user.id,
				a.uwid, a.wid, a.stat, a.wear, a.rrcount, a.rrattempt, a.pid, a.favorite,
				b.pcount, b.wpid, b.stat as pstat,
				c.uwid as tt, c.kills,
				d.name, d.nickname
			FROM user
				INNER JOIN user_weapon a ON user.uid = a.uid
				LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid
				LEFT JOIN user_weapon_kills c ON a.uwid = c.uwid
				LEFT JOIN animal d ON a.pid = d.pid
			WHERE a.uwid = ${uwid}`;
	if (id) {
		sql += ` AND user.id = ${id}`;
	}
	let result = await mysql.query(sql);

	/* Check if valid */
	if (!result[0]) {
		return null;
	}

	/* parse weapon to get info */
	let weapon = this.parseWeaponQuery(result);
	weapon = weapon[Object.keys(weapon)[0]];
	weapon = this.parseWeapon(weapon);
	return weapon;
};
