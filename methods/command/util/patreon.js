const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["patreon","donate"],

	args:"",

	desc:"Donate to OwO Bot to help support its growth! Any donations will come with special benefits!",

	example:[],

	related:[],

	cooldown:10000,
	half:80,
	six:500,

	execute: function(p){
		var text = "**<:patreon:449514540871450625> |** Donate to OwO Bot for special benefits!\n";
		text += "**<:blank:427371936482328596> |** https://www.patreon.com/OwOBot";
		p.send(text);
	}

})

