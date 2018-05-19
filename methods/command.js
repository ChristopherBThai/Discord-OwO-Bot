const requireDir = require('require-dir');
const dir = requireDir('./command',{recurse:true});

const CommandInterface = require('./commandinterface');

const sender = require('../util/sender.js');

const mysql = require('../util/mysql.js');
const con = mysql.con;
const global = require('../util/global.js');

const macro = require('../util/macro.js');
const ban = require('../util/ban.js');


const prefix = 'owo';

var commands = {};
var aliasToCommand = {};
var mcommands = {};

class Command {

	//Grabs all commands in ./command/
	constructor(Client){
		this.client = Client;
		global.client(Client);
		sender.client(Client);
		global.con(con);
		macro.con(con);
		for(var key in dir){
			if(dir[key] instanceof CommandInterface)
				addCommand(dir[key]);
			else
				for(var key2 in dir[key])
					if(dir[key][key2] instanceof CommandInterface)
						addCommand(dir[key][key2]);
		}
		macro.commands(mcommands);
	}

	execute(msg){
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
			"client":this.client,
			"mysql":mysql,
			"con":con,
			"send":sender.send(msg),
			"global":global
		};

		//Execute the command
		if(commands[command]){
			var name = aliasToCommand[command];
			ban.check(con,msg,name,function(){
				macro.check(msg,aliasToCommand[command],async function(){
					await commands[command](param);
					//log here
					console.log(aliasToCommand[param.command]);
					//user requests help of a command
					//if(param.help)
				});
			},false);
		}else{
			//Not a command
		}
	}

}

function addCommand(command){
	var execute = command.execute;
	var alias = command.alias;
	var name = alias[0];
	if(alias){
		for(var i=0;i<alias.length;i++){
			commands[alias[i]] = execute;
			if(command.distinctAlias){
				aliasToCommand[alias[i]] = alias[i];
				mcommands[alias[i]] = {cd:command.cooldown,ban:12,half:command.half,six:command.six};
			}else
				aliasToCommand[alias[i]] = name;
		}
	}
	if(!command.distinctAlias)
		mcommands[name] = {cd:command.cooldown,ban:12,half:command.half,six:command.six};
}

module.exports = Command;
