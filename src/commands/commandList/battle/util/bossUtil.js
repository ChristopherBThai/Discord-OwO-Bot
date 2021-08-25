/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const WeaponInterface = require('../WeaponInterface.js');
const teamUtil = require('./teamUtil.js');
const animalUtil = require('./animalUtil.js');
const bossCreatorUtil = require('./bossCreatorUtil.js');
const bossImageUtil = require('./bossImageUtil.js');
const battleUtil = require('./battleUtil.js');

const maxTickets = 3;

exports.check = async function (p) {
	if (!await bossCreatorUtil.shouldCreateBoss(p)) return;

	const boss = await bossCreatorUtil.createBoss(p);

	const contents = await createEmbed(p, boss);

	const msg = await p.send(contents);
	addInteractionCollector(p, msg, contents, boss);
}

exports.display = async function (p) {
	const boss = await bossCreatorUtil.fetchBoss(p);
	if (!boss) {
		return await p.errorMsg(", there is no boss available!", 5000);
	}
	const users = await fetchParticipants(p);

	const contents = await createEmbed(p, boss)
	const msg = await p.send(contents);
	addInteractionCollector(p, msg, contents, boss);
}

async function createEmbed (p, boss, title) {
	let { lvl, animal, weapon, stats, time, rank } = boss;

	const embed = {
		title: title || "A boss appears!",
		description: "Fight the boss with `owo boss fight`!",
		color: p.config.embed_color,
		timestamp: time,
		fields: [],
		footer: {
			text: "⚠️ The boss will run away in one hour!"
		},
		thumbnail: ""
	};

	embed.description += `\n**\`\`Lvl ${lvl}\`\`** R ${animal.value}   ${weapon.emoji}`;
	const passiveEmojis = weapon.passives.map(passive => passive.emoji);
	if (passiveEmojis) embed.description += ` ${passiveEmojis.join(' ')}`;
	const hp = stats.hp[1]+stats.hp[3];
	const att = stats.att[0]+stats.att[1];
	const pr = WeaponInterface.resToPrettyPercent(stats.pr);
	const wp = stats.wp[1]+stats.wp[3];
	const mag = stats.mag[0]+stats.mag[1];
	const mr = WeaponInterface.resToPrettyPercent(stats.mr);
	embed.description += `\n<:hp:531620120410456064> \`${hp}\` <:att:531616155450998794> \`${att}\` <:pr:531616156222488606> \`${pr}\` `;
	embed.description += `\n<:wp:531620120976687114> \`${wp}\` <:mag:531616156231139338> \`${mag}\` <:mr:531616156226945024> \`${mr}\` `;

	const uuid = await bossImageUtil.fetchBossImage(boss);
	if(uuid&&uuid!="") {
		embed.image = {
			url: `${process.env.IMAGE_GEN_URL}/img/${uuid}.png`
		}
	}

	let components = [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: "Fight!",
					style: 3,
					custom_id: "fight",
					emoji: {
						id: "878871063273017356",
						name: "bticket" 
					}
				}
			]
		}
	]

	return { embed, components };
}

async function addInteractionCollector (p, msg, contents, boss) {
	let filter = (componentName, user) => componentName === 'fight';
	let collector = p.interactionCollector.create(msg, filter, { idle: 90000 });

	collector.on('collect', async (component, user, ack) => {
		try {
			contents = await fight(p, msg, user, boss);
			await ack(contents);
		} catch (err) {
			if (typeof err == "string") {
				collector.stop({ msg: err, ack });
			} else {
				console.error(err);
			}
		}
	});

	collector.on('end', async (reason) => {
		if (contents.embeds) {
			contents.embeds[0].color = 6381923;
		} else {
			contents.embed.color = 6381923;
		}
		contents.components[0].components[0].disabled = true;
		contents.content = reason?.msg || `This message is now inactive.`;
		try {
			reason?.ack ? reason.ack(contents) : msg.edit(contents);
		} catch (err) {
			console.error(`[${msg.id}] Could not edit message`);
		}
	});
	
}

