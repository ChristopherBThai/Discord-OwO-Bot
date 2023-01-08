/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const cards = [
	{
		name: 'The World',
		emoji: '<a:world_card:754192174563721267>',
		desc: 'accomplishment, completion, life',
	},
	{
		name: 'The Sun',
		emoji: '<a:sun_card:754192174614052924>',
		desc: 'happiness, positivity, optimism',
	},
	{
		name: 'Strength',
		emoji: '<a:strength_card:754192174563721298>',
		desc: 'courage, bravery, confidence',
	},
	{
		name: 'The Ruler',
		emoji: '<a:ruler_card:754192174379302953>',
		desc: 'authority, control, structure',
	},
	{
		name: 'The Priestess',
		emoji: '<a:priestess_card:754192174995865661>',
		desc: 'sacred knowledge, higher self, faith',
	},
	{
		name: 'The Moon',
		emoji: '<a:moon_card:754192174492418128>',
		desc: 'intuition, clarity, peace',
	},
	{
		name: 'The Magician',
		emoji: '<a:magician_card:754192174534623263>',
		desc: 'power, talent, resourcefulness',
	},
	{
		name: 'The Lovers',
		emoji: '<a:lovers_card:754192174668841031>',
		desc: 'harmony, balance, love and support',
	},
	{
		name: 'Justice',
		emoji: '<a:justice_card:754192174828093451>',
		desc: 'truth, honesty, fairness',
	},
	{
		name: 'The Fool',
		emoji: '<a:fool_card:754192174563721217>',
		desc: 'innocence, recklessness, taking a risk',
	},
	{
		name: 'The Devil',
		emoji: '<a:devil_card:754192174048084019>',
		desc: 'attachment, strong ties, darkness',
	},
	{
		name: 'Death',
		emoji: '<a:death_card:754192173242646548>',
		desc: 'endings, transformation, change',
	},
];

module.exports = new CommandInterface({
	alias: ['tarot'],

	args: '{count} {question}',

	desc: 'Ask a question and answer them with tarot cards! This command was created by ?250383887312748545?',

	example: ['owo tarot 3 should I call my grandma?'],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 30000,

	execute: async function (p) {
		let count = 1;
		let question;

		if (p.global.isInt(p.args[0])) {
			if (p.args.length < 2) {
				p.errorMsg(', you need to add a question!');
				return;
			}
			count = parseInt(p.args[0]);
			question = p.args.slice(1).join(' ');
		} else {
			if (p.args.length < 1) {
				p.errorMsg(', you need to add a question!');
				return;
			}
			question = p.args.join(' ');
		}

		if (count <= 0 || count > cards.length) {
			p.errorMsg(`, invalid card count! Must be within 1 and ${cards.length}.`);
			return;
		}

		const embed = {
			color: p.config.embed_color,
			author: {
				name: `${p.msg.author.username} chose ${count} tarot card(s)`,
				icon_url: p.msg.author.avatarURL,
			},
			description: `*${question}*`,
			fields: [],
		};

		const cardCopy = [...cards];
		for (let i = 0; i < count; i++) {
			const card = cardCopy.splice(Math.floor(Math.random() * cardCopy.length), 1)[0];
			embed.fields.push({
				name: `${card.emoji} ${card.name}`,
				value: card.desc,
				inline: true,
			});
		}

		p.send({ embed });
	},
});
