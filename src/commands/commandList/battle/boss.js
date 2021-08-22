/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const bossUtil = require('./util/bossUtil.js');
const battleUtil = require('./util/battleUtil.js');
const ticketEmoji = "<:bticket:878871063273017356>";
const maxTickets = 3;

module.exports = new CommandInterface({

	alias:["boss"],

	args:"[fight | ticket]",

	desc:"Bosses will appear randomly on a server! You can fight them with 'owo boss fight'! Rewards depend on how much damage you do.",

	example:["owo boss fight"],

	related:["owo battle"],

	permissions:["sendMessages","embedLinks"],

	group:["animals"],

	// TODO add cooldown
	cooldown:000,
	half:25,
	six:200,
	bot:true,

	execute: async function(p){
		const subcommand = p.args[0];
		if (subcommand == "fight") {
			await fight(p);
		} else if (["ticket", "tickets", "t"].includes(subcommand)) {
			await ticket(p);
		} else {
			await display(p);
		}
	}

})

async function display (p) {
	const boss = await bossUtil.fetchBoss(p);
	if (!boss) {
		p.errorMsg(", there is no boss available!", 5000);
		p.setCooldown(5);
		return;
	}
	
	// TODO display users
	const users = await bossUtil.fetchUsers(p);
	
	bossUtil.display(p, { boss: boss.team[0], users });
}

async function fight (p) {
	const boss = await bossUtil.fetchBoss(p);
	if (!boss) {
		p.errorMsg(", there is no boss available!", 5000);
		p.setCooldown(5);
		return;
	}

	if (!await consumeTicket(p)) {
		return p.errorMsg(", you don't have any more boss tickets!", 5000);
	}
	
	// TODO display users
	const users = await bossUtil.fetchUsers(p);
	// TODO no teams
	const player = await bossUtil.fetchPlayer(p);

	const battle = {
		player,
		enemy: boss
	}

	const prevHp = boss.team[0].stats.hp[0];
	const prevWp = boss.team[0].stats.wp[0];

	let logs = await battleUtil.calculateAll(p,battle);

	const currentHp = logs[logs.length-2].enemy[0].hp[0];
	const currentWp = logs[logs.length-2].enemy[0].wp[0];
	const hpChange = prevHp - currentHp;
	const wpChange = prevWp - currentWp;

	bossUtil.updateBoss(p, {boss: boss.team[0], users, hpChange, wpChange });
}

async function ticket (p) {
	const uid = await p.global.getUid(p.msg.author.id);
	let sql = `SELECT boss_ticket.* FROM boss_ticket INNER JOIN user ON boss_ticket.uid = user.uid WHERE user.id = ${p.msg.author.id}`;
	let result = await p.query(sql);

	const reset = p.dateUtil.afterMidnight(result[0]?.reset);
	
	let tickets;
	if (reset.after) {
		sql = `INSERT INTO boss_ticket (uid, count) VALUES (${uid}, ${maxTickets}) ON DUPLICATE KEY UPDATE count = ${maxTickets}, reset = ${reset.sql};`;
		await p.query(sql);
		tickets = maxTickets;
	} else {
		tickets = result[0].count;
	}

	if (tickets == 0) {
		await p.replyMsg(ticketEmoji, `, you ran out of tickets!\n${p.config.emoji.blank} **|** You will get ${maxTickets} more boss tickets in **${reset.hours}H ${reset.minutes}M ${reset.seconds}S**!`);
	} else {
		await p.replyMsg(ticketEmoji, `, you currently have ${tickets} tickets!`);
	}
}

async function consumeTicket (p) {
	const con = await p.startTransaction();
	try {
		let sql = `SELECT user.uid, boss_ticket.count FROM user LEFT JOIN boss_ticket ON boss_ticket.uid = user.uid WHERE user.id = ${p.msg.author.id}`;
		let result = await con.query(sql);
		let uid;

		// Grab user uid
		if (!result) {
			uid = await p.global.createUser(p);
		} else {
			uid = result[0].uid;
		}

		// If there is no database row...
		if (!result || result[0].count === null) {
			sql = `INSERT INTO boss_ticket (uid, count) VALUES (${uid}, ${maxTickets - 1})`;
			await con.query(sql);

		// If user has no tickets left
		} else if (result && result[0].count <= 0) {
			return false;

		// User has tickets, remove one.
		} else {
			sql = `UPDATE boss_ticket SET count = count - 1 WHERE count > 0 AND uid = ${uid};`;
			result = await con.query(sql);
			if (result.changedRows <= 0) {
				return false;
			}
		}

		con.commit();
	} catch (err) {
		console.error(err);
		return con.rollback();
	}

	return true;
}
