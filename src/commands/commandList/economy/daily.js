/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const alterDaily = require('../patreon/alterDaily.js');
const patreonUtil = require('../patreon/utils/patreonUtil.js');

/*
 * Daily command.
 * Users can claim a daily once per day after midnight
 */

const levels = require('../../../utils/levels.js');
const rings = require('../../../data/rings.json');
const moneyEmoji = '💰';
const surveyEmoji = '📝';
const valEmoji = '💌';

module.exports = new CommandInterface({
	alias: ['daily'],

	args: '',

	desc: 'Grab your daily cowoncy every day after 12am PST! Daily streaks will give you extra cowoncy!',

	example: [],

	related: ['owo money'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['economy'],

	cooldown: 5000,
	half: 100,
	six: 500,
	bot: true,

	execute: async function (p) {
		const uid = await p.global.getUid(p.msg.author.id);
		const { cowoncy, showAnnouncement, marriage, showSurvey } = await getUserInfo(p, uid);
		const afterMid = p.dateUtil.afterMidnight(cowoncy?.daily);

		if (!cowoncy) {
			await p.query(
				`INSERT IGNORE INTO user (id, count) VALUES (${p.msg.author.id}, 0); INSERT IGNORE INTO cowoncy (id, money) VALUES (${p.msg.author.id}, 0);`
			);
		}

		// If it's not past midnight
		if (afterMid && !afterMid.after) {
			/* double check marriage */
			await doubleCheckMarriage(p, afterMid, marriage, cowoncy);

			// Past midnight
		} else {
			const generalRewards = await getRewards(p, cowoncy, afterMid);
			const boxRewards = getRandomBox(p, uid);
			const marriageRewards = await checkMarriage(p, marriage);

			const { sql, text, alterInfo } = finalizeText(
				p,
				uid,
				generalRewards,
				boxRewards,
				marriageRewards,
				showAnnouncement,
				showSurvey,
				afterMid
			);
			const cowoncySql = `UPDATE cowoncy SET money = money + ${
				generalRewards.gain + generalRewards.extra
			}, daily_streak = ${generalRewards.streak}, daily = ${afterMid.sql} WHERE id = ${
				p.msg.author.id
			} ${cowoncy ? ` AND daily_streak = ${cowoncy.daily_streak}` : ''} ;`;

			await executeQuery(
				p,
				cowoncySql,
				sql,
				text,
				showAnnouncement && cowoncy,
				showSurvey,
				generalRewards,
				alterInfo
			);
		}
	},
});

function finalizeText(
	p,
	uid,
	{ streak, gain, extra },
	boxRewards,
	marriageRewards,
	showAnnouncement,
	showSurvey,
	afterMid
) {
	let alterInfo = {
		user: p.msg.author,
		amount: gain,
		streak: 0,
	};
	let sql = '';

	if (showAnnouncement) {
		sql += 'SELECT * FROM announcement ORDER BY aid DESC LIMIT 1;';
		sql += `INSERT INTO user_announcement (uid, aid) VALUES (${uid}, (SELECT aid FROM announcement ORDER BY aid DESC LIMIT 1)) ON DUPLICATE KEY UPDATE aid = (SELECT aid FROM announcement ORDER BY aid DESC LIMIT 1);`;
		alterInfo.announcement = true;
	}

	let text = `${moneyEmoji} **| ${p.getName()}**, Here is your daily **<:cowoncy:416043450337853441> ${gain} Cowoncy**!`;

	if (streak - 1 > 0) {
		text += `\n${p.config.emoji.blank} **|** You're on a **${streak - 1} daily streak**!`;
		alterInfo.streak = streak - 1;
	}
	if (extra > 0) {
		text += `\n${p.config.emoji.blank} **|** You got an extra **${extra} Cowoncy** for being a <:patreon:449705754522419222> Patreon!`;
		alterInfo.amount += extra;
	}

	if (boxRewards) {
		text += boxRewards.text;
		sql += boxRewards.sql;
		alterInfo.box_emoji = boxRewards.emoji;
		alterInfo.box_name = boxRewards.name;
	}

	if (marriageRewards) {
		sql += marriageRewards.sql;
		text += marriageRewards.text;
		alterInfo.marriage = true;
		alterInfo = { ...alterInfo, ...marriageRewards.alterInfo };
	}

	if (showSurvey) {
		sql += `INSERT INTO user_survey (uid, sid)
			VALUES (${uid}, (SELECT sid FROM survey ORDER BY sid DESC LIMIT 1))
			ON DUPLICATE KEY UPDATE
				sid = (SELECT sid FROM survey ORDER BY sid DESC LIMIT 1),
				question_number = 1,
				in_progress = 0;`;
		const surveyText = `${surveyEmoji} **|** You have a survey available! Answer some questions for some cool rewards!`;
		alterInfo.surveyText = surveyText;
		text += '\n' + surveyText;
	}

	const time = `${afterMid.hours}H ${afterMid.minutes}M ${afterMid.seconds}S`;
	alterInfo.cooldown = time;
	text += `\n**⏱️ |** Your next daily is in: ${time}`;

	return { sql, text, alterInfo };
}

async function executeQuery(
	p,
	cowoncySql,
	sql,
	text,
	showAnnouncement,
	showSurvey,
	{ gain, extra },
	alterInfo
) {
	let rows = await p.query(cowoncySql);

	if (!rows.changedRows) {
		return p.errorMsg(', you already claimed your daily!');
	}

	rows = await p.query(sql);
	p.logger.incr('cowoncy', gain + extra, { type: 'daily' }, p.msg);

	let embed, components;
	if (showAnnouncement && rows[0][0].url) {
		embed = {
			image: { url: rows[0][0].url },
			color: p.config.embed_color,
			timestamp: new Date(rows[0][0].adate),
		};
	}
	if (showSurvey) {
		components = [
			{
				type: 1,
				components: [
					{
						type: 2,
						label: 'Answer Survey',
						style: 1,
						custom_id: 'survey',
						emoji: {
							id: null,
							name: surveyEmoji,
						},
					},
				],
			},
		];
	}
	let alterText = await alterDaily.alter(p, alterInfo);
	if (alterText) {
		if (typeof alterText === 'string') {
			alterText = {
				content: alterText,
			};
		}
		if (components) {
			alterText.components = components;
		}
		p.send(alterText);
		if (showAnnouncement) {
			p.send({ embed });
		}
	} else {
		p.send({ content: text, embed, components });
	}

	levels.giveUserXP(p.msg.author.id, 100);
}

async function getUserInfo(p, uid) {
	let sql = `SELECT
				daily,
				daily_streak
			FROM cowoncy
			WHERE id = ${p.msg.author.id};`;
	sql += `SELECT *
			FROM user_announcement
			WHERE
				uid = ${uid}
				AND (
					aid = (SELECT aid FROM announcement ORDER BY aid DESC limit 1)
					OR disabled = 1
				);`;
	sql += `SELECT 
				u1.id AS id1, c1.daily AS daily1, c1.daily_streak AS streak1,
				u2.id AS id2, c2.daily AS daily2, c2.daily_streak AS streak2,
				marriage.* 
			FROM marriage 
				LEFT JOIN user AS u1 ON marriage.uid1 = u1.uid 
					LEFT JOIN cowoncy AS c1 ON c1.id = u1.id
				LEFT JOIN user AS u2 ON marriage.uid2 = u2.uid 
					LEFT JOIN cowoncy AS c2 ON c2.id = u2.id
				LEFT JOIN user AS temp ON marriage.uid1 = temp.uid OR marriage.uid2 = temp.uid
			WHERE temp.id = ${p.msg.author.id};`;
	sql += `SELECT *
			FROM user_survey
			WHERE
				uid = ${uid}
				AND (
					in_progress = 1
					OR (
						sid = (SELECT sid FROM survey ORDER BY sid DESC limit 1)
						AND is_done = 1
					)
				);`;
	sql += 'SELECT sid FROM survey WHERE endDate > NOW() ORDER BY sid DESC limit 1';
	const rows = await p.query(sql);

	return {
		cowoncy: rows[0][0],
		showAnnouncement: !rows[1][0],
		marriage: rows[2][0],
		showSurvey: rows[4][0] ? !rows[3][0] : false,
	};
}

async function doubleCheckMarriage(p, afterMid, marriage, cowoncy) {
	// Exists in database?
	if (marriage && marriage.daily1 && marriage.daily2) {
		const afterMid = p.dateUtil.afterMidnight(marriage.claimDate);

		if (afterMid.after) {
			const u1Date = p.dateUtil.afterMidnight(marriage.daily1);
			const u2Date = p.dateUtil.afterMidnight(marriage.daily2);

			if (!u1Date.after && !u2Date.after) {
				const totalGain = calculateMarriageBonus(p, marriage);
				let sql = `UPDATE marriage SET claimDate = ${afterMid.sql}, dailies = dailies + 1 WHERE uid1 = ${marriage.uid1} AND uid2 = ${marriage.uid2} AND dailies = ${marriage.dailies};`;
				const result = await p.query(sql);

				if (result.changedRows) {
					const so =
						p.msg.author.id == marriage.id1
							? await p.fetch.getUser(marriage.id2)
							: await p.fetch.getUser(marriage.id1);
					const ring = rings[marriage.rid];
					let text = `${ring.emoji} **|** You and ${so ? so.username : 'your partner'} received ${
						p.config.emoji.cowoncy
					} **${totalGain} Cowoncy** and `;

					sql = `UPDATE cowoncy SET money = money + ${totalGain} WHERE id IN (${marriage.id1}, ${marriage.id2});`;

					let count = 1;
					if (p.event.isValentines()) {
						const item = {};
						if (Math.random() < 0.5) {
							sql += `INSERT INTO crate (uid, boxcount) VALUES
										(${marriage.uid1}, 1), (${marriage.uid2}, 1)
									ON DUPLICATE KEY UPDATE
										boxcount = boxcount + 1;`;
							item.emoji = p.config.emoji.crate;
							item.name = 'Weapon Crate';
						} else {
							sql += `INSERT INTO lootbox (id, boxcount) VALUES
										(${marriage.id1}, 1), (${marriage.id2}, 1)
									ON DUPLICATE KEY UPDATE
										boxcount = boxcount + 1;`;
							item.emoji = p.config.emoji.lootbox;
							item.name = 'Lootbox';
						}
						text =
							`${valEmoji} **|** Happy Valentines! You got a ${item.emoji} **${item.name}** for being so cute together! <3\n` +
							text;
						count += 1;
					}
					if (Math.random() < 0.5) {
						sql += `INSERT INTO lootbox (id, boxcount, claimcount, claim) VALUES (${marriage.id2}, ${count}, 0, '2017-01-01'), (${marriage.id2}, ${count}, 0, '2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${count};`;
						if (count > 1) {
							text += `${p.config.emoji.lootbox} **${count} lootboxes**!`;
						} else {
							text += `a ${p.config.emoji.lootbox} **lootbox**!`;
						}
					} else {
						sql += `INSERT INTO crate (uid, cratetype, boxcount, claimcount, claim) VALUES ((SELECT uid FROM user WHERE id = ${marriage.id1}), 0, ${count}, 0, '2017-01-01'), ((SELECT uid FROM user WHERE id = ${marriage.id2}), 0, ${count}, 0, '2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${count};`;
						if (count > 1) {
							text += `${p.config.emoji.crate} **${count} weapon crates**!`;
						} else {
							text += `a ${p.config.emoji.crate} **weapon crate**!`;
						}
					}
					await p.query(sql);
					p.send(text);
					return;
				}
			}
		}
	}
	const time = `${afterMid.hours}H ${afterMid.minutes}M ${afterMid.seconds}S`;
	const text = `**⏱ |** Nu! **${p.getName()}**! You need to wait **${time}**`;
	const alterText = await alterDaily.alter(p, {
		cooldown: time,
		isCooldown: true,
		user: p.msg.author,
		cowoncyInfo: cowoncy,
		marriageInfo: marriage,
	});
	p.send(alterText || text);
}

function calculateMarriageBonus(p, marriage) {
	let totalStreak = marriage.streak1 + marriage.streak2;
	let totalGain = Math.round(100 + Math.floor(Math.random() * 100) + totalStreak * 12.5);
	if (totalGain > 1000) totalGain = 1000;
	if (p.event.isValentines()) {
		totalGain *= 2;
	}
	return totalGain;
}

async function getRewards(p, cowoncy, afterMid) {
	// Grab streak/patreon status
	let streak = 0;
	const supporter = await patreonUtil.getSupporterRank(p, p.msg.author);
	let patreon = supporter.benefitRank >= 3;
	if (cowoncy) {
		streak = cowoncy.daily_streak;
	}

	//Calculate daily amount
	let gain = 500 + Math.floor(Math.random() * 200);
	let extra = 0;

	// Reset streak if its over 1 whole day
	if (afterMid && afterMid.withinDay) streak++;
	else streak = 1;

	// Calculate streak/patreon cowoncy
	gain += streak * 25;
	if (gain > 5000) gain = 5000;
	if (patreon) extra = gain;

	return { gain, extra, streak };
}

function getRandomBox(p, uid) {
	// Determine lootbox or crate
	if (Math.random() < 0.5) {
		return {
			sql: `INSERT INTO lootbox (id, boxcount, claimcount, claim) VALUES (${p.msg.author.id}, 1, 0, '2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;`,
			text: `\n**${p.config.emoji.lootbox} |** You received a **lootbox**!`,
			emoji: p.config.emoji.lootbox,
			name: 'lootbox',
		};
	} else {
		return {
			sql: `INSERT INTO crate(uid, cratetype, boxcount, claimcount, claim) VALUES (${uid}, 0, 1, 0, '2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;`,
			text: `\n**${p.config.emoji.crate} |** You received a **weapon crate**!`,
			emoji: p.config.emoji.crate,
			name: 'weapon crate',
		};
	}
}

async function checkMarriage(p, marriage) {
	if (!marriage || !marriage.daily1 || !marriage.daily2) {
		return;
	}

	// daily can only be claimed the day after married
	let afterMid = p.dateUtil.afterMidnight(marriage.marriedDate);
	if (!afterMid.after) {
		return;
	}

	/* eslint-disable-next-line */
	let soID, soStreak, soDaily;
	if (p.msg.author.id == marriage.id1) {
		soID = marriage.id2;
		/* eslint-disable-next-line */
		soStreak = marriage.streak2;
		soDaily = marriage.daily2;
	} else {
		soID = marriage.id1;
		/* eslint-disable-next-line */
		soStreak = marriage.streak1;
		soDaily = marriage.daily1;
	}

	// If the parter has claimed their daily.. bonuses!
	afterMid = p.dateUtil.afterMidnight(soDaily);
	if (afterMid.after) {
		return;
	}

	const totalGain = calculateMarriageBonus(p, marriage);
	let sql = `UPDATE cowoncy SET money = money + ${totalGain} WHERE id IN (${soID}, ${p.msg.author.id});`;
	sql += `UPDATE marriage SET claimDate = ${afterMid.sql}, dailies = dailies + 1 WHERE uid1 = ${marriage.uid1} AND uid2 = ${marriage.uid2};`;

	let so = await p.fetch.getUser(soID);
	let ring = rings[marriage.rid];
	let text = `\n${ring.emoji}** |** You and ${
		so ? so.username : 'your partner'
	} received <:cowoncy:416043450337853441> **${totalGain} Cowoncy** and `;

	let count = 1;
	if (p.event.isValentines()) {
		const item = {};
		if (Math.random() < 0.5) {
			sql += `INSERT INTO crate (uid, boxcount) VALUES
					(${marriage.uid1}, 1), (${marriage.uid2}, 1)
				ON DUPLICATE KEY UPDATE
					boxcount = boxcount + 1;`;
			item.emoji = p.config.emoji.crate;
			item.name = 'Weapon Crate';
		} else {
			sql += `INSERT INTO lootbox (id, boxcount) VALUES
					(${marriage.id1}, 1), (${marriage.id2}, 1)
				ON DUPLICATE KEY UPDATE
					boxcount = boxcount + 1;`;
			item.emoji = p.config.emoji.lootbox;
			item.name = 'Lootbox';
		}
		text =
			`\n${valEmoji} **|** Happy Valentines! You got a ${item.emoji} **${item.name}** for being so cute together! <3` +
			text;
		count += 1;
	}
	const alterInfo = {
		partner: so,
		ring_emoji: ring.emoji,
		ring_name: ring.name,
		marriage_amount: totalGain,
		marriage_streak: marriage.dailies,
	};
	if (Math.random() < 0.5) {
		sql += `INSERT INTO lootbox (id, boxcount, claimcount, claim) VALUES (${p.msg.author.id}, ${count}, 0, '2017-01-01'), (${soID}, ${count}, 0, '2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${count};`;
		if (count > 1) {
			text += `${p.config.emoji.lootbox} **${count} lootboxes**!`;
		} else {
			text += `a ${p.config.emoji.lootbox} **lootbox**!`;
		}
		alterInfo.marriage_box_emoji = p.config.emoji.lootbox;
		alterInfo.marriage_box_name = 'lootbox';
	} else {
		sql += `INSERT INTO crate (uid, cratetype, boxcount, claimcount, claim) VALUES (${marriage.uid1}, 0, ${count}, 0, '2017-01-01'), (${marriage.uid2}, 0, ${count}, 0, '2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${count};`;
		if (count > 1) {
			text += `${p.config.emoji.crate} **${count} weapon crates**!`;
		} else {
			text += `a ${p.config.emoji.crate} **weapon crate**!`;
		}
		alterInfo.marriage_box_emoji = p.config.emoji.crate;
		alterInfo.marriage_box_name = 'weapon crate';
	}

	return {
		sql,
		text,
		alterInfo,
	};
}
