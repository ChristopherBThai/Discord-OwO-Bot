/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const profileUtil = require('./util/profileUtil.js');
const imagegenAuth = require('../../../../tokens/imagegen.json');

module.exports = new CommandInterface({

	alias:["profile"],

	args:"",

	desc:"Display your profile!",

	example:[],

	related:[],

	cooldown:60000,
	half:100,
	six:500,

	execute: async function(p){
		try{
			let uuid = await profileUtil.display(p);
			let url = imagegenAuth.imageGenUrl+'/profile/'+uuid+'.png';
			if(uuid)
				let warning = '⚠';
				await p.send(warning+" **|** THIS COMMAND IS STILL A WORK IN PROGRESS",{files:[url]});
			else
				throw "Not found"
		}catch(e){
			console.log(e);
			p.errorMsg(", failed to create profile image... Try again later :(",3000);
		}
	}

})
