/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const maxBet = 150000;
const deck = [
	1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
	28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
];
const bjUtil = require('./blackjackUtil.js');
const hitEmoji = '👊';
const stopEmoji = '🛑';

module.exports = new CommandInterface({
	alias: ['blackjack', 'bj', '21'],

	args: '{bet}',

	desc: 'Gamble your money away in blackjack!\nYou can hit or stand by reacting with emojis! If the command stops responding, retype the command to resume the game!',

	example: [],

	related: ['owo money'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['gambling'],

	cooldown: 15000,
	half: 100,
	six: 600,
	bot: true,

	execute: async function (p) {
		let args = p.args,
			msg = p.msg;

		//Check if there is a bet amount
		let amount = 1;
		if (p.global.isInt(args[0])) amount = parseInt(args[0]);
		if (args[0] == 'all') amount = 'all';
		else if (amount == undefined) {
			p.send('**🚫 | ' + msg.author.username + '**, Invalid arguments!', 3000);
			p.setCooldown(5);
			return;
		} else if (amount <= 0) {
			p.send('**🚫 | ' + msg.author.username + "**, You can't bet that much silly!", 3000);
			p.setCooldown(5);
			return;
		}

		let sql = 'SELECT money FROM cowoncy WHERE id = ' + msg.author.id + ';';
		sql +=
			'SELECT * FROM blackjack LEFT JOIN blackjack_card ON blackjack.bjid = blackjack_card.bjid WHERE id = ' +
			msg.author.id +
			' AND active = 1 ORDER BY sort ASC, dealer DESC;';
		if (amount == 'all')
			if (maxBet)
				sql +=
					'UPDATE cowoncy LEFT JOIN blackjack ON cowoncy.id = blackjack.id SET money = (IF(money >' +
					maxBet +
					',money - ' +
					maxBet +
					',0)) WHERE cowoncy.id = ' +
					msg.author.id +
					' AND money > 0 AND (active = 0 OR active IS NULL);';
			else
				sql +=
					'UPDATE cowoncy LEFT JOIN blackjack ON cowoncy.id = blackjack.id SET money = 0 WHERE cowoncy.id = ' +
					msg.author.id +
					' AND money > 0 AND (active = 0 OR active IS NULL);';
		else {
			if (maxBet && amount > maxBet) amount = maxBet;
			sql +=
				'UPDATE cowoncy LEFT JOIN blackjack ON cowoncy.id = blackjack.id SET money = money - ' +
				amount +
				' WHERE cowoncy.id = ' +
				msg.author.id +
				' AND money >= ' +
				amount +
				' AND (active = 0 OR active IS NULL);';
		}
		let result = await p.query(sql);

		//Check for existing match
		if (result[1][0]) {
			await initBlackjack(p, 1, result[1]);
		} else if (result[0][0] && result[0][0].money) {
			let money = result[0][0].money;
			if (maxBet && money > maxBet) money = maxBet;
			if (amount == 'all') {
				if (money <= 0)
					p.send('**🚫 | ' + msg.author.username + '**, You do not have enough cowoncy!', 3000);
				else await initBlackjack(p, money);
			} else {
				if (money < amount)
					p.send('**🚫 | ' + msg.author.username + '**, You do not have enough cowoncy!', 3000);
				else await initBlackjack(p, amount);
			}
		} else {
			p.send('**🚫 | ' + msg.author.username + '**, You do not have enough cowoncy!', 3000);
		}
	},
});

async function blackjack(p, player, dealer, bet, resume) {
	let embed = bjUtil.generateEmbed(p.msg.author, dealer, player, bet);
	let filter = (emoji, userID) =>
		(emoji.name === hitEmoji || emoji.name === stopEmoji) && userID === p.msg.author.id;
	if (resume) embed.footer.text = '🎲 ~ resuming previous game';

	let message = await p.send({ embed });

	await message.addReaction(hitEmoji);
	await message.addReaction(stopEmoji);

	let collector = p.reactionCollector.create(message, filter, { time: 60000 });

	collector.on('collect', async function (emoji) {
		let query = await parseQuery({ p: p, id: p.msg.author.id });
		let nPlayer = query.player;
		let nDealer = query.dealer;
		if (!nPlayer || !nDealer) {
			collector.stop('done');
			message.edit('**🚫 |** This match is already finished');
			return;
		}
		//HIT
		if (emoji.name == hitEmoji) await hit(p, nPlayer, nDealer, message, bet, collector);
		//STOP
		else if (emoji.name == stopEmoji) {
			collector.stop('done');
			await stop(p, nPlayer, nDealer, message, bet);
		}
	});

	collector.on('end', (collected, reason) => {
		if (reason == 'time')
			message.edit('**⏱ |** This session has expired. Retype `owo blackjack` to resume');
	});
}

async function initBlackjack(p, bet, existing) {
	//If existing match
	if (existing) {
		let { player, dealer } = await parseQuery({ query: existing });
		if (!player || !dealer) {
			p.send('Uh oh.. something went wrong...');
			return;
		}
		bet = existing[0].bet;
		await blackjack(p, player, dealer, bet, true);
	} else {
		let tdeck = deck.slice(0);
		let player = [await bjUtil.randCard(tdeck, 'f'), await bjUtil.randCard(tdeck, 'f')];
		let dealer = [await bjUtil.randCard(tdeck, 'f'), await bjUtil.randCard(tdeck, 'b')];
		let sql =
			'INSERT INTO blackjack (id,bet,date,active) VALUES (' +
			p.msg.author.id +
			',' +
			bet +
			',NOW(),1) ON DUPLICATE KEY UPDATE bet = ' +
			bet +
			',date = NOW(), active = 1;';
		sql += bjUtil.generateSQL(player, dealer, p.msg.author.id);
		await p.query(sql);
		await blackjack(p, player, dealer, bet);
		p.quest('gamble');
	}
}

async function hit(p, player, dealer, msg, bet, collector) {
	for (let i = 0; i < player.length; i++) player[i].type = 'c';
	for (let i = 0; i < dealer.length; i++) {
		if (dealer[i].type == 'f') dealer[i].type = 'c';
	}

	let tdeck = bjUtil.initDeck(deck.slice(0), player, dealer);
	let card = await bjUtil.randCard(tdeck, 'f');
	player.push(card);
	let ppoints = bjUtil.cardValue(player).points;

	if (ppoints > 21) {
		collector.stop('done');
		stop(p, player, dealer, msg, bet, true);
	} else {
		let sql =
			'INSERT INTO blackjack_card (bjid,card,dealer,sort) VALUES ((SELECT bjid FROM blackjack WHERE id = ' +
			p.msg.author.id +
			'),' +
			card.card +
			',0,' +
			player.length +
			') ON DUPLICATE KEY UPDATE dealer = 0,sort= ' +
			player.length +
			';';
		p.con.query(sql, function (err, _result) {
			if (err) {
				console.error(err);
				msg.edit('Something went wrong...');
				return;
			}
			let embed = bjUtil.generateEmbed(p.msg.author, dealer, player, bet);
			msg.edit({ embed });
		});
	}
}

async function stop(p, player, dealer, msg, bet, fromHit) {
	if (!fromHit) for (let i = 0; i < player.length; i++) player[i].type = 'c';
	for (let i = 0; i < dealer.length; i++) {
		if (dealer[i].type == 'b') dealer[i].type = 'f';
		else dealer[i].type = 'c';
	}

	let ppoints = bjUtil.cardValue(player).points;
	let dpoints = bjUtil.cardValue(dealer).points;
	let tdeck = bjUtil.initDeck(deck.slice(0), player, dealer);

	while (dpoints < 17) {
		dealer.push(await bjUtil.randCard(tdeck, 'f'));
		dpoints = bjUtil.cardValue(dealer).points;
	}

	//sql get winner
	let winner = undefined;
	//both bust
	if (ppoints > 21 && dpoints > 21) winner = 'tb';
	//tie
	else if (ppoints == dpoints) winner = 't';
	//player bust
	else if (ppoints > 21) winner = 'l';
	//dealer bust
	else if (dpoints > 21) winner = 'w';
	//player win
	else if (ppoints > dpoints) winner = 'w';
	//dealer win
	else winner = 'l';

	let sql = 'UPDATE blackjack SET active = 0 WHERE id = ' + p.msg.author.id + ' AND active > 0;';
	let sql2 =
		'DELETE FROM blackjack_card WHERE bjid = (SELECT bjid FROM blackjack WHERE id = ' +
		p.msg.author.id +
		');';
	if (winner == 'w')
		sql2 +=
			'UPDATE cowoncy SET money = money + ' + bet * 2 + ' WHERE id = ' + p.msg.author.id + ';';
	else if (winner == 't' || winner == 'tb')
		sql2 += 'UPDATE cowoncy SET money = money + ' + bet + ' WHERE id = ' + p.msg.author.id + ';';
	p.con.query(sql, function (err, result) {
		if (err) {
			console.error(err);
			msg.edit('Something went wrong...');
			return;
		}
		if (result.changedRows > 0) {
			p.con.query(sql2, function (err, _result) {
				if (err) {
					console.error(err);
					msg.edit('Something went wrong...');
					return;
				}
				if (winner == 'w') {
					// TODO neo4j
					p.logger.incr(`gamble.blackjack.${p.msg.author.id}`);
					p.logger.incr(`cowoncy.blackjack.${p.msg.author.id}`, bet);
				} else if (winner == 'l') {
					// TODO neo4j
					p.logger.decr(`gamble.blackjack.${p.msg.author.id}`);
					p.logger.decr(`cowoncy.blackjack.${p.msg.author.id}`, -1 * bet);
				}
				let embed = bjUtil.generateEmbed(p.msg.author, dealer, player, bet, winner, bet);
				msg.edit({ embed });
			});
		}
	});
}

async function parseQuery(info) {
	if (info.query) {
		let query = info.query;
		if (!query[0]) return {};
		else {
			let player = [];
			let dealer = [];
			for (let i = 0; i < query.length; i++) {
				if (query[i].dealer == 0) player.push({ card: query[i].card, type: 'c' });
				else if (query[i].dealer == 1) dealer.push({ card: query[i].card, type: 'b' });
				else dealer.push({ card: query[i].card, type: 'c' });
			}
			return { player, dealer };
		}
	} else {
		let sql =
			'SELECT * FROM blackjack LEFT JOIN blackjack_card ON blackjack.bjid = blackjack_card.bjid WHERE id = ' +
			info.id +
			' AND active = 1 ORDER BY sort ASC ,dealer DESC;';
		let result = await info.p.query(sql);
		if (!result[0]) return {};
		else {
			let player = [];
			let dealer = [];
			for (let i = 0; i < result.length; i++) {
				if (result[i].dealer == 0) player.push({ card: result[i].card, type: 'c' });
				else if (result[i].dealer == 1) dealer.push({ card: result[i].card, type: 'b' });
				else dealer.push({ card: result[i].card, type: 'c' });
			}
			return { player, dealer };
		}
	}
}
