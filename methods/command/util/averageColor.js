/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const {createCanvas, Canvas, Image} = require('canvas')
const request = require('request').defaults({encoding:null});
const Vibrant = require('node-vibrant');

module.exports = new CommandInterface({

	alias:["averagecolor","avgcolor","acolor","averagecolour","avgcolour","acolour"],

	args:"@user",

	desc:"Get the average color of a user's profile!",

	example:["owo "],

	related:[],

	permissions:["SEND_MESSAGES","EMBED_LINKS","ATTACH_FILES"],

	cooldown:4000,

	execute: async function(p){
		let user = p.msg.author;
		let url = user.displayAvatarURL({format:'png',size:32});
		let palette = await Vibrant.from(url).getPalette();
		console.log(palette.Vibrant);
		
		/*
		let img;
		try{
			img = await getImg(url);
			console.log(img);
		}catch(err){
			p.errorMsg(", I failed to get the profile image :c",3000);
			return;
		}
		
		console.log(fac.getColor(img));
		*/

	}
});

function getImg(url){
	return new Promise(function(res,rej){
		request.get(url,function(err,response,body){
			if(!err && response.statusCode==200){
				img = new Image;
				img.onload = function(){
					res(img);
				}
				img.onerror = function(){
					rej();
				}
				img.src = body;
			}else{
				rej();
			}
		});
	});
}
		
