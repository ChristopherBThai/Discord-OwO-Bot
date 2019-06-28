/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const mathjs = require('mathjs');
const mathEmoji = '<a:naruhodo:593971680737624065>';

module.exports = new CommandInterface({

	alias:["math","calc","calculate"],

	args:"{equation}",

	desc:"Let me do your math homework!",

	example:["owo math 2 + 2"],

	related:[],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		try{
			let result = mathjs.evaluate(p.args.join(' '));
			p.replyMsg(mathEmoji,", the answer is: **"+result+"**");
		}catch(e){
			p.errorMsg("... I don't think that's an equation silly head",3000);
		}
	}

})
