const weeb = require("weeb.js");
var auth = require('../../tokens/owo-auth.json');

const sh = new weeb("Wolke "+auth.weebsh,"owo/1.0");

function grab(msg,ptype,ftype,text){
	sh.getRandom({type:ptype,nsfw: false,filetype: ftype}).then(array => {

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
		msg.channel.send("I couldn't find that image type! :c");
	});
}

exports.getImage = function(msg,args){
	if(args.length!=1){
		msg.channel.send("Wrong argument type! :c");
		return;
	}
	if(Math.random()>.5)
		grab(msg,args[0],"pic",args[0]);
	else
		grab(msg,args[0],"jpg",args[0]);
}

exports.getGif = function(msg,args){
	if(args.length!=1){
		msg.channel.send("Wrong argument type! :c");
		return;
	}
	grab(msg,args[0],"gif",args[0]);
}


exports.getTypes = function(msg){
	sh.getTypes().then(array => {
		var txt = "Available Image Types:\n";
		for (i in array)
			txt += "`"+array[i]+"`, ";
		txt = txt.substr(0,txt.length-2)+"";
		txt += "*Some types will not work on pic*";
		msg.channel.send(txt);
	});
}

exports.blush = function(msg,args){
	if(args.length==0)
		grab(msg,"blush","gif",msg.author.username+" blushed! >///<");
}

exports.cry = function(msg,args){
	if(args.length==0)
		grab(msg,"cry","gif",msg.author.username+" is crying! ;-; There there...");
}

exports.dance = function(msg,args){
	if(args.length==0)
		grab(msg,"dance","gif",msg.author.username+" is dancing~!");
}

exports.lewd = function(msg,args){
	if(args.length==0)
		grab(msg,"lewd","gif",msg.author.username+" thinks thats lewd...");
}

exports.pout = function(msg,args){
	if(args.length==0)
		grab(msg,"pout","gif",msg.author.username+" pouts >:c");
}

exports.shrug = function(msg,args){
	if(args.length==0)
		grab(msg,"shrug","gif",msg.author.username+" shrugs");
}

exports.sleepy = function(msg,args){
	if(args.length==0)
		grab(msg,"sleepy","gif",msg.author.username+" is sleepy...");
}

exports.smile = function(msg,args){
	if(args.length==0)
		grab(msg,"smile","gif",msg.author.username+" smiles!");
}

exports.smug = function(msg,args){
	if(args.length==0)
		grab(msg,"smug","gif",msg.author.username+" scoffs");
}

exports.thumbsup = function(msg,args){
	if(args.length==0)
		grab(msg,"thumbsup","gif",msg.author.username+" gives a thumbs up!");
}

exports.triggered= function(msg,args){
	if(args.length==0)
		grab(msg,"triggered","gif",msg.author.username+" is triggered!!!!");
}

exports.wag = function(msg,args){
	if(args.length==0)
		grab(msg,"wag","gif",msg.author.username+" wags its tail!");
}

exports.thinking = function(msg,args){
	if(args.length==0)
		grab(msg,"thinking","gif",msg.author.username+" is thinking...");
}




