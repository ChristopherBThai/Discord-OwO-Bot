/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const owners = ['460987842961866762'];
const desc =
	"The passage of time is explored through the journey of life. A quest to find the precious gemstones that represents one's birth. Months may pass and possibly a life time to complete. Unlock two hidden gemstones, moonstone & sunstone once you have completed the twelve; Garnet, Amethyst, Aquamarine, Diamond, Emerald, Pearl, Ruby, Peridot, Sapphire, Opal, Citrine, Topaz.";

let ownersString = `?${owners[owners.length - 1]}?`;
if (owners.slice(0, -1).length) {
	ownersString = `?${owners.slice(0, -1).join('?, ?')}?, and ${ownersString}`;
}
const data = 'gemstones';

const birthstones = {
	garnet: {
		emoji: '<:garnet:1288024404328058920>',
		name: 'Garnet',
		text: 'You have been given  love, friendship and loyalty.',
	},
	amethyst: {
		emoji: '<:amethyst:1288024398745567303>',
		name: 'Amethyst',
		text: 'You have been given peace, serenity and royalty.',
	},
	aquamarine: {
		emoji: '<:aquamarine:1288024517175808000>',
		name: 'Aquamarine',
		text: 'You have been given youth, honesty and truth.',
	},
	diamond: {
		emoji: '<:diamond:1288024409185062922>',
		name: 'Diamond',
		text: 'You have been given Stone of commitment, endless and promise.',
	},
	emerald: {
		emoji: '<:emerald:1288024403137007670>',
		name: 'Emerald',
		text: 'You have been given Signifies elegance, prosperity and health.',
	},
	pearl: {
		emoji: '<:pearl:1288024396900077578>',
		name: 'Pearl',
		text: 'You have been given Stone of purity, beauty and growth.',
	},
	ruby: {
		emoji: '<:ruby:1288024412855078952>',
		name: 'Ruby',
		text: 'You have been given Stone of harmony, passion and power.',
	},
	peridot: {
		emoji: '<:peridot:1288024518371311769>',
		name: 'Peridot',
		text: 'You have been given Stone of protection, repels nighttime evil spirits.',
	},
	sapphire: {
		emoji: '<:sapphire:1288024401677389856>',
		name: 'Sapphire',
		text: 'You have been given wisdom, nobility and royalty.',
	},
	opal: {
		emoji: '<:opal:1288024395394060288>',
		name: 'Opal',
		text: 'You have been given Stone of healing, energy and hope.',
	},
	citrine: {
		emoji: '<:citrine:1288024519944048702>',
		name: 'Citrine',
		text: 'You have been given Stone of inspiration, strength and success.',
	},
	topaz: {
		emoji: '<:topaz:1288024405624094804>',
		name: 'Topaz',
		text: 'You have been given Stone of clarity, wealth and good fortune.',
	},
	moonstone: {
		emoji: '<:moonstone:1288024400171503628>',
		name: 'Moonstone',
		text: 'You have been given Stone of night, divinity and calmness.',
	},
	sunstone: {
		emoji: '<:sunstone:1288024393573990401>',
		name: 'Sunstone',
		text: 'You have been given Stone of day, blessing and brightness.',
	},
};
for (let key in birthstones) {
	birthstones[key].key = key;
}

module.exports = new CommandInterface({
	alias: ['birthstone', 'bstone', 'bsn'],

	args: '',

	desc: `${desc}\n\nThis command was created by ${ownersString}`,

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 15000,

	execute: async function () {
		if (!this.args.length) {
			display.bind(this)(this);
			this.setCooldown(5);
		} else {
			if (!owners.includes(this.msg.author.id)) {
				this.errorMsg(', only the owner of this command can give items!', 3000);
				this.setCooldown(5);
				return;
			}
			let user = this.getMention(this.args[1]);
			let birthstone = birthstones[this.args[0].toLowerCase()];
			if (!user) {
				user = await this.fetch.getMember(this.msg.channel.guild, this.args[1]);
				if (!user) {
					this.errorMsg(', Invalid syntax! Please tag a user!', 3000);
					this.setCooldown(5);
					return;
				}
			}
			if (!birthstone) {
				this.errorMsg(', Invalid syntax! Please mention a birthstone!', 3000);
				this.setCooldown(5);
				return;
			}

			give.bind(this)(birthstone, user);
		}
	},
});

async function getStones(id) {
	const stones = JSON.parse((await this.redis.hget('data_' + id, data)) || '{}');
	for (let key in birthstones) {
		if (!stones[key]) {
			stones[key] = 0;
		}
	}
	return stones;
}

async function display() {
	const stones = await getStones.bind(this)(this.msg.author.id);
	let msg = '';
	let count = 0;
	for (let key in stones) {
		if (stones[key]) {
			msg += birthstones[key].emoji + this.global.toSmallNum(stones[key]) + ' ';
			count++;
			if (count % 7 == 0) {
				msg += '\n';
			}
		}
	}
	if (count === 0) {
		msg = 'You do not have any birthstones.';
	}
	const header =
		'<a:dot1:1288035451617415250> <a:heart:1288035454138191893> <a:arrow1:1288035456994508822> 𝔹𝕚𝕣𝕥𝕙𝕤𝕥𝕠𝕟𝕖𝕤 <a:arrow2:1288035459288666183> <a:heart:1288035454138191893> <a:dot1:1288035451617415250>\n<:dash:1288035452405944322> <a:dot2:1288035455761121300> <:arrow3:1288035458235895828> <a:dot2:1288035455761121300> <:arrow4:1288035450446942281> <a:dot2:1288035455761121300> <:dash:1288035452405944322> <a:dot2:1288035455761121300> <:arrow3:1288035458235895828> <a:dot2:1288035455761121300> <:arrow4:1288035450446942281> <:dash:1288035452405944322>\n';

	this.send(header + msg);
}

async function give(birthstone, user) {
	const stones = await getStones.bind(this)(user.id);
	stones[birthstone.key]++;
	await this.redis.hset('data_' + user.id, data, JSON.stringify(stones));
	this.send(`${birthstone.emoji} **| ${user.username}**, ${birthstone.text}`);
}
