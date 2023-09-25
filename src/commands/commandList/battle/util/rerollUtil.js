/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const weaponUtil = require('./weaponUtil.js');
const global = require('../../../../utils/global.js');
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

	if (weapon.disableRR) {
		p.errorMsg(', you cannot reroll this weapon!', 3000);
		return;
	}

	// Check if enough shards
	if (!(await useShards(p))) {
		p.errorMsg(
			', you need ' + rerollPrice + ' ' + shardEmoji + ' Weapon Shards to reroll a weapon!',
			4000
		);
		return;
	}

	// Update rr attempt
	await updateRRAttempt(p, weapon);

	// Get rerolled weapon
	let newWeapon = fetchNewWeapon(p, weapon, rrType);

	// Send message
	await sendMessage(p, weapon, newWeapon, rrType);
};

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
	const weapon = weaponUtil.getWeapon(uwid, p.msg.author.id);

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

async function sendMessage(p, oldWeapon, newWeapon, rrType, msg, ack) {
	let content = createContent(p, oldWeapon, newWeapon);
	if (!msg) {
		/* send and construct reaction collector */
		msg = await p.send(content);
	} else {
		ack(content);
	}

	let filter = (componentName, reactionUser) =>
		['rr_confirm', 'rr_cancel', 'rr_reroll'].includes(componentName) &&
		[p.msg.author.id].includes(reactionUser.id);
	let collector = p.interactionCollector.create(msg, filter, {
		time: 900000,
		idle: 300000,
	});

	collector.on('collect', async (component, _reactionMember, ack, _err) => {
		collector.stop('clicked');
		if (component === 'rr_confirm') {
			content.components[0].components[0].disabled = true;
			content.components[0].components[1].disabled = true;
			content.components[0].components[2].disabled = true;
			if (await newWeapon.update()) {
				content.embed.color = 65280;
				delete content.content;
				ack(content);
			} else {
				content.embed.color = 16711680;
				content.content = 'Failed to change weapon stats! Please contact Scuttler#0001';
				ack(content);
			}
		} else if (component == 'rr_cancel') {
			content.components[0].components[0].disabled = true;
			content.components[0].components[1].disabled = true;
			content.components[0].components[2].disabled = true;
			content.embed.color = 16711680;
			delete content.content;
			ack(content);
		} else if (component == 'rr_reroll') {
			if (!(await useShards(p))) {
				content.embed.color = 16711680;
				content.content = `You don't have enough ${shardEmoji} Weapon Shards!`;
				ack(content);
			} else {
				await updateRRAttempt(p, oldWeapon);
				newWeapon = fetchNewWeapon(p, oldWeapon, rrType);
				sendMessage(p, oldWeapon, newWeapon, rrType, msg, ack);
			}
		}
	});

	collector.on('end', async function (reason) {
		if (reason != 'clicked') {
			content.components[0].components[0].disabled = true;
			content.components[0].components[1].disabled = true;
			content.components[0].components[2].disabled = true;
			content.embed.color = 6381923;
			content.content = 'This message is now inactive';
			await msg.edit(content);
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

function createContent(p, oldWeapon, newWeapon) {
	const embed = {
		author: {
			name: p.getName() + ' spent ' + rerollPrice + ' Weapon Shards to reroll!',
			icon_url: p.msg.author.dynamicAvatarURL(),
		},
		footer: {
			text: `Reroll Changes: ${newWeapon.rrCount} | Reroll Attempts: ${newWeapon.rrAttempt}`,
		},
		color: p.config.embed_color,
		fields: [parseDescription('[CURRENT]', oldWeapon), parseDescription('[NEW]', newWeapon)],
	};
	embed.fields[0].value += '\n‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗';
	embed.fields[1].value += `\n${p.config.emoji.blank}`;
	if (oldWeapon.wear.id != newWeapon.wear.id) {
		embed.description = `# ${p.config.emoji.warning} Your wear will change from \`${oldWeapon.wearName}\` to \`${newWeapon.wearName}\` ${p.config.emoji.warning}\n${p.config.emoji.blank}`;
	} else {
		embed.description = p.config.emoji.blank;
	}

	const components = [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: 'Confirm',
					style: 3,
					custom_id: 'rr_confirm',
					emoji: {
						id: null,
						name: yesEmoji,
					},
				},
				{
					type: 2,
					label: 'Cancel',
					style: 4,
					custom_id: 'rr_cancel',
					emoji: {
						id: null,
						name: noEmoji,
					},
				},
				{
					type: 2,
					label: 'Reroll',
					style: 2,
					custom_id: 'rr_reroll',
					emoji: {
						id: null,
						name: retryEmoji,
					},
				},
			],
		},
	];
	return { embed, components };
}

function parseDescription(title, weapon) {
	let desc = `**ID:** \`${weapon.uwid}\`\n`;
	desc += `**Quality:** ${weapon.rank.emoji} ${weapon.avgQuality}%\n`;
	desc += `**Wear:** \`${weapon.wearName?.toUpperCase()}\`\n`;
	if (weapon.hasTakedownTracker) {
		desc += `**Kills:** \`${global.toFancyNum(weapon.kills)}\`\n`;
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
	return { name: `${weapon.emoji} **${title}** ${weapon.fullName}`, value: desc };
}

async function updateRRAttempt(p, weapon) {
	const sql = `UPDATE user_weapon SET rrattempt = rrattempt + 1 WHERE uwid = ${weapon.ruwid};`;
	await p.query(sql);
	weapon.rrAttempt++;
}
