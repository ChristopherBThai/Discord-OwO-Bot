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

	args:"set [about|background] {argument}",

	desc:"Display your profile!",

	example:["owo profile","owo profile set about Hello!"],

	related:[],

	cooldown:3000,
	half:100,
	six:500,

	execute: async function(p){
		if(p.args.length<=0){
			await displayProfile(p,p.msg.author);
		}else if(p.global.isUser(p.args[0])||p.global.isInt(p.args[0])){
			await displayProfile(p,p.msg.author);
			/*
			let user = p.args[0].match(/[0-9]+/)[0];
			user = await p.global.getUser(user);
			if(!user)
				p.errorMsg(", I couldn't find that user!",3000);
			else
				await displayProfile(p,user);
			*/
		}else if(p.args.length>1&&p.args[0]=='set'){
			switch(p.args[1]){
				case 'about':
					editAbout(p);
					break;
				case 'background':
					p.errorMsg(", command not complete yet!",3000);
					break;
				/*
				case 'accent':
					editAccent(p);
					break;
				case 'accent2':
					editAccent2(p);
					break;
				*/
				default:
					p.errorMsg(", Invalid arguments! You can only edit `about` and `background`!",3000);
			}
		}
	}

})

async function displayProfile(p,user){
		try{
			let uuid = await profileUtil.display(p,user);
			let url = imagegenAuth.imageGenUrl+'/profile/'+uuid+'.png';
			if(uuid){
				let warning = '⚠';
				await p.send(warning+" **|** THIS COMMAND IS STILL A WORK IN PROGRESS",null,{files:[url]});
			}else
				throw "Not found"
		}catch(e){
			p.errorMsg(", failed to create profile image... Try again later :(",3000);
		}
}

async function editAbout(p){
	if(p.args.length<3){
		p.errorMsg(', Invalid arguments! Please use `owo profile set about {text}`',6000);
		return;
	}

	let uid = await getUid(p,p.msg.author.id);

	if(!uid){
		p.errorMsg(", failed to change settings",3000);
		return;
	}

	let about = p.args.slice(2,p.args.length).join(" ");

	let sql = `INSERT INTO user_profile (uid,about) VALUES (${uid},?) ON DUPLICATE KEY UPDATE about = ?;`;
	await p.query(sql,[about,about]);
	await displayProfile(p,p.msg.author);
}

async function editAccent(p){
	if(p.args.length<3){
		p.errorMsg(', Invalid arguments! Please use `owo profile set accent {#rgb}`',6000);
		return;
	}

	let rgb = p.args.slice(2,p.args.length).join("").replace(/[#, ]+/gi,'').toLowerCase();
	if(rgb.length!=6){
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`',6000);
		return;
	}
	rgb = parseRGB(rgb);
	if(!rgb){
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`',6000);
		return;
	}

	let uid = await getUid(p,p.msg.author.id);
	if(!uid){
		p.errorMsg(", failed to change settings",3000);
		return;
	}
	let sql = `INSERT INTO user_profile (uid,accent) VALUES (${uid},?) ON DUPLICATE KEY UPDATE accent = ?;`;
	await p.query(sql,[rgb,rgb]);
	await displayProfile(p,p.msg.author);
}

async function editAccent2(p){
	if(p.args.length<3){
		p.errorMsg(', Invalid arguments! Please use `owo profile set accent2 {#rgb}`',6000);
		return;
	}

	let rgb = p.args.slice(2,p.args.length).join("").replace(/[#, ]+/gi,'').toLowerCase();
	if(rgb.length!=6){
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`',6000);
		return;
	}
	rgb = parseRGB(rgb);
	if(!rgb){
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`',6000);
		return;
	}

	let uid = await getUid(p,p.msg.author.id);
	if(!uid){
		p.errorMsg(", failed to change settings",3000);
		return;
	}
	let sql = `INSERT INTO user_profile (uid,accent2) VALUES (${uid},?) ON DUPLICATE KEY UPDATE accent2 = ?;`;
	await p.query(sql,[rgb,rgb]);
	await displayProfile(p,p.msg.author);
}

async function getUid(p,id){
	let sql = `SELECT uid FROM user WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	let uid;
	if(!result||!result[0]){
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0);`;
		result = await p.query(sql);
		uid = result.insertId;
	}else{
		uid = result[0].uid;
	}
	return uid;
}

function parseRGB(rgb){
	let rgb1 = parseInt(rgb.substring(0,2),16);
	if(rgb1<0||rgb1>255) return;
	let rgb2 = parseInt(rgb.substring(2,4),16);
	if(rgb2<0||rgb2>255) return;
	let rgb3 = parseInt(rgb.substring(4,6),16);
	if(rgb3<0||rgb3>255) return;
	return rgb1+','+rgb2+','+rgb3+',255';
}
