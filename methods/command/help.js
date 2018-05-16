const CommandInterface = require('../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["help"],

	args:"{command}",

	desc:"This displays the commands or more info on a specific command",

	example:["owo help cowoncy","owo help"],

	execute: function(params){
		params.msg.channel.send("Hello "+params.msg.author.username);
	}

})
