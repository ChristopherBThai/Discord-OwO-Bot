/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const essence = '<a:essence:451638978299428875>';

module.exports = new CommandInterface({
	alias: ['sacrifice', 'essence', 'butcher', 'sac', 'sc'],

	args: '{animal|rank} {count}',

	desc: 'Sacrifice an animal to turn them into animal essence! Animal essence is used to upgrade your huntbot!\nSacrificing animals will not prevent you from using them in battle!',

	example: [
		'owo sacrifice dog',
		'owo sacrifice rare',
		'owo sacrifice bug 100',
		'owo sacrifice all',
	],

	related: ['owo autohunt', 'owo upgrade'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 1000,
	half: 120,
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
			p.errorMsg(', Please specify what rank/animal to sacrifice!', 3000);
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
					p.errorMsg(', Invalid arguments!', 3000);
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
			if (args.length < 3) await sellAnimal(p, msg, con, animal, count, p.send, global);
			else
				p.errorMsg(
					', The correct syntax for sacrificing ranks is `owo sacrifice {animal} {count}`!',
					3000
				);

			//if rank...
		} else if ((rank = global.validRank(name))) {
			if (args.length != 1)
				p.errorMsg(', The correct syntax for sacrificing ranks is `owo sacrifice {rank}`!', 3000);
			else await sellRanks.bind(p)([rank]);

			//if neither...
		} else {
			p.errorMsg(', I could not find that animal or rank!', 3000);
		}
	},
});

async function sellAnimal(p, msg, con, animal, count, send, global) {
	let sql = `SELECT * FROM autohunt WHERE id = ${msg.author.id};`;
	let result = await p.query(sql);
	if (!result[0])
		await p.query(`INSERT IGNORE INTO autohunt (id,essence) VALUES (${msg.author.id},0);`);

	if (count != 'all' && count <= 0) {
		send('**🚫 |** You need to sacrifice more than 1 silly~', 3000);
		return;
	}

	sql =
		'SELECT count FROM animal WHERE id = ' + msg.author.id + " AND name = '" + animal.value + "';";
	if (count == 'all') {
		sql += `UPDATE animal INNER JOIN autohunt ON animal.id = autohunt.id INNER JOIN (SELECT count FROM animal WHERE id = ${msg.author.id} AND name = '${animal.value}') AS sum SET essence = essence + (sum.count*${animal.essence}), autohunt.total = autohunt.total + (sum.count*${animal.essence}), saccount = saccount + animal.count, animal.count = 0 WHERE animal.id = ${msg.author.id} AND name = '${animal.value}' AND animal.count > 0;`;
	} else {
		sql += `UPDATE animal INNER JOIN autohunt ON animal.id = autohunt.id SET essence = essence + (${
			count * animal.essence
		}), autohunt.total = autohunt.total + (${
			count * animal.essence
		}), saccount = saccount + ${count}, count = count - ${count}  WHERE animal.id = ${
			msg.author.id
		} AND name = '${animal.value}' AND count >= ${count};`;
	}
	result = await p.query(sql);

	if (count == 'all') {
		if (!result[0][0] || result[0][0].count <= 0) {
			send('**🚫 | ' + p.getName() + "**, You don't have enough animals! >:c", 3000);
		} else {
			count = result[0][0].count;
			send(
				'**🔪 | ' +
					p.getName() +
					'** sacrificed **' +
					global.unicodeAnimal(animal.value) +
					'x' +
					count +
					'** for **' +
					essence +
					' ' +
					global.toFancyNum(count * animal.essence) +
					'**'
			);
			p.logger.incr('essence', count * animal.essence, { type: 'sacrifice' }, p.msg);
		}
	} else if (result[1] && result[1].affectedRows > 0) {
		send(
			'**🔪 | ' +
				p.getName() +
				'** sacrificed **' +
				global.unicodeAnimal(animal.value) +
				'x' +
				count +
				'** for **' +
				essence +
				' ' +
				global.toFancyNum(count * animal.essence) +
				'**'
		);
		p.logger.incr('essence', count * animal.essence, { type: 'sacrifice' }, p.msg);
	} else {
		send('**🚫 | ' + p.getName() + "**, You can't sacrifice more than you have silly! >:c", 3000);
	}
}

async function sellRanks(ranks) {
	const rankNames = `'` + ranks.map((rank) => rank.rank).join(`','`) + `'`;
	let total = 0;
	let sold = '';
	const con = await this.startTransaction();
	try {
		let sql = `SELECT rank, count FROM animal INNER JOIN animals ON animal.name = animals.name WHERE id = ${this.msg.author.id} AND rank in (${rankNames}) AND count > 0;`;
		let result = await con.query(sql);
		const rows = result.length;
		const combine = {};
		result.forEach((rank) => {
			if (!combine[rank.rank]) {
				combine[rank.rank] = 0;
			}
			combine[rank.rank] += rank.count;
		});

		for (let rankName in combine) {
			const rank = ranks.find((rank) => rank.rank === rankName);
			total += combine[rankName] * rank.essence;
			sold += rank.emoji + 'x' + combine[rankName] + ' ';
		}
		if (!total) {
			this.errorMsg(", You don't have enough animals! >:c", 3000);
			await con.rollback();
			return;
		}

		sql = `INSERT INTO autohunt (id, essence, total) VALUES (${this.msg.author.id}, ${total}, ${total}) ON DUPLICATE KEY UPDATE essence = essence + ${total}, total = total + ${total};`;
		sql += `UPDATE animal INNER JOIN animals ON animal.name = animals.name SET saccount = saccount + count, count = 0 WHERE id = ${this.msg.author.id} AND rank IN (${rankNames}) AND count > 0;`;
		result = await con.query(sql);
		if (result[1].changedRows != rows) {
			this.errorMsg(', failed to sacrifice rank.', 3000);
			await con.rollback();
			return;
		}

		await con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		this.errorMsg(', failed to sacrifice rank.', 3000);
		return;
	}

	sold = sold.slice(0, -1);
	this.send(
		`**🔪 | ${this.getName()}** sacrificed **${sold}** for a total of **${
			this.config.emoji.essence
		} ${this.global.toFancyNum(total)}**`
	);
	this.logger.incr('essence', total, { type: 'sell' }, this.msg);
}
