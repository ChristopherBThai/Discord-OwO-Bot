const CommandInterface = require('../../commandinterface.js');

const weeb = require('../../../util/weeb.js');
const emotes = require('../../../json/emotes.json').uEmote;
var emoteList = [];
for(var key in emotes)
	emoteList.push(key);

module.exports = new CommandInterface({
	
	alias:emoteList,
	distinctAlias:true,

	args:"",

	desc:"Express your emotions on others!",

	example:["owo "+emoteList.join("|")],

	related:["owo cry","owo pout","owo dance","and more"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		var global=p.global,args=p.args,msg=p.msg,client=p.client;
		if(!global.isUser(args[0])){
			p.send("**🚫 |** Wrong arguments! Please tag someone!",3000);
			return;
		}
		var target = await global.getUser(args[0]);
		if(target == undefined){
			p.send("**🚫 |** I couldn't find that user :c",3000);
			return;
		}
		var emote = emotes[p.command];
		if(emote == undefined){
			p.send("**🚫 |** Wrong arguments! Please tag someone!",3000);
			return;
		}
		if(emote.alt!=undefined)
			emote = emotes[emote.alt];
		if(msg.author.id==target.id){
			var text = emote.self[Math.floor(Math.random()*emote.self.length)];
			text = text.replace(/\?/,msg.author.username);
			msg.channel.send(text)
				.catch(err => consoleI.error(err));
			return;
		}
		var text = emote.msg[Math.floor(Math.random()*emote.msg.length)];
		text = text.replace(/\?/,msg.author.username);
		text = text.replace(/\?/,target.username);
		weeb.grab(msg,emote.name,"gif",text);
		p.quest("emoteTo");
		p.quest("emoteBy",1,target);
	}

})
