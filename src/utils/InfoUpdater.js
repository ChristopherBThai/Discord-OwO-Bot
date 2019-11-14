/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const interval = 300000;
const request = require('request');
const secret = require('../../../tokens/wsserver.json');

class InfoUpdater{
	constructor(main){
		this.main = main;
		setInterval(() => {
			this.update();
		},interval);
	}

	update(){
		let info = {
			password:secret.password,
			guilds:this.main.bot.guilds.size,
			channels:0,
			users:this.main.bot.users.size
		};

		request({
			method:'POST',
			uri:secret.url+"/update-bot/"+this.main.bot.clusterID,
			json:true,
			body: info,
		},function(err,res,body){
			if(err) {
				console.error(err);
				throw err;
			}
		});
	}

}

module.exports = InfoUpdater;
