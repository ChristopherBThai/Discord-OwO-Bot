/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');
const imagegen = require('../battle/battleImage.js');
const mysql = require('../../../util/mysql.js');

const captcha = require('../../../../tokens/captcha.js');
const nodeEmoji = require('node-emoji');

module.exports = new CommandInterface({

	alias:["testcommand","tc"],

	admin:true,

	execute: async function(p){
		let text = p.args;
		let emojis = {};
		for(let i in text){
			let name = nodeEmoji.find(text[i]);
			emojis[text[i]] = {
				"unicode":text[i],
				"name":name.key,
				"base":"",
				"eyes":"",
				"mouth":"",
				"detail":""
			}
		}
		let result = "```js\n"+JSON.stringify(emojis,null,"  ")+"\n```";
		p.send(result);
	}
})
