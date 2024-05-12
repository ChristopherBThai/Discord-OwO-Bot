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
	alias: ['zoo', 'z', 'z2'],

	args: '{display}',

	desc: "Displays your zoo! Some animals are rarer than others! Use the 'display' args to display all your animals from your history!",

	example: ['owo zoo', 'owo zoo display'],

	related: ['owo hunt', 'owo sell'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 45000,
	half: 20,
	six: 100,

	execute: async function () {
		const { userAnimals, animalCount, biggest } = await fetchZoo.bind(this)();

		const header = '🌿 🌱 🌳** ' + this.getName() + "'s zoo! **🌳 🌿 🌱\n";
		const body = createBody.bind(this)(userAnimals, biggest);
		const paged = true;
		const footer = createFooter.bind(this)(animalCount, paged);

		sendZooMessage.bind(this)(header, body, footer, paged);
	},
});

/**
 * Send the emssage to channel
 */
function sendZooMessage(header, text, footer, paged) {
	let zooText = header + text + footer;
	zooText = alterZoo.alter(this.msg.author.id, zooText, {
		user: this.msg.author,
	});

	if (paged) {
		let pages = toPages(text);
		sendPages(this, pages, header, footer);
	} else {
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

	if (['display', 'd'].includes(this.args[0]?.toLowerCase())) {
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
		rankAnimals.forEach((animal) => {
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

	if (paged) {
		footer += `\nZoo Points: ${this.global.toFancyNum(total)}\n\t`;
		footer += animalUtil.zooScore(count);
	} else {
		footer += `\n**Zoo Points: __${this.global.toFancyNum(total)}__**\n\t**`;
		footer += `${animalUtil.zooScore(count)}**`;
	}

	return footer;
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

async function sendPages(p, pages, header, footer) {
	const createEmbed = (curr, _max) => {
		return toEmbed(p, header, pages, footer, curr);
	};
	new p.PagedMessage(p, createEmbed, pages.length - 1, { idle: 120000 });
}

function toEmbed(p, header, pages, footer, loc) {
	let embed = {
		description: pages[loc].trim(),
		color: p.config.embed_color,
		author: {
			name: header.replace(/\*\*/gi, ''),
			icon_url: p.msg.author.avatarURL,
		},
		footer: {
			text: `${footer}\n\nPage ${loc + 1}/${pages.length}`,
		},
	};
	return embed;
}
