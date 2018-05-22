const CommandInterface = require('../../commandinterface.js');

const weeb = require('../../../util/weeb.js');
const emotes = require('../../../json/emotes.json').sEmote;
var emoteList = [];
for(var key in emotes)
	emoteList.push(key);

module.exports = new CommandInterface({
	
	alias:emoteList,
	distinctAlias:true,

	args:"",

	desc:"Express your emotions!",

	example:["owo "+emoteList.join("|")],

	related:["owo slap","owo kiss","owo hug","and more"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		var emote = emotes[p.command];
		if(emote == undefined)
			return;
		if(emote.alt!=undefined)
			emote = emotes[emote.alt];
		var text = emote.msg[Math.floor(Math.random()*emote.msg.length)];
		text = text.replace(/\?/,p.msg.author.username);
		weeb.grab(p.msg,emote.name,"gif",text);
	}

})
