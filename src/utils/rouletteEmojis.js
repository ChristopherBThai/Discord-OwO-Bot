/*
 * Chip emojis for the roulette buttons.
 *
 * Buttons can not contain images, only emojis. The chip icons are drawn with canvas and
 * uploaded once as the bot's application emojis (they work in every server and do not need
 * a server with free emoji slots). Existing ones are reused, so nothing is uploaded twice.
 */

const fs = require('fs');
const path = require('path');
const { http } = require('./discordHttp.js');
const table = require('./rouletteTable.js');

const API = 'https://discord.com/api/v10';
const prefix = 'roulette_chip_';

const spinName = 'roulette_spin';
const spinGifPath = path.join(__dirname, '../../resim/gif/emoji_cark.gif');

let cache = null;
let pending = null;
let spinCache = null;
let spinPending = null;

async function load(client) {
	const appId = (client.application && client.application.id) || client.user.id;
	const token = client._token.startsWith('Bot ') ? client._token : `Bot ${client._token}`;
	const config = { headers: { Authorization: token }, timeout: 15000 };
	const url = `${API}/applications/${appId}/emojis`;

	const { data } = await http.get(url, config);
	const existing = {};
	for (const emoji of data.items || []) existing[emoji.name] = emoji;

	const result = {};
	for (const amount of table.CHIPS) {
		const name = prefix + amount;
		let emoji = existing[name];
		if (!emoji) {
			const image = `data:image/png;base64,${table.drawChipIcon(amount).toString('base64')}`;
			emoji = (await http.post(url, { name, image }, config)).data;
		}
		result[amount] = { id: emoji.id, name: emoji.name };
	}
	return result;
}

async function loadSpin(client) {
	const appId = (client.application && client.application.id) || client.user.id;
	const token = client._token.startsWith('Bot ') ? client._token : `Bot ${client._token}`;
	const config = { headers: { Authorization: token }, timeout: 20000 };
	const url = `${API}/applications/${appId}/emojis`;

	const { data } = await http.get(url, config);
	let emoji = (data.items || []).find((e) => e.name === spinName);
	if (!emoji) {
		const gif = await fs.promises.readFile(spinGifPath);
		const image = `data:image/gif;base64,${gif.toString('base64')}`;
		emoji = (await http.post(url, { name: spinName, image }, config)).data;
	}
	return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

/**
 * Animated wheel emoji (resim/gif/emoji_cark.gif) as an application emoji, uploaded once.
 * Returns the emoji text like `<a:roulette_spin:123>`, or an empty string if it failed.
 */
exports.getSpinEmoji = function (client) {
	if (spinCache !== null) return Promise.resolve(spinCache);
	if (!spinPending) {
		spinPending = loadSpin(client)
			.then((result) => (spinCache = result))
			.catch((e) => {
				console.error('[roulette] could not create spin emoji:', e.response?.data || e);
				return '';
			})
			.finally(() => {
				spinPending = null;
			});
	}
	return spinPending;
};

/**
 * Returns `{ [chipAmount]: { id, name } }`. Returns an empty object if the emojis
 * could not be created, so the game still works (buttons just have no chip icon).
 */
exports.getChipEmojis = function (client) {
	if (cache) return Promise.resolve(cache);
	if (!pending) {
		pending = load(client)
			.then((result) => (cache = result))
			.catch((e) => {
				console.error('[roulette] could not create chip emojis:', e.response?.data || e);
				return {};
			})
			.finally(() => {
				pending = null;
			});
	}
	return pending;
};
