/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';
const animalUtil = require('./animalUtil.js');
const alterZoo = require('../patreon/alterZoo.js');
let animals;
try {
	animals = require('../../../../../tokens/owo-animals.json');
} catch (err) {
	console.error('Could not find owo-animals.json, attempting to use ./secret file...');
	animals = require('../../../../secret/owo-animals.json');
	console.log('Found owo-animals.json file in secret folder!');
}
let patreon = '';
let cpatreon = '';
let secret = '';
let secret2 = '';
let secret3 = '';
let secret4 = '';
let secret5 = '';
let secret6 = '';
let secret7 = '';
let display = '';
initDisplay();

module.exports = new CommandInterface({
	alias: ['zoo', 'z'],

	args: '{display}',

	desc: "Displays your zoo! Some animals are rarer than others! Use the 'display' args to display all your animals from your history!",

	example: ['owo zoo', 'owo zoo display'],

	related: ['owo hunt', 'owo sell'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 45000,
	half: 20,
	six: 100,

	execute: function (p) {
		let con = p.con,
			msg = p.msg,
			global = p.global;
		let sql = 'SELECT count,name FROM animal WHERE id = ' + msg.author.id + ';';
		if (p.args[0] && (p.args[0].toLowerCase() == 'display' || p.args[0].toLowerCase() == 'd')) {
			sql = 'SELECT (totalcount) as count,name FROM animal WHERE id = ' + msg.author.id + ';';
			sql +=
				'SELECT common,uncommon,rare,epic,mythical,gem,legendary,fabled,patreon,cpatreon,hidden,special,bot,distorted,MAX(totalcount) AS biggest FROM animal NATURAL JOIN animal_count WHERE id = ' +
				msg.author.id +
				' GROUP BY id;';
		} else {
			sql +=
				'SELECT common,uncommon,rare,epic,mythical,gem,legendary,fabled,patreon,cpatreon,hidden,special,bot,distorted,MAX(count) AS biggest FROM animal NATURAL JOIN animal_count WHERE id = ' +
				msg.author.id +
				' GROUP BY id;';
		}
		con.query(sql, function (err, result) {
			if (err) {
				console.error(err);
				return;
			}
			let header = '🌿 🌱 🌳** ' + msg.author.username + "'s zoo! **🌳 🌿 🌱\n";
			let text = display;
			var additional0 = '';
			var additional = '';
			var additional2 = '';
			var additional3 = '';
			var additional4 = '';
			var additional5 = '';
			var additional6 = '';
			let additional7 = '';
			let additional8 = '';
			var row = result[0];
			var count = result[1][0];
			var cpatreonCount = 0;
			var specialCount = 0;
			var digits = 2;
			if (count != undefined) digits = Math.trunc(Math.log10(count.biggest) + 1);
			for (var i = 0; i < row.length; i++) {
				text = text.replace(
					'~' + row[i].name,
					global.unicodeAnimal(row[i].name) + toSmallNum(row[i].count, digits)
				);
				if (animals.patreon.indexOf(row[i].name) > 0) {
					if (additional0 == '') additional0 = patreon;
					additional0 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
				} else if (animals.cpatreon.indexOf(row[i].name) > 0) {
					if (additional4 == '') additional4 = cpatreon;
					if (cpatreonCount >= 5) {
						cpatreonCount = 0;
						additional4 += '\n<:blank:427371936482328596>    ';
					}
					additional4 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
					cpatreonCount++;
				} else if (animals.bot.indexOf(row[i].name) > 0) {
					if (additional7 == '') additional7 = secret6;
					additional7 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
				} else if (animals.distorted.indexOf(row[i].name) > 0) {
					if (additional8 == '') additional8 = secret7;
					additional8 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
				} else if (animals.gem.indexOf(row[i].name) > 0) {
					if (additional6 == '') additional6 = secret5;
					additional6 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
				} else if (animals.legendary.indexOf(row[i].name) > 0) {
					if (additional == '') additional = secret;
					additional += row[i].name + toSmallNum(row[i].count, digits) + '  ';
				} else if (animals.fabled.indexOf(row[i].name) > 0) {
					if (additional2 == '') additional2 = secret2;
					additional2 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
				} else if (animals.special.indexOf(row[i].name) > 0) {
					if (additional3 == '') additional3 = secret3;
					if (specialCount >= 5) {
						specialCount = 0;
						additional3 += '\n<:blank:427371936482328596>    ';
					}
					additional3 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
					specialCount++;
				} else if (animals.hidden.indexOf(row[i].name) > 0) {
					if (additional5 == '') additional5 = secret4;
					additional5 += row[i].name + toSmallNum(row[i].count, digits) + '  ';
				}
			}
			text = text.replace(/~:[a-zA-Z_0-9]+:/g, animals.question + toSmallNum(0, digits));
			text += additional0;
			text += additional4;
			text += additional;
			text += additional6;
			text += additional7;
			text += additional8;
			text += additional2;
			text += additional3;
			text += additional5;
			let footer = '';
			if (count != undefined) {
				var total =
					count.common * animals.points.common +
					count.uncommon * animals.points.uncommon +
					count.rare * animals.points.rare +
					count.epic * animals.points.epic +
					count.mythical * animals.points.mythical +
					count.patreon * animals.points.patreon +
					count.cpatreon * animals.points.cpatreon +
					count.special * animals.points.special +
					count.gem * animals.points.gem +
					count.legendary * animals.points.legendary +
					count.fabled * animals.points.fabled +
					count.bot * animals.points.bot +
					count.distorted * animals.points.distorted +
					count.hidden * animals.points.hidden;
				footer += '\n**Zoo Points: __' + p.global.toFancyNum(total) + '__**\n\t**';
				footer += animalUtil.zooScore(count) + '**';
			}
			let zooText = header + text + footer;
			zooText = alterZoo.alter(p.msg.author.id, zooText, {
				user: p.msg.author,
			});
			p.send(zooText);
			/*
			let pages = toPages(text);
			sendPages(p,pages,header,footer);
			*/
		});
	},
});

/* eslint-disable-next-line */
function toPages(text) {
	text = text.split('\n');
	let pages = [];
	let page = '';
	const max = 1600;
	for (let i in text) {
		if (page.length + text[i].length >= max) {
			pages.push(page + '\n' + text[i]);
			page = '';
		} else {
			page += '\n' + text[i];
		}
	}
	if (page != '') pages.push(page);
	return pages;
}

/* eslint-disable-next-line */
async function sendPages(p, pages, header, footer) {
	if (pages.length <= 3) {
		for (let i in pages) {
			let text = pages[i].trim();
			if (i == 0) text = header + text;
			if (i == pages.length - 1) text += footer;
			await p.send(text);
		}
		return;
	}

	let page = 0;
	let embed = toEmbed(p, header, pages, footer, page);
	let msg = await p.send({ embed });
	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);
	let filter = (emoji, userID) =>
		(emoji.name === nextPageEmoji || emoji.name === prevPageEmoji) && userID === p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	collector.on('collect', async function (emoji) {
		if (emoji.name === nextPageEmoji) {
			page++;
			if (page >= pages.length) page = 0;
			embed = toEmbed(p, header, pages, footer, page);
			await msg.edit({ embed });
		}
		if (emoji.name === prevPageEmoji) {
			page--;
			if (page < 0) page = pages.length - 1;
			embed = toEmbed(p, header, pages, footer, page);
			await msg.edit({ embed });
		}
	});
	collector.on('end', async function (_collected) {
		embed.color = 6381923;
		await msg.edit({ content: 'This message is now inactive', embed });
	});
}

