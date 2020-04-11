/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const captcha = require('../../../../../tokens/captcha.js');

module.exports = new CommandInterface({

	alias:["captcha"],

	admin:true,
	mod:true,
	dm:true,

	execute: async function(p){
		let {text, buffer} = await captcha();
		p.send(text,null,{file:buffer,name:"captcha.png"});
	}

})
