/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["merch"],

	args:"",

	desc:"Come take a look at OwO's avatar's merch store!",

	example:[],

	related:[],

	permissions:["sendMessages","embedLinks"],

	cooldown:6000,
	half:100,
	six:500,

	execute: function(p){
		let embed = {
			"color": p.config.embed_color,
			"author": {
				"name": p.msg.author.username+"! Come check out some merch!",
				"icon_url":p.msg.author.avatarURL,
			},
			"description":"Want to support the OwO's avatar's creator? Come check out his merch!\n**Shirts**: https://rdbl.co/2U5Xd9x\n**Stickers**: https://rdbl.co/2T9EM6w",
		};
		p.send({embed});
	}

})