function toEmbed(p, header, pages, footer, loc) {
	let embed = {
		description: pages[loc].trim() + footer,
		color: p.config.embed_color,
		author: {
			name: header.replace(/\*\*/gi, ''),
			icon_url: p.msg.author.avatarURL,
		},
		footer: {
			text: 'Page ' + (loc + 1) + '/' + pages.length,
		},
	};
	return embed;
}

function toSmallNum(count, digits) {
	let result = '';
	for (let i = 0; i < digits; i++) {
		var digit = count % 10;
		count = Math.trunc(count / 10);
		result = animals.numbers[digit] + result;
	}
	return result;
}

function initDisplay() {
	var gap = '  ';
	display = animals.ranks.common + '   ';
	for (let i = 1; i < animals.common.length; i++) display += '~' + animals.common[i] + gap;
	display += '\n' + animals.ranks.uncommon + '   ';
	for (let i = 1; i < animals.uncommon.length; i++) display += '~' + animals.uncommon[i] + gap;
	display += '\n' + animals.ranks.rare + '   ';
	for (let i = 1; i < animals.rare.length; i++) display += '~' + animals.rare[i] + gap;
	display += '\n' + animals.ranks.epic + '   ';
	for (let i = 1; i < animals.epic.length; i++) display += '~' + animals.epic[i] + gap;
	display += '\n' + animals.ranks.mythical + '   ';
	for (let i = 1; i < animals.mythical.length; i++) display += '~' + animals.mythical[i] + gap;
	patreon = '\n' + animals.ranks.patreon + '    ';
	cpatreon = '\n' + animals.ranks.cpatreon + '    ';
	secret = '\n' + animals.ranks.legendary + '    ';
	secret2 = '\n' + animals.ranks.fabled + '    ';
	secret3 = '\n' + animals.ranks.special + '    ';
	secret4 = '\n' + animals.ranks.hidden + '    ';
	secret5 = '\n' + animals.ranks.gem + '    ';
	secret6 = '\n' + animals.ranks.bot + '    ';
	secret7 = '\n' + animals.ranks.distorted + '    ';
}
