/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');
const imagegen = require('../battle/battleImage.js');
const patreon = require('../../../handler/patreonHandler.js');
const mysql = require('../../../util/mysql.js');

const captcha = require('../../../../tokens/captcha.js');

module.exports = new CommandInterface({

	alias:["testcommand","tc"],

	admin:true,

	execute: async function(p){
		let data = await captcha();
		p.send({files:[data.buffer]});
		
	}
})
