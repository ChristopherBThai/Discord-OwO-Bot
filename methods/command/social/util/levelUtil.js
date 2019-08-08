/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const request = require('request');
const imagegenAuth = require('../../../../../tokens/imagegen.json');
const levels = require('../../../../util/levels.js');

exports.display = async function(p,user){
	/* Construct json for POST request */
	let info = await generateJson(p,user);
	info.password = imagegenAuth.password;

	/* Returns a promise to avoid callback hell */
	try{
		return new Promise( (resolve, reject) => {
			let req = request({
				method:'POST',
				uri:imagegenAuth.levelImageUri,
				json:true,
				body: info,
			},(error,res,body)=>{
				if(error){
					resolve("");
					return;
				}
				if(res.statusCode==200)
					resolve(body);
				else
					resolve("");
			});
		});
	}catch (err){
		console.err(err);
		return "";
	}
}

async function generateJson(p,user){
	let avatarURL = user.avatarURL()
	if(!avatarURL) avatarURL= user.defaultAvatarURL;
	avatarURL = avatarURL.replace('.gif','.png').replace(/\?[a-zA-Z0-9=?&]+/gi,'');

	let promises = [getRank(p,user),getBackground(p,user),levels.getUserLevel(user.id),getInfo(p,user)]
	promises = await Promise.all(promises);

	let rank = promises[0];
	let background = promises[1];
	let level = promises[2];
	let userInfo = promises[3];

	let aboutme = userInfo.about;
	let accent = userInfo.accent;
	let accent2 = userInfo.accent2;

	level = {lvl:level.level,maxxp:level.maxxp,currentxp:level.currentxp}

	return {
		theme:{
			background:background.id,
			name_color:background.color,
			accent,accent2
		},
		user:{
			avatarURL,
			name:user.username,
			discriminator:user.discriminator,
			title:'An OwO Bot User'
		},
		aboutme,
		level,
		rank,
	}
}

async function getRank(p,user){
	let rank = p.global.toFancyNum(await levels.getUserRank(user.id));
	return {
		img:'trophy.png',
		text:'#'+rank
	}
}

function shortenInt(value){
	let newValue = value;
	if (value >= 1000) {
		let suffixes = ["", "K", "M", "B","T"];
		let suffixNum = Math.floor( ((""+value).length-1)/3 );
		let shortValue = value/Math.pow(10,suffixNum*3);
		let offset = Math.pow(10,2-Math.floor(Math.log10(shortValue)));
		if(offset==0)
			shortValue = Math.round(shortValue);
		else
			shortValue = Math.round(shortValue*offset)/offset
		newValue = shortValue+suffixes[suffixNum];
	}
	return newValue;
}

async function getBackground(p,user){
	let random = Math.floor(Math.random()*8)+1
	let sql = `SELECT name_color FROM backgrounds WHERE bid = ${random};`
	let result = await p.query(sql);
	return {id:random,color:result[0].name_color};
}

async function getInfo(p,user){
	let sql = `SELECT user_profile.* from user_profile INNER JOIN user ON user.uid = user_profile.uid WHERE user.id = ${user.id};`;
	let result = await p.query(sql);
	let info = {
		about:"I'm just a plain human."
	};
	if(result[0]){
		if(result[0].about)
			info.about = result[0].about;
		if(result[0].accent)
			info.accent = result[0].accent;
		if(result[0].accent2)
			info.accent2 = result[0].accent2;
	}
	return info;
}
