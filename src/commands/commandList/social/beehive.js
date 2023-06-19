/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const beehiveUtil = require('./util/beehiveUtil.js');

const honeyEmoji = '🍯';
const combEmoji = '<:comb:1113724195155738675>';

module.exports = new CommandInterface({
	alias: ['beehive', 'hive', 'bh'],

	args: '',

	desc: 'Display your pride-ful bees! These bees can only be obtained during certain weeks of pride month.',

	example: ['owo beehive'],

	related: [],

	permissions: ['sendMessages'],

	group: ['social'],

	cooldown: 3000,
	half: 100,
	six: 500,

	execute: async function () {
		const { bees, total } = await beehiveUtil.getBees(this.msg.author.id);

		if (!total) {
			return this.errorMsg(', you do not have any bees!', 3000);
		}

		const digits = getDigits(bees);
		let text = `**${honeyEmoji} ${this.getName()}'s Beehive ${honeyEmoji}**\n${
			this.config.emoji.blank
		} ${combEmoji} ${combEmoji} ${combEmoji} ${combEmoji} ${combEmoji} ${
			this.config.emoji.blank
		}\n${combEmoji}  `;

		let count = 0;
		for (let i in bees) {
			const bee = bees[i];
			if (count !== 0 && count % 4 == 0) {
				text += ` ${combEmoji}\n${combEmoji}  `;
			}
			text += `${bee.emoji}${this.global.toSmallNum(bee.count, digits)} `;
			count++;
		}
		const blankCount = count % 4 === 0 ? 0 : 4 - (count % 4);
		text += `${this.config.emoji.blank}  `.repeat(blankCount);
		if (blankCount === 3) {
			text += ' ';
		}
		text += ` ${combEmoji}\n${this.config.emoji.blank} ${combEmoji} ${combEmoji} ${combEmoji} ${combEmoji} ${combEmoji} ${this.config.emoji.blank}\n`;
		text += `**Total bees:** ${this.global.toFancyNum(total)}`;

		this.send(text);
	},
});

function getDigits(bees) {
	let biggest = 1;
	for (let i in bees) {
		if (bees[i].count > biggest) {
			biggest = bees[i].count;
		}
	}
	return Math.trunc(Math.log10(biggest) + 1);
}
