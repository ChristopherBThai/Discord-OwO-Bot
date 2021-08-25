/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const bossUtil = require('./util/bossUtil.js');
const bossCreatorUtil = require('./util/bossCreatorUtil.js');
const battleUtil = require('./util/battleUtil.js');
const ticketEmoji = "<:bticket:878871063273017356>";
const maxTickets = 3;

module.exports = new CommandInterface({

	alias:["boss"],

	args:"[ticket]",

	desc:"Bosses will appear randomly on a server! Rewards depend on how much damage you do.",

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
		if (["ticket", "tickets", "t"].includes(subcommand)) {
			await ticket(p);
		} else {
			await bossUtil.display(p);
		}
	}

})

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


