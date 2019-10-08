/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const request = require('request');
const imagegenAuth = require('../../../../tokens/imagegen.json');
const maxInt = 16777215;
const colorEmoji = '🎨';

module.exports = new CommandInterface({

	alias:["color","randcolor","colour","randcolour"],

	args:"{@user|RGB}",

	desc:"Get a random color! You can also add an user argument or rgb value to view their colors!",

	example:["owo color","owo color @user","owo color #FFFFFF","owo color 255,255,255"],

	related:[],

	permissions:["SEND_MESSAGES","EMBED_LINKS","ATTACH_FILES"],

	cooldown:4000,

	execute: async function(p){
		
		let color,title;

		// No argument = random color
		if(!p.args.length){
			color = randColor();
			title = ", here is your random color!";
		}else{
			let args = p.args.join(" ").split(/[\s,]+/gi);
			let args2 = p.args.join("").replace('#','').toUpperCase();
			title = ", here is your color for \""+p.args.join(" ")+"\"";
			
			//user value
			if(args.length==1&&(p.global.isUser(p.args[0])||(p.global.isInt(p.args[0])&&parseInt(p.args[0])>maxInt))){
				let id = p.args[0].match(/[0-9]+/)[0];
				let user = await p.global.getUser(id);
				if(!user){
					p.errorMsg(", That user does not exist!",3000);
					return;
				}
				user = await p.global.getMember(p.msg.guild,user);
				if(!user||!user.displayColor){
					p.errorMsg(", That user does not have a role color!",3000);
					return;
				}
				color = parseMember(user);
				title = ", here is the role color for **"+user.user.username+"**";

			//rgb values
			}else if(args.length==3&&args.every(p.global.isInt)){
				color = parseRGB(args);

			//int values
			}else if(p.args.length==1&&p.global.isInt(p.args[0])){
				color = parseIntValue(p.args[0]);

			//hex values
			}else if(args2.length==6){
				color = parseHex(args2);
			}
		}

		if(!color||color.r>255||color.g>255||color.b>255||!/[0-9,A-F]{6}/g.test(color.hex)){
			p.errorMsg(", that's an invalid color!",3000);
			return;
		}

		let embed = await constructEmbed(color,p);
		await p.send(colorEmoji+" **| "+p.msg.author.username+"**"+title,null,embed);

	}

})

async function constructEmbed(color,p){
	let description = "**HEX:** `"+color.hex+"`\n"
						+"**R,G,B:** `"+color.rgb+"`\n"
						+"**INT:** `"+color.intValue+"`";
	let uuid = await generateImage(color);
	let embed = {
		description,
		color:color.intValue,
		thumbnail:{
			url:imagegenAuth.imageGenUrl+"/color/"+uuid
		}
	}
	return {embed};
}

function parseMember(member){
	return parseIntValue(member.displayColor);
}

function parseIntValue(intValue){
	intValue = parseInt(intValue);
	if(intValue>maxInt) return;
	let hex = intValue.toString(16).toUpperCase();
	if(hex.length>6) return;
	hex = "0".repeat(6-hex.length)+hex;

	let r = parseInt(hex.substring(0,2),16);
	let g = parseInt(hex.substring(2,4),16);
	let b = parseInt(hex.substring(4,6),16);

	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b};
}

function parseHex(hex){
	let r = parseInt(hex.substring(0,2),16);
	let g = parseInt(hex.substring(2,4),16);
	let b = parseInt(hex.substring(4,6),16);

	let intValue = parseInt(hex.toLowerCase(),16);
	
	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b};
}

function parseRGB(rgb){
	let r = parseInt(rgb[0]);
	let g = parseInt(rgb[1]);
	let b = parseInt(rgb[2]);

	let hex = toHex(r) + toHex(g) + toHex(b);

	let intValue = parseInt(hex.toLowerCase(),16);

	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b};
}

function randColor(){
	let r = Math.floor(Math.random()*256);
	let g = Math.floor(Math.random()*256);
	let b = Math.floor(Math.random()*256);

	let hex = toHex(r) + toHex(g) + toHex(b);

	let intValue = parseInt(hex.toLowerCase(),16);

	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b};
}

function toHex(num){
	let hex = num.toString(16).toUpperCase();
	if(hex.length<2){
		hex = "0"+hex;
	}
	return hex;
}

function generateImage(color){
	/* Construct json for POST request */
	let info = color;
	info.password = imagegenAuth.password;

	/* Returns a promise to avoid callback hell */
	try{
		return new Promise( (resolve, reject) => {
			let req = request({
				method:'POST',
				uri:imagegenAuth.colorImageUri,
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
		return "";
	}
}
