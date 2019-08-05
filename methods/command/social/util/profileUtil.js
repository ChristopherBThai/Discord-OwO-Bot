/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const request = require('request');
const imagegenAuth = require('../../../../../tokens/imagegen.json');
const rings = require('../../../../json/rings.json');
const levels = require('../../../../util/levels.js');
const animalUtil = require('../../battle/util/animalUtil.js');

exports.display = async function(p,user){
	/* Construct json for POST request */
	let info = await generateJson(p,user);
	info.password = imagegenAuth.password;

	/* Returns a promise to avoid callback hell */
	try{
		return new Promise( (resolve, reject) => {
			let req = request({
				method:'POST',
				uri:imagegenAuth.profileImageUri,
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

	let promises = [getMarriage(p,user),getRank(p,user),getCookie(p,user),getTeam(p,user),getBackground(p,user),levels.getUserLevel(user.id),getInfo(p,user)]
	promises = await Promise.all(promises);

	let marriage = promises[0];
	let rank = promises[1];
	let cookie = promises[2];
	let team = promises[3];
	let background = promises[4];
	let level = promises[5];
	let userInfo = promises[6];

	let aboutme = userInfo.about;
	let accent = userInfo.accent;
	let accent2 = userInfo.accent2;

	level = {lvl:level.level,maxxp:level.maxxp,currentxp:level.currentxp}

	let info = [];
	if(rank) info.push(rank);
	if(cookie) info.push(cookie);
	if(marriage) info.push(marriage);

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
		info,
		team,
		rank,
		cookie,
		marriage
	}
}

function getRank(p,user){
	return {
		img:'trophy.png',
		text:'#1'
	}
}

async function getCookie(p,user){
	let result = await p.query(`SELECT count FROM rep WHERE id = ${user.id};`);
	if(!result||!result[0]) return { img:'cookie.png', text:'+0' };

	let count = result[0].count;
	count = '+'+shortenInt(count);
	return { img:'cookie.png',text:count };
}

async function getMarriage(p,user){
	let sql = `SELECT 
			u1.id AS id1,u2.id AS id2,TIMESTAMPDIFF(DAY,marriedDate,NOW()) as days,marriage.* 
		FROM marriage 
			LEFT JOIN user AS u1 ON marriage.uid1 = u1.uid 
			LEFT JOIN user AS u2 ON marriage.uid2 = u2.uid 
		WHERE u1.id = ${user.id} OR u2.id = ${user.id};`;
	let result = await p.query(sql);

	if(result.length<1) return;

	// Grab user and ring information
	let ring = rings[result[0].rid];
	let so = user.id==result[0].id1?result[0].id2:result[0].id1;
	so = await p.global.getUser(so);
	tag = "";
	if(!so) so = "Someone";
	else {
		tag = '#'+so.discriminator;
		so = so.username;
	}
	return { img:'ring_'+ring.id+'.png', text:so, tag};
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

async function getTeam(p,user){
	let sql = `SELECT tname,name,xp
		FROM user INNER JOIN pet_team ON user.uid = pet_team.uid 
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid 
			INNER JOIN animal ON pet_team_animal.pid = animal.pid 
		WHERE user.id = ${user.id}`;
	let result = await p.query(sql);
	if(!result||!result[0]) return;
	let animals = []
	for(let i in result){
		let animal = p.global.validAnimal(result[i].name);
		if(animal){
			let animalID = animal.value.match(/:[0-9]+>/g);
			if(animalID) animalID = animalID[0].match(/[0-9]+/g)[0];
			else animalID = animal.value.substring(1,animal.value.length-1);
			if(animal.hidden) animalID = animal.hidden;
			animals.push({img:animalID,info:animalUtil.toLvl(result[i].xp)});
		}
	}
	let name = result[0].tname;
	if(!name) name = "My Team";
	return { name, animals }

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
