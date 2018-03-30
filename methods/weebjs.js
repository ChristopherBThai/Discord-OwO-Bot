/**
 * Weeb.sh api
 */

const global = require('./global.js');

const weeb = require("weeb.js");
var auth = require('../../tokens/owo-auth.json');
var emotes = require('../json/emotes.json');
const sh = new weeb("Wolke "+auth.weebsh,"owo/1.0");

/**
 * Gets an image from weeb.sh
 */
function grab(msg,ptype,ftype,text,notsfw,retry){
	ftype = ftype.toLowerCase();
	ptype = ptype.toLowerCase();
	var nsfwt = false;
	var retryt = true
	if(typeof notsfw == "boolean"&&notsfw)
		nsfwt = "only";
	if(retryt&&typeof retry== "boolean")
		retryt = retry;
	sh.getRandom({type:ptype,nsfw: nsfwt,filetype: ftype}).then(array => {

		const embed = {
			"color": 4886754,
			"image": {
				"url": array[0]
			},
			"author": {
				"name" : text,
				"icon_url": msg.author.avatarURL
			}
		};

		msg.channel.send({embed});

	}).catch(err => {
		if(retryt&&(ftype=="jpg"||ftype=="png")){
			grab(msg,ptype,(ftype=="jpg")?"png":"jpg",text,notsfw,false);		
		}else
			msg.channel.send("I couldn't find that image type! :c\nType `owo help gif` for the list of types!")
				.then(message => message.delete(3000));
	});
}

/**
 * Gets an image
 */
exports.getImage = function(msg,args){
	if(args.length!=1){
		msg.channel.send("Wrong argument type! :c")
			.then(message => message.delete(3000));
		return;
	}
	var nsfw = false;
	if(args[0]=="nsfw"){
		if(!msg.channel.nsfw){
			msg.channel.send("nsfw channels only! >:c")
				.then(message => message.delete(3000));
			return;
		}	
		nsfw = true;
		args[0] = "neko";
	}
	if(Math.random()>.5)
		grab(msg,args[0],"png",args[0],nsfw);
	else
		grab(msg,args[0],"jpg",args[0],nsfw);
}

/**
 * Gets a gif
 */
exports.getGif = function(msg,args){
	if(args.length!=1){
		msg.channel.send("Wrong argument type! :c")
			.then(message => message.delete(3000));
		return;
	}
	if(args[0]=="nsfw")
		if(msg.channel.nsfw)
			msg.channel.send("Please try `owo pic nsfw`~")
				.then(message => message.delete(3000));
		else
			msg.channel.send("nsfw channels only! >:c")
				.then(message => message.delete(3000));
	else
		grab(msg,args[0],"gif",args[0]);
}

/**
 * Gets an nsfw image
 */
exports.getNSFWImage = function(msg,args){
	if(args.length!=2){
		msg.channel.send("Wrong argument type! :c")
			.then(message => message.delete(3000));
		return;
	}
	if(Math.random()>.5)
		grab(msg,"neko","png",args.join(" "),true);
	else
		grab(msg,"neko","jpg",args.join(" "),true);
}	

/**
 * Lists all weeb.sh types
 */
exports.getTypes = function(msg){
	sh.getTypes().then(array => {
		var txt = "Available Image Types:\n";
		for (i in array)
			txt += "`"+array[i]+"`, ";
		txt += "`nsfw`";
		txt += "\n*Some types will not work on pic*";
		msg.channel.send(txt);
	});
}

/**
 * Self emotes
 */
exports.sEmote = function(msg,type){
	var emote = emotes.sEmote[type.toLowerCase()];
	if(emote == undefined)
		return;
	if(emote.alt!=undefined)
		emote = emotes.sEmote[emote.alt];
	var text = emote.msg[Math.floor(Math.random()*emote.msg.length)];
	text = text.replace(/\?/,msg.author.username);
	grab(msg,emote.name,"gif",text);
}

/**
 * Emotes towards users
 */
exports.uEmote= function(client,msg,args,type){
	if(args.length!=1||!global.isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	var emote = emotes.uEmote[type.toLowerCase()];
	if(emote == undefined)
		return;
	if(emote.alt!=undefined)
		emote = emotes.uEmote[emote.alt];
	if(msg.author.id==target.id){
		var text = emote.self[Math.floor(Math.random()*emote.self.length)];
		text = text.replace(/\?/,msg.author.username);
		msg.channel.send(text);
		return;
	}
	var text = emote.msg[Math.floor(Math.random()*emote.msg.length)];
	text = text.replace(/\?/,msg.author.username);
	text = text.replace(/\?/,target.username);
	grab(msg,emote.name,"gif",text);
}

