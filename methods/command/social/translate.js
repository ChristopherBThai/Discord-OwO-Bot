const CommandInterface = require('../../commandinterface.js');

const gtranslate = require('translate-google');

module.exports = new CommandInterface({
	
	alias:["translate","listlang"],

	args:"{msg} -{language}",

	desc:"Translates a message to a specific language. The default language will be english.\nUse 'owo listlang to list all the languages",

	example:["owo translate Hello -ja","owo translate no hablo espanol -en"],

	related:["owo listlang"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		if(p.command=="listlang")
			listlang(p.msg);
		else
			translate(p.msg,p.args);
	}

})

function translate(msg,args){
	if(args.length==0)
		return;
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
	gtranslate(text, {to: lang}).then(res => {
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

function listlang(msg){
	var text = "Available languages: \n";
	var done = false;
	for(key in gtranslate.languages){
		if(key == "zu")
			done = true;
		if(!done)
			text += "`"+key+"`-"+gtranslate.languages[key]+"  ";
	}
	msg.channel.send(text)
		.catch(err => console.error(err));
}
