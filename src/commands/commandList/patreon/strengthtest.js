/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const hit = '█';
const miss = '░';
// I guess they never miss, huh? (im sorry)
const size = 10;
const blank = '<:blank:427371936482328596>';
const hammer = '🛎';
const geist = '220934553861226498';
const comments = [
	['yikes.', 'oh.', 'Why.. are you so weak...?'],
	['oh. Try harder next time', 'Do you even lift?', 'How do you even lift your arms?'],
	['Below average.', 'Seriously?', 'Try harder next time!'],
	['You should work out more...', 'Do you even work out?', "That's all you got...?"],
	['You did ok', "Could've been better.", 'meh'],
	['Average strength', "You're pretty average :/"],
	['Pretty decent!', 'Not bad!', 'Better than average!'],
	["Woah! That's still pretty good!", "Pretty strong aren't you? ;)", 'Wish I was strong as you!'],
	["You're still pretty strong! ;)", "WOW you're strong!", 'Can I feel your muscles? ;o'],
	['SO CLOSE!', 'You were almost there...', 'Just a little bit more!!'],
	["You're the strongest person alive!", "Oh my. You're so strong!"],
];

module.exports = new CommandInterface({
	alias: ['bell', 'strengthtest'],

	args: '',

	desc: 'Step right up! Test your strength in the bell game! This command was created by Geist!',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['patreon'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: async function (p) {
		let msgs = {};
		let poll = generatePoll(0, msgs);
		poll += blank + 'Step right up! Come test your strength!';
		let embed = {
			author: {
				icon_url: p.msg.author.avatarURL,
				name: p.msg.author.username + ' wants to test their strength!',
			},
			color: p.config.embed_color,
			description: poll,
		};

		let msg = await p.send({ embed });
		await msg.addReaction(hammer);
		let filter = (emoji, userID) => emoji.name === hammer && userID == p.msg.author.id;
		let collector = await p.reactionCollector.create(msg, filter, {
			time: 30000,
		});

		collector.on('collect', async function (_emoji) {
			collector.stop();
			let rand = Math.random();
			if (geist == p.msg.author.id) {
				rand = (80 + rand * 21) / 100;
			}
			poll = generatePoll(rand, msgs);
			poll += blank + 'Step right up! Come test your strength!';
			embed.description = poll;
			msg.edit({ embed });
		});
	},
});

function generatePoll(percent, msgs) {
	let result = '\\🔔\n';
	let hitSize = Math.floor(percent * size);
	let count = 1;
	if (percent != 0 && !hitSize) hitSize = 1;

	for (let i = 0; i < size - hitSize; i++) {
		let extra = '';
		if (msgs[count]) extra = msgs[count];
		result += miss + extra + '\n';
		count++;
	}

	let msg = getMessage(percent);

	for (let i = 0; i < hitSize; i++) {
		let extra = '';
		if (msgs[count]) extra = msgs[count];
		result += hit + extra + ' ' + msg + '\n';
		msg = '';
		count++;
	}
	return result;
}

function getMessage(percent) {
	if (percent > 1) percent = 1;
	percent *= 10;
	let msg = comments[Math.floor(percent)];
	msg = msg[Math.floor(Math.random() * msg.length)];
	percent = Math.floor(percent * 10);
	if (percent == 99) msg = "You almost hit the bell, but couldn't quite do it...";
	return percent + '/100 ' + msg;
}
