const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["vote"],

	args:"",

	desc:"Vote on Discord Bot List to gain daily cowoncy!",

	example:[],

	related:["owo daily","owo money"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		var text = "**☑ |** Click the link to vote and gain 200+ cowoncy!\n";
		text += "**<:blank:427371936482328596> |** https://discordbots.org/bot/408785106942164992/vote";
		text += "\n**⚠ |** The website is currently not working";
		p.send(text);

	}

})