async function fight (p, msg, user, boss) {
	currentBoss = await bossCreatorUtil.fetchBoss(p);

	if (!currentBoss || boss.time.getTime() !== currentBoss.time.getTime()) {
		throw "Boss doesn't exist or is already dead";
	}

	if (!await consumeTicket(p, user)) {
		return await createEmbed (p, currentBoss, `${user.username}, you do not have any ${p.config.emoji.boss_ticket} boss tickets!`);
	}

	const users = await fetchParticipants(p);
	const player = await fetchPlayer(p, user);

	const battle = {
		player,
		enemy: {
			name: 'Boss',
			team: [ currentBoss ]
		}
	}

	const prevHp = currentBoss.stats.hp[0];
	const prevWp = currentBoss.stats.wp[0];

	let logs = await battleUtil.calculateAll(p, battle);

	const currentHp = logs[logs.length-2].enemy[0].hp[0];
	const currentWp = logs[logs.length-2].enemy[0].wp[0];
	const hpChange = Math.round(prevHp - currentHp);
	const wpChange = Math.round(prevWp - currentWp);

	await updateBoss(p, {boss: currentBoss, users, hpChange, wpChange });

	return await createEmbed (p, currentBoss, `${user.username} did ${hpChange} dmg!`);
}

async function fetchPlayer (p, user) {
	let sqlTeam = await teamUtil.getTeam(p, user.id);
	let pgid = sqlTeam[0][0] ? sqlTeam[0][0].pgid : undefined;
	if(!pgid) return undefined;

	let team = teamUtil.parseTeam(p, sqlTeam[0], sqlTeam[1]);
	for(let i in team) animalUtil.stats(team[i]);

	return {
		pgid: pgid,
		name: sqlTeam[0].tname,
		streak: sqlTeam[0].streak,
		highestStreak: sqlTeam[0].highest_streak,
		team: team
	};
}

async function fetchParticipants (p) {
	let sql = `SELECT u.id, ub.total_dmg
		FROM	user_boss ub
			INNER JOIN user u ON ub.uid = u.uid
		WHERE ub.gid = ${p.msg.channel.guild.id};`;
	let result = await p.query(sql);
	return [];
}

async function updateBoss (p, {boss, hpChange, wpChange }) {
	if (hpChange == 0 || wpChange == 0) {
		// TODO no update, do nothing
	}
	const guildId = p.msg.channel.guild.id;

	const con = await p.startTransaction();
	try {
		// TODO add total dmg dealt
		let sql = `UPDATE guild_boss
			SET
				boss_hp = GREATEST(0, boss_hp - ${hpChange}),
				boss_wp = GREATEST(0, boss_wp - ${wpChange})
			WHERE gid = ${guildId} AND boss_hp > 0;`;
		sql += `SELECT boss_hp FROM guild_boss WHERE gid = ${guildId};`;
		let result = await con.query(sql);

		if (!result[0].changedRows) {
			await con.rollback();
			p.errorMsg(", the boss is no longer available!", 3000);
			return;
		}

		if (result[1][0].boss_hp <= 0) {
			//TODO boss is dead. do a check and distribute rewards
			await con.query(`UPDATE guild_boss SET active = 0 WHERE gid = ${guildId}`);
			console.log("boss died");
			await con.commit();
			return;
		}

		await con.commit();
	} catch (err) {
		console.error(err);
		await con.rollback();
		p.errorMsg(", the boss is no longer available!", 3000);
		return;
	}
}

async function consumeTicket (p, user) {
	// TODO REMOVE
	return true;
	const con = await p.startTransaction();
	try {
		let sql = `SELECT user.uid, boss_ticket.count FROM user LEFT JOIN boss_ticket ON boss_ticket.uid = user.uid WHERE user.id = ${user.id}`;
		let result = await con.query(sql);
		let uid;

		// Grab user uid
		if (!result) {
			uid = await p.global.createUser(user.id);
		} else {
			uid = result[0].uid;
		}

		// If there is no database row...
		if (!result || result[0].count === null) {
			sql = `INSERT INTO boss_ticket (uid, count) VALUES (${uid}, ${maxTickets - 1})`;
			await con.query(sql);

		// If user has no tickets left
		} else if (result && result[0].count <= 0) {
			con.rollback();
			return false;

		// User has tickets, remove one.
		} else {
			sql = `UPDATE boss_ticket SET count = count - 1 WHERE count > 0 AND uid = ${uid};`;
			result = await con.query(sql);
			if (result.changedRows <= 0) {
				con.rollback();
				return false;
			}
		}

		con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		return false;
	}

	return true;
}
