const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["avatar","user"],

	args:"{@user}",

	desc:"Look at your or other people's avatar!",

	example:["owo avatar @OwO"],

	related:[],

	cooldown:2000,
	half:100,
	six:500,

	execute: function(p){
		var user = undefined;
		if(p.msg.mentions.members.first()){
			if(p.msg.mentions.members.size>1){
				p.send("**🚫 |"+p.msg.author.username+"**, I can only do one person at a time!",3000);
				return;
			}
			user = p.msg.mentions.members.first();
		}else{
			user = p.msg.member;
		}
		if(!user){
			p.send("**🚫 |"+p.msg.author.username+"**, Hmm.... Something went wrong...",3000);
			return;
		}

		const embed = {
			"fields": [{
					"name":user.user.tag+((user.user.bot)?" <:bot:489278383646048286>":"")+"  `"+user.presence.status+"`",
					"value":((user.nickname)?"`Nickname: "+user.nickname+"`\n":"")+"`ID: "+user.user.id+"`"+((user.colorRole)?"\n`RoleColor: "+user.displayHexColor+"`":"")
			}],
			"color": 4886754,
			"image":{"url":user.user.avatarURL},
		}
		p.send({embed});
	}

})
