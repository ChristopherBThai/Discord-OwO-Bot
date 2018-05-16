const requireDir = require('require-dir');
const dir = requireDir('./command');

const prefix = 'owo';

var commands = {};

class Command {

	constructor(Client){
		this.client = Client;
		for(var key in dir){
			var execute = dir[key].execute;
			var aliases = dir[key].alias;
			for(var i=0;i<aliases.length;i++)
				commands[aliases[i]] = execute;
		}
	}

	execute(msg){
		//Ignore if bot
		if(msg.author.bot) return;

		//Gets command arguments
		var args;
		if(msg.content.toLowerCase().indexOf(prefix) === 0)
			args = msg.content.slice(prefix.length).trim().split(/ +/g);
		else{
			//Not a command
			return;
		}

		//Get command name
		var command = args.shift().toLowerCase();

		//Init params to pass into command
		var param = {
			"msg":msg,
			"args":args,
			"command":command,
			"client":this.client
		};

		if(commands[command])
			commands[command](param);
		else{
			//Not a command
		}
	}

}

module.exports = Command;
