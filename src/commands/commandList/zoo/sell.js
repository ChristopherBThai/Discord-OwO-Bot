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
			p.send('**🚫 | ' + p.getName() + '**, Please specify what rank/animal to sell!', 3000);
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
					p.send('**🚫 | ' + p.getName() + '**, Invalid arguments!', 3000);
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
			await sellRanks.bind(p)(Object.values(ranks));

			//if its an animal...
		} else if ((animal = global.validAnimal(name))) {
			if (args.length < 3) sellAnimal(msg, con, animal, count, p.send, global, p);
			else
				p.send(
					'**🚫 | ' +
						p.getName() +
						'**, The correct syntax for selling ranks is `owo sell {animal} {count}`!',
					3000
				);

			//if rank...
		} else if ((rank = global.validRank(name))) {
			if (args.length != 1)
				p.send(
					'**🚫 | ' +
						p.getName() +
						'**, The correct syntax for selling ranks is `owo sell {rank}`!',
					3000
				);
			else await sellRanks.bind(p)([rank]);

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
				send('**🚫 | ' + p.getName() + "**, You don't have enough animals! >:c", 3000);
			} else {
				count = result[0][0].count;
				send(
					'**🔪 | ' +
						p.getName() +
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
					p.getName() +
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
			send('**🚫 | ' + p.getName() + "**, You can't sell more than you have silly! >:c", 3000);
		}
	});
}

async function sellRanks(ranks) {
	const rankNames = `'` + ranks.map(rank => rank.rank).join(`','`) + `'`;
	let total = 0;
	let sold = '';
	let test = Date.now();
	const con = await this.startTransaction()
	try {
		let sql = `SELECT rank, count FROM animal INNER JOIN animals ON animal.name = animals.name WHERE id = ${this.msg.author.id} AND rank in (${rankNames}) AND count > 0;`;
		let result = await con.query(sql);
		const rows = result.length;
		const combine = {};
		result.forEach(rank => {
			if (!combine[rank.rank]) {
				combine[rank.rank] = 0;
			}
			combine[rank.rank] += rank.count;
		});

		for (let rankName in combine) {
			const rank = ranks.find(rank => rank.rank === rankName);
			total += combine[rankName] * rank.price;
			sold += rank.emoji + 'x' + combine[rankName] + ' ';
		}
		if (!total) {
			this.errorMsg(', You don\'t have enough animals! >:c', 3000);
			await con.rollback();
			return;
		}

		sql = `UPDATE cowoncy SET money = money + ${total} WHERE id = ${this.msg.author.id};`;
		sql += `UPDATE animal INNER JOIN animals ON animal.name = animals.name SET sellcount = sellcount + count, count = 0 WHERE id = ${this.msg.author.id} AND rank IN (${rankNames}) AND count > 0;`;
		result = await con.query(sql);
		if (result[1].changedRows != rows) {
			this.errorMsg(', failed to sell rank.', 3000);
			await con.rollback();
			return;
		}

		await con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		this.errorMsg(', failed to sell rank.', 3000);
		return;
	}
	
	sold = sold.slice(0, -1);
	this.send(`**🔪 | ${this.getName()}** sold **${sold}** for a total of **<:cowoncy:416043450337853441> ${this.global.toFancyNum(total)}**`);
	this.logger.incr('cowoncy', total, { type: 'sell' }, this.msg);
}
