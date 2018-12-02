const CommandInterface = require('../../commandinterface.js');

const ud = require('urban-dictionary');
var count = 0;

module.exports = new CommandInterface({
	
	alias:["define"],

	args:"{word}",

	desc:"I shall define thy word!",

	example:["owo define tsundere"],

	related:[],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		var word = p.args.join(" ");
		try{
		await ud.term(word, function(error,entries,tags,sounds){
			if(word==""){
				p.send("**🚫 |** Silly human! Makes sure to add a word to define!",3000);
			}else if(error){
				p.send("**🚫 |** I couldn't find that word! :c",3000);
			}else{
				var def = entries[0].definition;
				var example = "\n*``"+entries[0].example+" ``*";
				var result = def+example;
				var run = true;
				do{
					var print = "";
					if(result.length>1700){
						print = result.substring(0,1700);
						result = result.substring(1700);
					}else{
						print = result;
						run = false;
					}
					var embed = {
					"description": print,
					"color": 4886754,
					"author": {
						"name": "Definition of '"+entries[0].word+"'",
						"icon_url": "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"
						}
					};
					p.msg.channel.send({ embed })
						.catch(err => p.msg.channel.send("I don't have permission to send embedded links! :c")
						.catch(err => console.error(err)));
				}while(run);
			}
		});
		}catch(err){}
	}

})
