/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const weaponUtil = require('../battle/util/weaponUtil.js');
const ringUtil = require('../social/util/ringUtil.js');

module.exports = new CommandInterface({
	alias: ['sell'],

	args: '{animal|rank|weaponID|ringID} {count}',

	desc: 'Sell animals from your zoo! Selling animals will NOT affect your zoo score!\nYou can also sell weapons by their unique weaponID!\nSelling animals will not prevent you from using them in battle!',

	example: [
		'owo sell dog',
		'owo sell cat 1',
		'owo sell ladybug all',
		'owo sell uncommon',
		'owo sell all',
		'owo sell rareweapons',
	],

	related: ['owo hunt'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 1000,
	half: 150,
	six: 500,
	bot: true,

	execute: async function (p) {
		let global = p.global,
			con = p.con,
			msg = p.msg,
			args = p.args;

		let name = undefined;
		let count = 1;
		let ranks;

		/* If no args */
		if (args.length == 0) {
			p.send(
				'**🚫 | ' + msg.author.username + '**, Please specify what rank/animal to sell!',
				3000
			);
			return;

			/* if arg0 is a count */
		} else if (args.length == 2 && (global.isInt(args[0]) || args[0].toLowerCase() == 'all')) {
			if (args[0].toLowerCase() != 'all') count = parseInt(args[0]);
			else count = 'all';
			name = args[1];

			/* if arg1 is a count (or not) */
		} else if (args.length == 2 && (global.isInt(args[1]) || args[1].toLowerCase() == 'all')) {
			if (args[1].toLowerCase() != 'all') count = parseInt(args[1]);
			else count = 'all';
			name = args[0];

			/* Only one argument */
		} else if (args.length == 1) {
			if (args[0].toLowerCase() == 'all') ranks = global.getAllRanks();
			else name = args[0];

			/* Multiple ranks */
		} else {
			ranks = {};
			for (let i = 0; i < args.length; i++) {
				let tempRank = global.validRank(args[i].toLowerCase());
				if (!tempRank) {
					p.send('**🚫 | ' + msg.author.username + '**, Invalid arguments!', 3000);
					return;
				}
				if (!(tempRank in ranks)) {
					ranks[tempRank.rank] = tempRank;
				}
			}
		}

		if (name) name = name.toLowerCase();

		let animal, rank;
		/* If multiple ranks */
		if (ranks) {
			sellRanks(msg, con, ranks, p.send, global, p);

			//if its an animal...
		} else if ((animal = global.validAnimal(name))) {
			if (args.length < 3) sellAnimal(msg, con, animal, count, p.send, global, p);
			else
				p.send(
					'**🚫 | ' +
						msg.author.username +
						'**, The correct syntax for selling ranks is `owo sell {animal} {count}`!',
					3000
				);

			//if rank...
		} else if ((rank = global.validRank(name))) {
			if (args.length != 1)
				p.send(
					'**🚫 | ' +
						msg.author.username +
						'**, The correct syntax for selling ranks is `owo sell {rank}`!',
					3000
				);
			else sellRank(msg, con, rank, p.send, global, p);

			//if a weapon or a ring...
		} else if (args.length == 1) {
			if (global.isInt(name) && parseInt(name) > 0 && parseInt(name) <= ringUtil.getMaxID())
				ringUtil.sell(p, parseInt(args[0]));
			else weaponUtil.sell(p, args[0]);

			//if neither...
		} else {
			p.send('**🚫 |** I could not find that animal or rank!', 3000);
		}
	},
});

function sellAnimal(msg, con, animal, count, send, global, p) {
	if (count != 'all' && count <= 0) {
		send('**🚫 |** You need to sell more than 1 silly~', 3000);
		return;
	}
	let sql =
		'UPDATE cowoncy NATURAL JOIN animal SET money = money + ' +
		count * animal.price +
		', count = count - ' +
		count +
		', sellcount = sellcount + ' +
		count +
		' WHERE id = ' +
		msg.author.id +
		" AND name = '" +
		animal.value +
		"' AND count >= " +
		count +
		';';
	if (count == 'all') {
		sql =
			'SELECT count FROM animal WHERE id = ' +
			msg.author.id +
			" AND name = '" +
			animal.value +
			"';";
		sql +=
			'UPDATE cowoncy NATURAL JOIN animal SET money = money + (count*' +
			animal.price +
			'), sellcount = sellcount + count, count = 0 WHERE id = ' +
			msg.author.id +
			" AND name = '" +
			animal.value +
			"' AND count >= 1;";
	}
	con.query(sql, function (err, result) {
		if (err) {
			console.error(err);
			return;
		}
		if (count == 'all') {
			if (result[1].affectedRows <= 0) {
				send('**🚫 | ' + msg.author.username + "**, You don't have enough animals! >:c", 3000);
			} else {
				count = result[0][0].count;
				send(
					'**🔪 | ' +
						msg.author.username +
						'** sold **' +
						global.unicodeAnimal(animal.value) +
						'x' +
						count +
						'** for a total of **<:cowoncy:416043450337853441> ' +
						global.toFancyNum(count * animal.price) +
						'**'
				);
				p.logger.incr('cowoncy', count * animal.price, { type: 'sell' }, p.msg);
				// TODO neo4j
			}
		} else if (result.affectedRows > 0) {
			send(
				'**🔪 | ' +
					msg.author.username +
					'** sold **' +
					global.unicodeAnimal(animal.value) +
					'x' +
					count +
					'** for a total of **<:cowoncy:416043450337853441> ' +
					global.toFancyNum(count * animal.price) +
					'**'
			);
			p.logger.incr('cowoncy', count * animal.price, { type: 'sell' }, p.msg);
			// TODO neo4j
		} else {
			send(
				'**🚫 | ' + msg.author.username + "**, You can't sell more than you have silly! >:c",
				3000
			);
		}
	});
}

function sellRank(msg, con, rank, send, global, p) {
	//TODO remove
	if (rank.rank == 'special') {
		p.errorMsg(', there is an issue selling specials. We are currently fixing the issue');
		return;
	}
	let animals = "('" + rank.animals.join("','") + "')";
	let sql =
		'SELECT SUM(count) AS total FROM animal WHERE id = ' +
		msg.author.id +
		' AND name IN ' +
		animals +
		';';
	sql +=
		'UPDATE animal INNER JOIN cowoncy ON animal.id = cowoncy.id INNER JOIN (SELECT COALESCE(SUM(count),0) AS sum FROM animal WHERE id = ' +
		msg.author.id +
		' AND name IN ' +
		animals +
		') s SET money = money + (s.sum*' +
		rank.price +
		'), sellcount = sellcount + count, count = 0 WHERE animal.id = ' +
		msg.author.id +
		' AND name IN ' +
		animals +
		' AND count > 0;';
	con.query(sql, function (err, result) {
		if (err) {
			console.error(err);
			return;
		}
		if (result[1].affectedRows <= 0) {
			send('**🚫 | ' + msg.author.username + "**, You don't have enough animals! >:c", 3000);
		} else {
			let count = result[0][0].total;
			send(
				'**🔪 | ' +
					msg.author.username +
					'** sold **' +
					rank.emoji +
					'x' +
					count +
					'** for a total of **<:cowoncy:416043450337853441> ' +
					global.toFancyNum(count * rank.price) +
					'**'
			);
			p.logger.incr('cowoncy', count * rank.price, { type: 'sell' }, p.msg);
			// TODO neo4j
		}
	});
}

async function sellRanks(msg, con, ranks, send, global, p) {
	let sold = '',
		total = 0;
	for (let i in ranks) {
		let rank = ranks[i];
		// TODO remove
		if (rank.rank == 'special') {
			break;
		}
		let animals = "('" + rank.animals.join("','") + "')";
		let sql =
			'SELECT SUM(count) AS total FROM animal WHERE id = ' +
			msg.author.id +
			' AND name IN ' +
			animals +
			';';
		sql +=
			'UPDATE animal INNER JOIN cowoncy ON animal.id = cowoncy.id INNER JOIN (SELECT COALESCE(SUM(count),0) AS sum FROM animal WHERE id = ' +
			msg.author.id +
			' AND name IN ' +
			animals +
			') s SET money = money + (s.sum*' +
			rank.price +
			'), sellcount = sellcount + count, count = 0 WHERE animal.id = ' +
			msg.author.id +
			' AND name IN ' +
			animals +
			' AND count > 0;';

		try {
			let result = await p.query(sql);
			let sellCount = result[0][0].total;
			if (sellCount > 0) {
				sold += rank.emoji + 'x' + result[0][0].total + ' ';
				total += sellCount * rank.price;
			}
		} catch (err) {
			console.error(err);
		}
	}

	if (sold != '') {
		sold = sold.slice(0, -1);
		send(
			'**🔪 | ' +
				msg.author.username +
				'** sold **' +
				sold +
				'** for a total of **<:cowoncy:416043450337853441> ' +
				global.toFancyNum(total) +
				'**'
		);
		p.logger.incr('cowoncy', total, { type: 'sell' }, p.msg);
		// TODO neo4j
	} else {
		send('**🚫 | ' + msg.author.username + "**, You don't have enough animals! >:c", 3000);
	}
}
