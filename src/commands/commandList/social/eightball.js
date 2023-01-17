/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const eightballEmoji = '🎱';
const pronouns = [
	'silly',
	'senpai',
	'daddy',
	'mommy',
	'dad',
	'mom',
	'master',
	'nii-san',
	'onee-san',
	'love',
	"ma'am",
	'sir',
	'friend',
	'b-baka',
	'honey',
];
const answer = [
	'nu',
	'yus',
	'yes',
	'no',
	'never',
	'of course',
	'hell yeah',
	'hell no',
	'negative',
	'positive',
	'not today',
	'only today',
	'sadly yes',
	'sadly no',
	'maybe',
	'you bet',
	'not a chance',
	"it's a secret",
	'only for today',
];
const faces = [
	'^_^',
	'UwU',
	'OwO',
	':(',
	':)',
	';c',
	'c;',
	':c',
	'c:',
	'._.',
	'.-.',
	'xD',
	':x',
	';x',
	'>///<',
	';-;',
	'( ͡° ͜ʖ ͡°)',
];
const result = [
	'?a? ?p?...',
	'?f? ?a? ?p?!!',
	'?a?',
	'?a?.',
	'?a?!!',
	'?p?... ?a?',
	'?a?! ?f?',
	"don't tell anyone but ?a? ?f?",
];

module.exports = new CommandInterface({
	alias: ['eightball', '8b', 'ask', '8ball'],

	args: '{question}',

	desc: 'Ask a question and get an answer!',

	example: ['owo 8b Am I cute?'],

	related: [],

	permissions: ['sendMessages'],

	group: ['fun'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: function (p) {
		if (p.args.length <= 0) {
			p.errorMsg('You need to ask a question silly!', 3000);
			return;
		}

		let question = p.args.join(' ');
		let reply = getAnswer();
		p.replyMsg(
			eightballEmoji,
			p.replaceMentions(
				' **asked:** ' + question + '\n' + p.config.emoji.blank + ' **| Answer:** ' + reply
			)
		);
	},
});

function getAnswer() {
	let reply = result[Math.floor(Math.random() * result.length)];
	reply = reply
		.replace('?a?', answer[Math.floor(Math.random() * answer.length)])
		.replace('?p?', pronouns[Math.floor(Math.random() * pronouns.length)])
		.replace('?f?', faces[Math.floor(Math.random() * faces.length)]);
	return reply;
}
