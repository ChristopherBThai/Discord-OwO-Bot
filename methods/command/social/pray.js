const CommandInterface = require('../../commandinterface.js');

const prayLines = ["May luck be in your favor.","You feel lucky!","You feel very lucky!","You can feel the luck within you!","Fortune favors you!","Luck is on your side!"];
const curseLines = ["You feel unlucky...","You feel very unlucky.","Oh no.","You should be careful...","I've got a bad feeling about this...","oh boy.","rip"];

module.exports = new CommandInterface({
	
	alias:["pray","curse"],

	args:"{@user}",

	desc:"Pray or curse yourself or other users!!",

	example:["owo pray","owo pray @scuttler"],

	related:[],

	cooldown:300000,
	half:100,
	six:500,
	bot:true,

	execute: async function(p){
		var user = undefined;
		if(p.args.length>0)
			user = await p.global.getUser(p.args[0]);
		if(user&&user.id == p.msg.author.id)
			user = undefined;

		var text = "";
		var authorPoints = 0, opponentPoints = 0;
		if(p.command=="pray"){
			const prayLine = prayLines[Math.floor(Math.random()*prayLines.length)];
			if(user){
				text = "**🙏 | "+p.msg.author.username+"** prays for **"+user.username+"**! "+prayLine;
				authorPoints = -1;
				opponentPoints = 1;
			}else{
				text = "**🙏 | "+p.msg.author.username+"** prays... "+prayLine;
				authorPoints = 1;
			}
		}else{
			const curseLine = curseLines[Math.floor(Math.random()*curseLines.length)];
			if(user){
				text = "**👻 | "+p.msg.author.username+"** puts a curse on **"+user.username+"**! "+curseLine;
				authorPoints = 1;
				opponentPoints = -1;
			}else{
				text = "**👻 | "+p.msg.author.username+"** is now cursed. "+curseLine;
				authorPoints = -1;
			}
		}
		var sql = "INSERT INTO luck (id,lcount) VALUES ("+p.msg.author.id+","+authorPoints+") ON DUPLICATE KEY UPDATE lcount = lcount "+((authorPoints>0)?"+"+authorPoints:authorPoints)+";";
		sql += "SELECT lcount FROM luck WHERE id = "+p.msg.author.id+";";
		if(opponentPoints&&user)
			sql += "INSERT INTO luck (id,lcount) VALUES ("+user.id+","+opponentPoints+") ON DUPLICATE KEY UPDATE lcount = lcount "+((opponentPoints>0)?"+"+opponentPoints:opponentPoints)+";";
		p.con.query(sql,function(err,result){
			if(err) {console.error(err);return;}
			text += "\n**<:blank:427371936482328596> |** You have **"+(result[1][0].lcount)+"** luck point(s)!";
			p.send(text);
		});
	}

})
