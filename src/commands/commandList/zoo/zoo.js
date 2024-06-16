/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

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
let preBuiltDisplay = {};
initDisplay();

module.exports = new CommandInterface({
	alias: ['zoo', 'z'],

	args: '{display}',

	desc: "Displays your zoo! Some animals are rarer than others! Use the 'display' args to display all your animals from your history!",

	example: ['owo zoo', 'owo zoo -display', 'owo zoo -nopages'],

	related: ['owo hunt', 'owo sell'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 45000,
	half: 20,
	six: 100,

	execute: async function () {
		const flags = this.getFlags();
		const { userAnimals, animalCount, biggest } = await fetchZoo.bind(this)();

		const header = '🌿 🌱 🌳** ' + this.getName() + "'s zoo! **🌳 🌿 🌱\n";
		const body = createBody.bind(this)(userAnimals, biggest);
		let paged = false;
		if (!(flags.nopage || flags.nopages) && body?.length > 15000) {
			paged = true;
		}
		const { footer, score, scoreText } = createFooter.bind(this)(animalCount, paged);

		const alterInfo = {
			user: this.msg.author,
			animalCount,
			paged,
			zooPoints: score,
			countText: scoreText,
			animals: body,
		};
		sendZooMessage.bind(this)(header, body, footer, paged, alterInfo);
	},
});

/**
 * Send the emssage to channel
 */
async function sendZooMessage(header, text, footer, paged, alterInfo) {
	if (paged) {
		let pages = toPages(text);
		sendPages(this, pages, header, footer, alterInfo);
	} else {
		let zooText = header + text + footer;
		zooText = await alterZoo.alter(this, this.msg.author.id, zooText, alterInfo);
		this.send(zooText);
	}
}

/**
 * Fetches zoo from db
 */
async function fetchZoo() {
	let sql = `SELECT totalcount, count, animal.name, rank FROM animal INNER JOIN animals ON animal.name = animals.name WHERE id = ${this.msg.author.id};`;
	sql += `SELECT * FROM animal_count WHERE id = ${this.msg.author.id};`;
	const result = await this.query(sql);

	if (this.flags.display || ['display', 'd'].includes(this.args[0]?.toLowerCase())) {
		result[0].forEach((animal) => {
			animal.count = animal.totalcount;
		});
	}

	let biggest = 0;
	for (let i in result[0]) {
		if (result[0][i].count > biggest) biggest = result[0][i].count;
	}

	return {
		userAnimals: result[0],
		animalCount: result[1][0],
		biggest: biggest,
	};
}

/**
 * Creates body text for zoo
 */
function createBody(userAnimals, biggest) {
	const digits = Math.trunc(Math.log10(biggest || 1) + 1);

	let body = '';

	const animalGrouping = {};
	userAnimals.forEach((userAnimal) => {
		const animalRank = userAnimal.rank;
		if (!animalGrouping[animalRank]) {
			animalGrouping[animalRank] = [];
		}
		animalGrouping[animalRank].push(userAnimal);
	});

	animals.order.forEach((rank) => {
		const rankAnimals = animalGrouping[rank];
		let text = getRankRow.bind(this)(rank, rankAnimals, digits);
		if (text) {
			body += '\n' + text;
		}
	});
	body = body.replace(/~:[a-zA-Z_0-9]+:/g, animals.question + this.global.toSmallNum(0, digits));
	return body.trim();
}

/**
 * Creates row text for a single rank
 */
function getRankRow(rank, rankAnimals, digits) {
	let text = '';
	if (preBuiltDisplay[rank]) {
		text += preBuiltDisplay[rank];
		rankAnimals?.forEach((animal) => {
			text = text.replace(
				'~' + animal.name,
				this.global.unicodeAnimal(animal.name) + this.global.toSmallNum(animal.count, digits)
			);
		});
	} else {
		if (!rankAnimals) {
			return;
		}
		text += `${animals.ranks[rank]}    `;
		for (let i = 0; i < rankAnimals.length; i++) {
			const animal = rankAnimals[i];
			if (i && i % 5 === 0) {
				text += '\n<:blank:427371936482328596>    ';
			}
			text += animal.name + this.global.toSmallNum(animal.count, digits) + '  ';
		}
	}
	return text;
}

/**
 * Creates footer text for zoo
 */
function createFooter(count, paged) {
	let footer = '';

	let total = 0;
	for (let rank in count) {
		if (!['id', 'total'].includes(rank)) {
			total += count[rank] * animals.points[rank];
		}
	}

	const scoreText = animalUtil.zooScore(count);
	if (paged) {
		footer += `\nZoo Points: ${this.global.toFancyNum(total)}\n\t`;
		footer += scoreText;
	} else {
		footer += `\n**Zoo Points: __${this.global.toFancyNum(total)}__**\n\t**`;
		footer += `${scoreText}**`;
	}

	return {
		footer,
		score: this.global.toFancyNum(total),
		scoreText,
	};
}

function initDisplay() {
	let commonDisplay = `${animals.ranks.common}   `;
	for (let i = 1; i < animals.common.length; i++) {
		commonDisplay += `~${animals.common[i]}  `;
	}

	let uncommonDisplay = `${animals.ranks.uncommon}   `;
	for (let i = 1; i < animals.uncommon.length; i++) {
		uncommonDisplay += `~${animals.uncommon[i]}  `;
	}

	let rareDisplay = `${animals.ranks.rare}   `;
	for (let i = 1; i < animals.rare.length; i++) {
		rareDisplay += `~${animals.rare[i]}  `;
	}

	let epicDisplay = `${animals.ranks.epic}   `;
	for (let i = 1; i < animals.epic.length; i++) {
		epicDisplay += `~${animals.epic[i]}  `;
	}

	let mythicalDisplay = `${animals.ranks.mythical}   `;
	for (let i = 1; i < animals.mythical.length; i++) {
		mythicalDisplay += `~${animals.mythical[i]}  `;
	}

	preBuiltDisplay = {
		common: commonDisplay,
		uncommon: uncommonDisplay,
		rare: rareDisplay,
		epic: epicDisplay,
		mythical: mythicalDisplay,
	};
}

function toPages(text) {
	text = text.split('\n');
	let pages = [];
	let page = '';
	const max = 4000;
	for (let i in text) {
		if (page.length + text[i].length >= max) {
			pages.push(page);
			page = text[i];
		} else {
			page += '\n' + text[i];
		}
	}
	if (page != '') pages.push(page);
	return pages;
}

async function sendPages(p, pages, header, footer, alterInfo) {
	const formattedPages = await formatPages(p, header, pages, footer, alterInfo);
	const createEmbed = (curr, _max) => {
		return formattedPages[curr];
	};
	new p.PagedMessage(p, createEmbed, formattedPages.length - 1, { idle: 120000 });
}

async function formatPages(p, header, pages, footer, alterInfo) {
	const formattedPages = [];
	for (let i in pages) {
		formattedPages.push(await toEmbed(p, header, pages, footer, i, alterInfo));
	}
	return formattedPages;
}

async function toEmbed(p, header, pages, footer, loc, alterInfo) {
	const alterEmbed = await alterZoo.alter(p, p.msg.author.id, null, {
		currentPage: loc + 1,
		maxPages: pages.length,
		...alterInfo,
		animals: pages[loc].trim()
	});
	if (alterEmbed) {
		return alterEmbed;
	}

	let embed = {
		description: pages[loc].trim(),
		color: p.config.embed_color,
		author: {
			name: header.replace(/\*\*/gi, ''),
			icon_url: p.msg.author.avatarURL,
		},
		footer: {
			text: `${footer}\n\nPage ${parseInt(loc) + 1}/${pages.length}`,
		},
	};
	return embed;
}
