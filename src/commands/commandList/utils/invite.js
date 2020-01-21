/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const permissions = require('../../../data/permissions.json');

module.exports = new CommandInterface({

	alias:["invite","link"],

	args:"",

	desc:"Want to invite this bot to another server? Use this command!",

	example:[],

	related:["owo guildlink"],

	permissions:["sendMessages","embedLinks"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		let link = p.config.invitelink;
		let embed = {
			"title":"OwO! Click me to invite me to your server!",
			"url":link,
			"color": 4886754,
			"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
		};
		p.send({embed});
	}

})
