const weeb = require("weeb.js");
var auth = require('../../tokens/owo-auth.json');

const sh = new weeb("Wolke "+auth.weebsh,"owo/1.0");

exports.getImage= function(msg,args){
	if(args.length!=1){
		msg.channel.send("Wrong argument type! :c");
		return;
	}
	sh.getRandom({type:args[0],nsfw: false,filetype: "gif"}).then(array => {

		const embed = {
			"color": 4886754,
			"image": {
				"url": array[0]
			},
			"author": {
				"name" : "rawr",
				"icon_url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"
			}
		};

		msg.channel.send({embed});

	}).catch(err => {
		msg.channel.send("I couldn't find that image type! :c");
	});
}

exports.getTypes = function(msg){
	sh.getTypes().then(array => {
		var txt = "Available Image Types:\n";
		for (i in array)
			txt += "`"+array[i]+"`, ";
		txt = txt.substr(0,txt.length-2)+"";
		msg.channel.send(txt);
	});
}
