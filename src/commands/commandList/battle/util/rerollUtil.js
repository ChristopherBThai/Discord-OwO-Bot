/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const weaponUtil = require('./weaponUtil.js');
const passiveArray = ['passive', 'p'];
const statArray = ['stat', 'stats', 's'];
const yesEmoji = '✅';
const noEmoji = '❎';
const retryEmoji = '🔄';
const rerollPrice = 100;
const shardEmoji = '<:weaponshard:655902978712272917>';

exports.reroll = async function (p) {
	// Parse argments
	let args = parseArgs(p);
	if (!args) return;
	let { rrType, uwid } = args;

	// Grab weapon
	let weapon = await getWeapon(p, uwid);
	if (!weapon) return;

	// Check if enough shards
	if (!(await useShards(p))) {
		p.errorMsg(
			', you need ' + rerollPrice + ' ' + shardEmoji + ' Weapon Shards to reroll a weapon!',
			4000
		);
		return;
	}

	// Get rerolled weapon
	let newWeapon = fetchNewWeapon(p, weapon, rrType);

	// Send message
	await sendMessage(p, weapon, newWeapon, rrType);
};

async function applyChange(p, weapon) {
	let uwid = weapon.ruwid;
	let stat = weapon.sqlStat;
	let avg = weapon.avgQuality;
	let sql = `UPDATE user_weapon SET stat = '${stat}', avg = ${avg} WHERE uwid = ${uwid};`;
	for (let i in weapon.passives) {
		let passive = weapon.passives[i];
		let stat = passive.sqlStat;
		let pcount = passive.pcount;
		let wpid = passive.id;
		sql += `UPDATE user_weapon_passive SET stat = '${stat}', wpid = ${wpid} WHERE uwid = ${uwid} AND pcount = ${pcount};`;
	}

	let result = await p.query(sql);
	for (let i in result) {
		if (result[i].affectedRows <= 0) return false;
	}
	return true;
}

function parseArgs(p) {
	/* Parse reroll type and weapon id */
	let rrType, uwid;
	if (passiveArray.includes(p.args[1]?.toLowerCase())) {
		rrType = 'p';
		uwid = p.args[2];
	} else if (passiveArray.includes(p.args[2]?.toLowerCase())) {
		rrType = 'p';
		uwid = p.args[1];
	} else if (statArray.includes(p.args[1]?.toLowerCase())) {
		rrType = 's';
		uwid = p.args[2];
	} else if (statArray.includes(p.args[2]?.toLowerCase())) {
		rrType = 's';
		uwid = p.args[1];
	} else {
		p.errorMsg(
			', invalid syntax! Please use the format: `owo w rr {weaponID} [passive|stat]`!',
			5000
		);
		return;
	}

	/* Convert uwid into decimal */
	uwid = weaponUtil.expandUWID(uwid);
	if (!uwid) {
		p.errorMsg(
			', invalid syntax! Please use the format: `owo w rr {weaponID} [passive|stat]`!',
			5000
		);
		return;
	}
	return { rrType, uwid };
}

async function getWeapon(p, uwid) {
	/* Grab weapon from database */
	let sql = `SELECT user.uid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user INNER JOIN user_weapon a ON user.uid = a.uid LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid WHERE a.uwid = ${uwid} AND user.id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	/* Check if valid */
	if (!result[0]) {
		p.errorMsg(', I could not find a weapon with that unique weapon id!', 4000);
		return;
	}

	/* Parse weapon to get info */
	let weapon = weaponUtil.parseWeaponQuery(result);
	weapon = weapon[Object.keys(weapon)[0]];
	weapon = weaponUtil.parseWeapon(weapon);

	/* If no weapon */
	if (!weapon) {
		p.errorMsg(
			', I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!',
			4000
		);
		return;
	} else if (weapon.unsellable) {
		p.errorMsg(", I can't reroll this weapon!", 4000);
		return;
	}

	return weapon;
}

async function sendMessage(p, oldWeapon, newWeapon, rrType, msg) {
	let embed = createEmbed(p, oldWeapon, newWeapon);
	if (!msg) {
		/* send and construct reaction collector */
		msg = await p.send({ embed });
		await msg.addReaction(yesEmoji);
		await msg.addReaction(noEmoji);
		await msg.addReaction(retryEmoji);
	} else {
		msg.edit({ embed });
	}

	let filter = (emoji, userID) =>
		[yesEmoji, noEmoji, retryEmoji].includes(emoji.name) && p.msg.author.id == userID;
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 300000,
	});

	collector.on('collect', async (emoji) => {
		collector.stop('clicked');
		if (emoji.name === yesEmoji) {
			if (await applyChange(p, newWeapon)) {
				embed.color = 65280;
				msg.edit({ embed });
			} else {
				embed.color = 16711680;
				msg.edit({
					content: 'Failed to change weapon stats! Please contact Scuttler#0001',
					embed,
				});
			}
		} else if (emoji.name === noEmoji) {
			embed.color = 16711680;
			msg.edit({ embed });
		} else if (emoji.name === retryEmoji) {
			if (!(await useShards(p))) {
				embed.color = 16711680;
				msg.edit({
					content: "You don't have enough " + shardEmoji + ' Weapon Shards!',
					embed,
				});
			} else {
				newWeapon = fetchNewWeapon(p, oldWeapon, rrType);
				sendMessage(p, oldWeapon, newWeapon, rrType, msg);
			}
		}
	});

	collector.on('end', async function (reason) {
		if (reason != 'clicked') {
			embed.color = 6381923;
			await msg.edit({ content: 'This message is now inactive', embed });
		}
	});
}

async function useShards(p) {
	/* check if enough shards */
	let sql = `UPDATE shards INNER JOIN user ON shards.uid = user.uid SET shards.count = shards.count - ${rerollPrice} WHERE user.id = ${p.msg.author.id} AND shards.count >= ${rerollPrice};`;
	let result = await p.query(sql);
	if (result.changedRows >= 1) {
		p.logger.decr('shards', -1 * rerollPrice, { type: 'reroll' }, p.msg);
		return true;
	}
	return false;
}

function fetchNewWeapon(p, weapon, type) {
	/* Get new weapon */
	let newWeapon;
	if (type == 'p') newWeapon = weapon.rerollPassives();
	else if (type == 's') newWeapon = weapon.rerollStats();
	else p.errorMsg(', It seems like javascript broke.. This should never happen!', 3000);
	newWeapon.uwid = weapon.uwid;
	newWeapon.ruwid = weapon.ruwid;
	for (let i in weapon.passives) {
		newWeapon.passives[i].pcount = weapon.passives[i].pcount;
	}
	return newWeapon;
}

function createEmbed(p, oldWeapon, newWeapon) {
	const embed = {
		author: {
			name: p.msg.author.username + ' spent ' + rerollPrice + ' Weapon Shards to reroll!',
			icon_url: p.msg.author.dynamicAvatarURL(),
		},
		footer: {
			text:
				yesEmoji +
				' to keep the changes | ' +
				noEmoji +
				' to discard the changes | ' +
				retryEmoji +
				' to try again',
		},
		color: p.config.embed_color,
		fields: [parseDescription('OLD WEAPON', oldWeapon), parseDescription('NEW WEAPON', newWeapon)],
	};

	embed.fields[0].value += '\n‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗';
	return embed;
}

function parseDescription(title, weapon) {
	let desc = `**ID:** \`${weapon.uwid}\`\n`;
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
	return { name: weapon.emoji + ' **' + title + '**', value: desc };
}
