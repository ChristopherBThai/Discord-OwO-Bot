/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const altercoinflip = require('../patreon/altercoinflip.js');

const maxBet = 150000;
const cowoncy = '<:cowoncy:416043450337853441>';
const spin = '<a:coinflip:436677458339823636>';
const heads = '<:head:436677933977960478>';
const random = require('random-number-csprng');
const tails = '<:tail:436677926398853120>';

module.exports = new CommandInterface({
	alias: ['coinflip', 'cf', 'coin', 'flip'],

	args: '[head|tail] {bet}',

	desc: 'Flip a coin to earn some cowoncy! You can also shorten the command like in the example!',

	example: ['owo coinflip head 25', 'owo cf t 25'],

	related: ['owo money'],

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

		//Syntax Check
		let bet = 1,
			arg1 = args[0];
		if (global.isInt(arg1)) {
			bet = parseInt(arg1);
			arg1 = args[1];
		} else if (arg1 && arg1.toLowerCase() == 'all') {
			bet = 'all';
			arg1 = args[1];
		} else if (global.isInt(args[1])) {
			bet = parseInt(args[1]);
		} else if (args[1] && args[1].toLowerCase() == 'all') {
			bet = 'all';
		} else if (args.length != 1) {
			p.errorMsg(', Invalid arguments!!', 3000);
			p.setCooldown(5);
			return;
		}

		//Get user choice
		let choice = 'h';
		if (arg1 != undefined) arg1 = arg1.toLowerCase();
		if (arg1 == 'heads' || arg1 == 'h' || arg1 == 'head') choice = 'h';
		else if (arg1 == 'tails' || arg1 == 't' || arg1 == 'tail') choice = 't';

		//Final syntax check
		if (bet == 0) {
			p.errorMsg(", You can't bet 0 dum dum!", 3000);
			p.setCooldown(5);
			return;
		} else if (bet < 0) {
			p.errorMsg(', Do you understand how cowoncy works..??', 3000);
			p.setCooldown(5);
			return;
		} else if (choice == undefined) {
			p.errorMsg(', You must choose either `heads` or `tails`!', 3000);
			p.setCooldown(5);
			return;
		}

		let sql = 'SELECT money FROM cowoncy WHERE id = ' + msg.author.id + ';';
		let result = await p.query(sql);
		if (result[0] == undefined || result[0].money == 0 || (bet != 'all' && result[0].money < bet)) {
			p.send('**🚫 | ' + msg.author.username + "**, You don't have enough cowoncy!", 3000);
			return;
		} else {
			if (bet == 'all') bet = result[0].money;

			if (maxBet && bet > maxBet) {
				bet = maxBet;
			} else if (bet <= 0) {
				p.errorMsg(", you don't have any cowoncy silly!", 3000);
				p.setCooldown(5);
				return;
			}

			let rand = await random(0, 1);
			let win = false;
			//tails
			if (rand == 0 && choice == 't') win = true;
			//heads
			else if (rand == 1 && choice == 'h') win = true;

			sql =
				'UPDATE cowoncy SET money = money ' +
				(win ? '+' : '-') +
				' ' +
				bet +
				' WHERE id = ' +
				msg.author.id +
				';';
			result = await p.query(sql);
			if (win) {
				p.logger.incr('cowoncy', bet, { type: 'coinflip' }, p.msg);
				p.logger.incr('gamble', 1, { type: 'coinflip' }, p.msg);
			} else {
				p.logger.decr('cowoncy', bet * -1, { type: 'coinflip' }, p.msg);
				p.logger.decr('gamble', -1, { type: 'coinflip' }, p.msg);
			}
			let text =
				'**' +
				msg.author.username +
				'** spent **' +
				cowoncy +
				' ' +
				p.global.toFancyNum(bet) +
				'** and chose ' +
				(choice == 'h' ? '**heads**' : '**tails**');
			let text2 = text;
			text2 +=
				'\nThe coin spins... ' +
				(win ? (choice == 'h' ? heads : tails) : choice == 'h' ? tails : heads) +
				' and you ';
			if (win) text2 += 'won **' + cowoncy + ' ' + p.global.toFancyNum(bet * 2) + '**!!';
			else text2 += 'lost it all... :c';
			text += '\nThe coin spins... ' + spin;

			/* Legendary patreon stuff */
			text = altercoinflip.alter(p.msg.author.id, text);
			text2 = altercoinflip.alter(p.msg.author.id, text2);

			let message = await p.send(text);
			setTimeout(function () {
				message.edit(text2);
			}, 2000);
			p.quest('gamble');
		}
	},
});
