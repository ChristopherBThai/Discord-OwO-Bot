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
		msg.channel.send("Wrong argument type! :c")
			.then(message => message.delete(3000));
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

exports.cuddle = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"cuddle","gif",msg.author.username+" cuddles with "+target.username+"~");
}

exports.hug = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"hug","gif",msg.author.username+" hugged "+target.username+"!!");
}

exports.kiss = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"kiss","gif",msg.author.username+" kisses "+target.username+" >///< cute!");
}

exports.lick = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"lick","gif",msg.author.username+" licks "+target.username+"! Yummy!");
}

exports.nom = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"nom","gif",msg.author.username+" nommed "+target.username+"! Owo!");
}

exports.pat = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"pat","gif",msg.author.username+" pets "+target.username+"! cute!");
}

exports.poke = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"poke","gif",msg.author.username+" pokes "+target.username+"");
}

exports.slap = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"slap","gif",msg.author.username+" slaps "+target.username+"! Ouch!");
}

exports.stare = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"stare","gif",msg.author.username+" stares at "+target.username+"");
}

exports.insult = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"insult","gif",msg.author.username+" insults "+target.username+"! Meanie!");
}

exports.tickle = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"tickle","gif",msg.author.username+" tickles "+target.username+"");
}

exports.highfive = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"highfive","gif",msg.author.username+" high fives "+target.username+"! Slap!");
}

exports.bite = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"bite","gif",msg.author.username+" bites "+target.username+"! rawr!");
}

exports.greet = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"greet","gif",msg.author.username+" greets "+target.username+"! Hello!");
}

exports.punch = function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"punch","gif",msg.author.username+" punches "+target.username+"! oof!");
}

exports.handholding= function(client,msg,args){
	if(args.length!=1||!isUser(args[0]))
		return;
	var target = client.users.get(args[0].match(/[0-9]+/)[0]);
	if(target == undefined){
		msg.channel.send("I couldn't find that user :c");
		return;
	}
	grab(msg,"handholding","gif",msg.author.username+" holds "+target.username+"'s hand! adorable~");
}

/*
 * Checks if its a user
 */
function isUser(id){
	return id.search(/<@!?[0-9]+>/)>=0;
}
