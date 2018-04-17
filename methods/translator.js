const translate = require('translate-google');

//Translates a text to a diff language
exports.translate = function(msg,args){
	//Get language
	var lang = args[args.length-1];
	if(lang.charAt(0)=='-'){
		lang = lang.substring(1);
		args.pop();
	}else{
		lang = "en"
	}
	
	//Get text
	var text = args.join(" ");
	if(text.length>700){
		msg.channel.send("**🚫 |** Message is too long")
			.catch(err => console.error(err));
		return;
	}
	var ptext = text;
	text = text.split(/(?=[?!.])/gi);
	text.push("");
	translate(text, {to: lang}).then(res => {
		const embed = {
			"description":""+res.join(" "),
			"color":4886754,
			"footer":{"text":"Translated from \""+ptext+"\""}
		};
		msg.channel.send({embed})
			.catch(err => msg.channel.send("**🚫 |** I don't have permission to send embedded links! :c")
			.catch(err => console.error(err)));
	}).catch(err => {
		msg.channel.send("**🚫 |** Could not find that language! Use `owo listlang` to see available languages")
			.catch(err => console.error(err));
	})
}

//Lists all languages
exports.list = function(msg){
	var text = "Available languages: \n";
	var done = false;
	for(key in translate.languages){
		if(key == "zu")
			done = true;
		if(!done)
			text += "`"+key+"`-"+translate.languages[key]+"  ";
	}
	msg.channel.send(text)
		.catch(err => console.error(err));
}
