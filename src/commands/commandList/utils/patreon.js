/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const patreonUtil = require('../patreon/utils/patreonUtil.js');

module.exports = new CommandInterface({
	alias: ['patreon', 'donate', 'support', 'supporter'],

	args: '',

	desc: 'Donate to OwO Bot to help support its growth! Any donations will come with special benefits!',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['utility'],

	cooldown: 10000,
	half: 80,
	six: 500,

	execute: async function (p) {
		delete p.msg.author.supporterRank;
		const supporter = await patreonUtil.getSupporterRank(p, p.msg.author);

		let stat = 'Join today for special animals and benefits!';
		const timestamp = this.global.toDiscordTimestamp(new Date(supporter.endTime), 'f');
		if (supporter.benefitRank >= 3) {
			stat = 'You are currently a **Supporter+**!';
			stat += '\n**<:blank:427371936482328596> |** until: **' + timestamp + '**';
		} else if (supporter.benefitRank >= 1) {
			stat = 'You are currently a **Supporter**!';
			stat += '\n**<:blank:427371936482328596> |** until: **' + timestamp + '**';
		}

		let content = `**${this.config.emoji.owo.woah} |** Donate to OwO Bot for special benefits!\n**${this.config.emoji.blank} |** ${stat}`;
		content += `\n**${this.config.emoji.blank} |** Join by clicking my profile or one of the following choices below!`;
		const components = [
			{
				type: 1,
				components: [
					{
						type: 2,
						label: 'Patreon',
						style: 5,
						url: 'https://www.patreon.com/OwOBot'
					},
					{
						type: 2,
						label: 'OwO Store',
						style: 5,
						url: 'https://owobot.com/store'
					}
				],
			},
		]
		p.send({ content, components });
	},
});
