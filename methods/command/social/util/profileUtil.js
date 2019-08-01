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

exports.display = async function(p){
	/* Construct json for POST request */
	let info = await generateJson(p);
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

async function generateJson(p){
	let avatarURL = p.msg.author.avatarURL()
	if(!avatarURL) avatarURL= p.msg.author.defaultAvatarURL;
	avatarURL = avatarURL.replace('.gif','.png').replace(/\?[a-zA-Z0-9=?&]+/gi,'');
	let aboutme = "I'm just a plain human.";

	let promises = [getMarriage(p),getRank(p),getCookie(p),getTeam(p),getBackground(p),levels.getUserLevel(p)]
	promises = await Promise.all(promises);

	let marriage = promises[0];
	let rank = promises[1];
	let cookie = promises[2];
	let team = promises[3];
	let background = promises[4];
	let level = promises[5];

	level = {lvl:level.level,maxxp:level.maxxp,currentxp:level.currentxp}

	let info = [];
	if(marriage) info.push(marriage);
	if(rank) info.push(rank);
	if(cookie) info.push(cookie);

	return {
		theme:{
			background:background.id,
			name_color:background.color,
		},
		user:{
			avatarURL,
			name:p.msg.author.username,
			title:'An OwO Bot User'
		},
		aboutme,
		level,
		info,
		team
	}
}

function getRank(p){
	return {
		img:'trophy.png',
		text:'#1'
	}
}

async function getCookie(p){
	let result = await p.query(`SELECT count FROM rep WHERE id = ${p.msg.author.id};`);
	if(!result||!result[0]) return { img:'cookie.png', text:'+0' };

	let count = result[0].count;
	count = '+'+shortenInt(count);
	return { img:'cookie.png',text:count };
}

async function getMarriage(p){
	let sql = `SELECT 
			u1.id AS id1,u2.id AS id2,TIMESTAMPDIFF(DAY,marriedDate,NOW()) as days,marriage.* 
		FROM marriage 
			LEFT JOIN user AS u1 ON marriage.uid1 = u1.uid 
			LEFT JOIN user AS u2 ON marriage.uid2 = u2.uid 
		WHERE u1.id = ${p.msg.author.id} OR u2.id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	if(result.length<1) return;

	// Grab user and ring information
	let ring = rings[result[0].rid];
	let so = p.msg.author.id==result[0].id1?result[0].id2:result[0].id1;
	so = await p.global.getUser(so);
	if(!so) so = "Someone";
	else so = so.username;
	return { img:'ring_'+ring.id+'.png', text:so };
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

async function getTeam(p){
	let sql = `SELECT tname,name 
		FROM user INNER JOIN pet_team ON user.uid = pet_team.uid 
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid 
			INNER JOIN animal ON pet_team_animal.pid = animal.pid 
		WHERE user.id = ${p.msg.author.id}`;
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
			animals.push(animalID);
		}
	}
	let name = result[0].tname;
	if(!name) name = "My Team";
	return { name, animals }

}

async function getBackground(p){
	let random = Math.floor(Math.random()*8)+1
	let sql = `SELECT name_color FROM backgrounds WHERE bid = ${random};`
	let result = await p.query(sql);
	return {id:random,color:result[0].name_color};
}
