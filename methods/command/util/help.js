const CommandInterface = require('../../commandinterface.js');

const emotes = require('../../../json/emotes.json');
var sEmotes= [];
for(var key in emotes.sEmote)
	sEmotes.push(key);
sEmotes = "`"+sEmotes.join("`  `")+"`";
var uEmotes= [];
for(var key in emotes.uEmote)
	uEmotes.push(key);
uEmotes.pop();
uEmotes.pop();
uEmotes = "`"+uEmotes.join("`  `")+"`";


module.exports = new CommandInterface({
	
	alias:["help"],

	args:"{command}",

	desc:"This displays the commands or more info on a specific command",

	example:["owo help cowoncy","owo help"],

	related:[],

	cooldown:1000,
	half:100,
	six:500,

	execute: function(p){
		if(p.args==0)
			display(p.send);
		else
			describe(p.send,p.args[0],p.commands[p.aliasToCommand[p.args[0]]]);
	}

})

function display(send){
	var text = "**Command List**"+
		"\n\n**Rankings:** "+
		"\n**Economy:** "+
		"\n**Animals:** "+
		"\n**Gambling:** "+
		"\n**Fun:** "+
		"\n**Social:** "+
		"\n**Utility:** "+
		"\n\nUse `owo help {command}` for further details!"+
		"\nUse `owo {command}` to execute a command!";
		var embed = {
		"description": "Here is the list of commands!\nFor more info on a specific command, use `owo help {command}`",
			"color": 4886754,
			"author": {"name": "Command List",
				"icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
			"fields": [
				{"name":"Rankings",
					"value":"`top`  `my`"},
				{"name":"Economy",
					"value":"`cowoncy`  `give`  `daily`  `vote`"},
				{"name":"Animals",
					"value":"`zoo`  `hunt`  `sell`  `battle`  `pets`  `inv`  `shop`  `equip`  `buy`  `autohunt`  `owodex`"},
				{"name":"Gambling",
					"value":"`slots`  `coinflip`  `lottery`  `blackjack`  `drop`"},
				{"name":"Fun",
					"value":"`8b`  `define`  `gif`  `pic`  `translate`"},
				{"name":"Social",
					"value":"`cookie` `ship`  `pray`  `curse`"},
				{"name":"Meme Generation",
					"value":"`spongebobchicken`  `slapcar`"},
				{"name":"Emotes",
					"value":sEmotes},
				{"name":"Actions",
					"value":uEmotes},
				{"name":"Utility",
					"value":"`feedback`  `ping`  `stats`  `link`  `guildlink`  `disable`  `censor`  `patreon`"},
				]
	};

	send({embed});
}

function describe(send,commandName,command){
	if(command == undefined){
		send("**🚫 |** Could not find that command :c");
		return;
	}
	var desc = "\n# Description\n"+command.desc;
	var example = "";
	var related = "";
	var alias = "";
	var title= "< owo "+commandName+" ";
	if(command.args!="")
		title+= command.args+" >";
	else
		title += ">";
	if(command.alias[1]!=undefined){
		alias = "\n# Aliases\n";
		for(var i=0;i<command.alias.length;i++)
			alias += command.alias[i]+" , ";
		alias = alias.substr(0,alias.length-3);

	}
	if(command.example[0]!=undefined){
		example = "\n# Example Command(s)\n";
		for(var i=0;i<command.example.length;i++)
			example += command.example[i]+" , ";
		example = example.substr(0,example.length-3);
	}
	if(command.related[0]!=undefined){
		related = "\n# Related Command(s)\n";
		for(var i=0;i<command.related.length;i++)
			related += command.related[i]+" , ";
		related = related.substr(0,related.length-3);
	}
	var text = "```md\n"+title+"``````md"+alias+desc+example+related+"``````md\n> Remove brackets when typing commands\n> [] = optional arguments\n> {} = optional user input```";
	send(text);
}
