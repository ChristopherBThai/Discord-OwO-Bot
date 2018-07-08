const weeb = require("weeb.js");
const auth = require('../../tokens/owo-auth.json');
const sh = new weeb("Wolke "+auth.weebsh,"owo/1.0");

/**
 * Gets an image from weeb.sh
 */
exports.grab = function(msg,ptype,ftype,text,notsfw,retry){
	ftype = ftype.toLowerCase();
	ptype = ptype.toLowerCase();
	var nsfwt = false;
	var retryt = true
	if(typeof notsfw == "boolean"&&notsfw)
		nsfwt = "only";
	if(retryt&&typeof retry== "boolean")
		retryt = retry;
	sh.getRandom({type:ptype,nsfw: nsfwt,filetype: ftype}).then(array => {

		if(!array){
			return;
		}
		const embed = {
			"color": 4886754,
			"image": {
				"url": array.url
			},
			"author": {
				"name" : text,
				"url":array.url,
				"icon_url": msg.author.avatarURL
			}
		};

		msg.channel.send({embed})
			.catch(err => msg.channel.send("**🚫 |** I don't have permission to send embedded links! :c")
				.catch(err => console.error(err)));

	}).catch(err => {
		if(retryt&&(ftype=="jpg"||ftype=="png")){
			this.grab(msg,ptype,(ftype=="jpg")?"png":"jpg",text,notsfw,false);		
		}else
			msg.channel.send("**🚫 |** I couldn't find that image type! :c\nType `owo help gif` for the list of types!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
	});
}

/**
 * Lists all weeb.sh types
 */
exports.getTypes = function(msg){
	sh.getTypes().then(array => {
		var txt = "Available Image Types:\n";
		for (var i=0;i<array.length;i++)
			txt += "`"+array[i]+"`, ";
		txt += "`nsfw`";
		txt += "\n*Some types will not work on pic*";
		msg.channel.send(txt)
			.catch(err => console.error(err));
	});
}
