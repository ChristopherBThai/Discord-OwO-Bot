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

	desc:"Get a random color! You can also add an user argument or rgb value to view their colors!\n\nIf you want to get real technical, you can adjust the saturation and light value of the random colors like in the example below!",

	example:["owo color","owo color @user","owo color #FFFFFF","owo color 255,255,255","owo color S:50% L:50%"],

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

			//randomHSL
			}else if(p.args.join(" ").includes("%")){
				color = randHSL(p,p.args);

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
						+"**RGB:** `"+color.rgb+"`\n"
						+"**INT:** `"+color.intValue+"`\n"
						+"**HSL:** `"+color.hsl+"`";
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

	let {hsl,h,s,l} = rgbToHsl(r,g,b);

	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b,h,s,l,hsl};
}

function parseHex(hex){
	let r = parseInt(hex.substring(0,2),16);
	let g = parseInt(hex.substring(2,4),16);
	let b = parseInt(hex.substring(4,6),16);

	let intValue = parseInt(hex.toLowerCase(),16);
	
	let {hsl,h,s,l} = rgbToHsl(r,g,b);

	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b,h,s,l,hsl};
}

function parseRGB(rgb){
	let r = parseInt(rgb[0]);
	let g = parseInt(rgb[1]);
	let b = parseInt(rgb[2]);

	let hex = toHex(r) + toHex(g) + toHex(b);

	let intValue = parseInt(hex.toLowerCase(),16);

	let {hsl,h,s,l} = rgbToHsl(r,g,b);

	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b,h,s,l,hsl};
}

function randColor(){
	let r = Math.floor(Math.random()*256);
	let g = Math.floor(Math.random()*256);
	let b = Math.floor(Math.random()*256);

	let hex = toHex(r) + toHex(g) + toHex(b);

	let intValue = parseInt(hex.toLowerCase(),16);

	let {hsl,h,s,l} = rgbToHsl(r,g,b);

	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b,h,s,l,hsl};
}

function randHSL(p,args){
	let h,s,l;
	let parsePercent = function(perc){
		console.log(perc);
		perc = parseFloat(perc.replace(/[HSVL%]/gi,""));
		if(!perc) return -1;
		perc /= 100;
		if(perc>1) perc = 1;
		if(perc<0) perc = 0;
		return perc;
	}
	for(let i in args){
		let arg = args[i].replace(/[:=]/gi,"").toUpperCase();
		console.log(arg);
		switch(arg.charAt(0)){
			case 'H':
				h = parsePercent(arg);
				if(h==-1) return;
				break;
			case 'S':
				s = parsePercent(arg);
				if(s==-1) return;
				break;
			case 'V':
				l = parsePercent(arg);
				if(l==-1) return;
				break;
			case 'L':
				l = parsePercent(arg);
				if(l==-1) return;
				break;
			default:
				return;
		}

	}

	let goldenRatio = 0.618033988749895;
	if(h===undefined) h = (Math.random()+goldenRatio)%1;
	if(s===undefined) s = Math.random();
	if(l===undefined) l = Math.random();
	let {r,g,b} = hslToRgb(h,s,l);
	let hex = toHex(r) + toHex(g) + toHex(b);
	let intValue = parseInt(hex.toLowerCase(),16);
	let hsl = Math.round(h*100)+"%, "+Math.round(s*100)+"%, "+Math.round(l*100)+"%";
	return {r,g,b,hex:'#'+hex,intValue,rgb:r+','+g+','+b,h,s,l,hsl};
}

function toHex(num){
	let hex = num.toString(16).toUpperCase();
	if(hex.length<2){
		hex = "0"+hex;
	}
	return hex;
}
function rgbToHsl(r, g, b){
	r /= 255, g /= 255, b /= 255;
	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if(max == min){
		h = s = 0; // achromatic
	}else{
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	let hsl = Math.round(h*100)+"%, "+Math.round(s*100)+"%, "+Math.round(l*100)+"%";
	return {h, s, l, hsl};
}

function hslToRgb(h, s, l){
	let r, g, b;

	if(s == 0){
		r = g = b = l; // achromatic
	}else{
		let hue2rgb = function hue2rgb(p, q, t){
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return {r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255)};
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
