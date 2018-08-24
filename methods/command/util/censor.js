const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["censor"],

	args:"",

	desc:"This will censor any bad words displayed in battle!",

	example:[],

	related:["owo uncensor"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		if(!p.msg.member.permissions.has('MANAGE_CHANNELS')){
			p.send("**🚫 | "+p.msg.author.username+"**, You are not an admin!",3000);
			return;
		}
		if(p.args.length>0){
			p.send("**🚫 | "+p.msg.author.username+"**, Invalid Arguments!",3000);
			return;
		}
		
		var sql = "INSERT INTO guild (id,count,young) VALUES ("+p.msg.guild.id+",0,1) ON DUPLICATE KEY UPDATE young = 1;";
		p.con.query(sql,function(err,result){
			if(err){ console.error(err); return;}
				p.send("**⚙ |** This guild is now kid friendly! Any offensive names in `battle` will be censored!");
		});
	}

})
