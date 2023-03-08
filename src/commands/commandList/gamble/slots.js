/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const maxBet = 150000;
const slots = [
	'<:eggplant:417475705719226369>',
	'<:heart:417475705899712522>',
	'<:cherry:417475705178161162>',
	'<:cowoncy:417475705912426496>',
	'<:o_:417475705899843604>',
	'<:w_:417475705920684053>',
];
const moving = '<a:slot_gif:417473893368987649>';
const alterSlot = require('../patreon/alterSlot.js');
const random = require('random-number-csprng');

module.exports = new CommandInterface({
	alias: ['slots', 'slot', 's'],

	args: '{amount}',

	desc: 'Bet your money in the slot machine! Earn up to 10x your money!',

	example: ['owo slots 1000', 'owo slots all', 'owo s 100'],

	related: ['owo money', 'owo lottery', 'owo coinflip'],

	permissions: ['sendMessages'],

	group: ['gambling'],

	cooldown: 15000,
	half: 90,
	six: 500,
	bot: true,

	execute: async function (p) {
		let global = p.global,
			msg = p.msg,
			args = p.args;
		//Check arguments
		let amount = 0;
		let all = false;
		if (args.length == 0) amount = 1;
		else if (global.isInt(args[0]) && args.length == 1) amount = parseInt(args[0]);
		else if (args.length == 1 && args[0] == 'all') all = true;
		else {
			p.errorMsg(', Invalid arguments!! >:c', 3000);
			p.setCooldown(5);
			return;
		}

		if (amount == 0 && !all) {
			p.errorMsg(", uwu.. you can't bet 0 silly!", 3000);
			p.setCooldown(5);
			return;
		} else if (amount < 0) {
			p.errorMsg(", that... that's not how it works.", 3000);
			p.setCooldown(5);
			return;
		}

		//Check if valid time and cowoncy
		let sql = 'SELECT money FROM cowoncy WHERE id = ' + msg.author.id + ';';
		let result = await p.query(sql);
		if (all && result[0] != undefined) amount = result[0].money;
		if (maxBet && amount > maxBet) amount = maxBet;
		if (result[0] == undefined || result[0].money < amount || result[0].money <= 0) {
			p.send('**🚫 | ' + msg.author.username + "**, You don't have enough cowoncy!", 3000);
		} else {
			//Decide results
			let rslots = [];
			let rand = (await random(1, 1000)) / 10;
			let win = 0;
			let logging = 0;
			if (rand <= 20) {
				//1x 20%
				win = amount;
				rslots.push(slots[0]);
				rslots.push(slots[0]);
				rslots.push(slots[0]);
				logging = 0;
			} else if (rand <= 40) {
				//2x 20%
				win = amount * 2;
				rslots.push(slots[1]);
				rslots.push(slots[1]);
				rslots.push(slots[1]);
				logging = 1;
			} else if (rand <= 45) {
				//3x 5%
				win = amount * 3;
				rslots.push(slots[2]);
				rslots.push(slots[2]);
				rslots.push(slots[2]);
				logging = 2;
			} else if (rand <= 47.5) {
				//4x 2.5%
				win = amount * 4;
				rslots.push(slots[3]);
				rslots.push(slots[3]);
				rslots.push(slots[3]);
				logging = 3;
			} else if (rand <= 48.5) {
				//10x 1%
				win = amount * 10;
				rslots.push(slots[4]);
				rslots.push(slots[5]);
				rslots.push(slots[4]);
				logging = 9;
			} else {
				logging = -1;
				var slot1 = Math.floor(Math.random() * (slots.length - 1));
				var slot2 = Math.floor(Math.random() * (slots.length - 1));
				var slot3 = Math.floor(Math.random() * (slots.length - 1));
				if (slot3 == slot1)
					slot2 = (slot1 + Math.ceil(Math.random() * (slots.length - 2))) % (slots.length - 1);
				if (slot2 == slots.length - 2) slot2++;
				rslots.push(slots[slot1]);
				rslots.push(slots[slot2]);
				rslots.push(slots[slot3]);
			}
			let winmsg =
				win == 0 ? 'nothing... :c' : '<:cowoncy:416043450337853441> ' + p.global.toFancyNum(win);

			sql =
				'UPDATE cowoncy SET money = money + ' +
				(win - amount) +
				' WHERE id = ' +
				msg.author.id +
				' AND money >= ' +
				amount +
				';';
			result = await p.query(sql);
			p.logger.incr('cowoncy', win - amount, { type: 'slots' }, p.msg);
			p.logger.incr('gamble', logging, { type: 'slots' }, p.msg);

			//Display slots
			let machine =
				'**`___SLOTS___  `**\n' +
				moving +
				' ' +
				moving +
				' ' +
				moving +
				'   ' +
				msg.author.username +
				' bet <:cowoncy:416043450337853441> ' +
				p.global.toFancyNum(amount) +
				'\n`|         |`\n`|         |`';
			machine = alterSlot.alter(p.msg.author.id, machine);
			let message = await p.send(machine);
			setTimeout(async function () {
				machine =
					'**`___SLOTS___  `**\n' +
					rslots[0] +
					' ' +
					moving +
					' ' +
					moving +
					'   ' +
					msg.author.username +
					' bet <:cowoncy:416043450337853441> ' +
					p.global.toFancyNum(amount) +
					'\n`|         |`\n`|         |`';
				machine = alterSlot.alter(p.msg.author.id, machine);
				await message.edit(machine);
				setTimeout(async function () {
					machine =
						'**`___SLOTS___  `**\n' +
						rslots[0] +
						' ' +
						moving +
						' ' +
						rslots[2] +
						'   ' +
						msg.author.username +
						' bet <:cowoncy:416043450337853441> ' +
						p.global.toFancyNum(amount) +
						'\n`|         |`\n`|         |`';
					machine = alterSlot.alter(p.msg.author.id, machine);
					await message.edit(machine);
					setTimeout(async function () {
						machine =
							'**`___SLOTS___  `**\n' +
							rslots[0] +
							' ' +
							rslots[1] +
							' ' +
							rslots[2] +
							'   ' +
							msg.author.username +
							' bet <:cowoncy:416043450337853441> ' +
							p.global.toFancyNum(amount) +
							'\n`|         |`  and won ' +
							winmsg +
							'\n`|         |`';
						machine = alterSlot.alter(p.msg.author.id, machine);
						message.edit(machine);
					}, 1000);
				}, 700);
			}, 1000);

			p.quest('gamble');
		}
	},
});
