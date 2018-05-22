const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["db","declinebattle"],

	args:"",

	desc:"Decline a battle you or another person has started.",

	example:[],

	related:["owo ab","owo battle"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		var con=p.con,msg=p.msg,global=p.global;
		var sql = "SELECT * FROM battleuser WHERE (user1 = "+msg.author.id+" OR user2 = "+msg.author.id+" ) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
		sql += "UPDATE battleuser SET time = '2017-01-01 10:10:10' WHERE (user1 = "+msg.author.id+" OR user2 = "+msg.author.id+" ) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
		con.query(sql,async function(err,rows,fields){
			if(err) throw err;
			if(rows[0][0]==undefined){
				p.send("**🚫 | "+msg.author.username+"**,  You have no pending battles!",3000);
			}else{
				var opponent;
				if(rows[0][0].user1==msg.author.id)
					opponent = rows[0][0].user2;
				else
					opponent = rows[0][0].user1;
				var opponent = await global.getUser(opponent);
				if(opponent==undefined){
					p.send("**✅ | "+msg.author.username+"**, You have successfully declined your battle!",3000);
					return;
				}

				p.send("**✅ | "+msg.author.username+"**, You have successfully declined your battle against, **"+opponent.username+"**!");
			}
		});
	}

})
