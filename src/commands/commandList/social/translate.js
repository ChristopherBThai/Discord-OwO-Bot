/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const gtranslate = require('translate-google');

module.exports = new CommandInterface({
	alias: ['translate', 'listlang', 'tl'],

	args: '{msg} -{language}',

	desc: "Translates a message to a specific language. The default language will be english.\nUse 'owo listlang to list all the languages",

	example: ['owo translate Hello -ja', 'owo translate no hablo espanol -en'],

	related: ['owo listlang'],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['social'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: function (p) {
		if (p.command == 'listlang') listlang(p);
		else translate(p);
	},
});

function translate(p) {
	if (p.args.length == 0) {
		p.errorMsg(', please include a message to translate!', 3000);
		return;
	}
	//Get language
	let lang = p.args[p.args.length - 1];
	if (lang.charAt(0) == '-') {
		lang = lang.substring(1);
		p.args.pop();
	} else {
		lang = 'en';
	}

	//Get text
	let text = p.args.join(' ');
	if (text.length > 700) {
		p.errorMsg(', The message is too long!!', 3000);
		return;
	}
	let ptext = text;
	text = text.split(/(?=[?!.])/gi);
	text.push('');
	gtranslate(text, { to: lang })
		.then((res) => {
			let embed = {
				description: '' + res.join(' '),
				color: 4886754,
				footer: { text: 'Translated from "' + ptext + '"' },
			};
			p.send({ embed });
		})
		.catch(() => {
			p.errorMsg(', Could not find that language! Use `owo listlang` to see available languages');
		});
}

function listlang(p) {
	var text = 'Available languages: \n';
	var done = false;
	for (let key in gtranslate.languages) {
		if (key == 'zu') done = true;
		if (!done) text += '`' + key + '`-' + gtranslate.languages[key] + '  ';
	}
	p.send(text);
}
