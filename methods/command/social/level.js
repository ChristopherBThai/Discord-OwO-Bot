/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');
const imagegenAuth = require('../../../../tokens/imagegen.json');
const levelUtil = require('./util/levelUtil.js');

module.exports = new CommandInterface({

	alias:["level","lvl","levels","xp"],

	args:"{server}",

	desc:"Display your Level!",

	example:["owo level","owo level server"],

	related:[],

	cooldown:15000,
	half:100,
	six:500,

	execute: async function(p){
		try{
			let opt = {};
			if(p.args[0]=='s'||p.args[0]=="server"||p.args[0]=='g'||p.args[0]=="guild"){
				opt.guild = true;
			}
			let uuid = await levelUtil.display(p,p.msg.author,opt);

			if(!uuid){
				p.errorMsg(", I could not generate the image...",3000);
				return;
			}

			let url = imagegenAuth.imageGenUrl+'/level/'+uuid+'.png';
			let warning = '⚠';
			await p.send(warning+" **|** THIS COMMAND IS STILL A WORK IN PROGRESS",null,{files:[url]});
		}catch(e){
			console.error(e);
			p.errorMsg(", failed to create level image... Try again later :(",3000);
		}
	}

})

