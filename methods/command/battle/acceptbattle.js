const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const battleUtil = require('./battleutil.js');
const petUtil = require('./petutil.js');

module.exports = new CommandInterface({

	alias:["ab","acceptbattle"],

	args:"",

	desc:"Accept a battle from a user",

	example:[],

	related:["owo db","owo battle"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		var con=p.con,msg=p.msg,args=p.args;
		var sql = "SELECT * FROM battleuser WHERE ((user1 = "+msg.author.id+" AND sender = 2) OR (user2 = "+msg.author.id+" AND sender = 1)) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
		con.query(sql,async function(err,rows,fields){
			if(err) throw err;
			if(rows[0]==undefined){
				p.send("**🚫 | "+msg.author.username+"**, You have no pending battles!",3000);
			}else{
				var amount = rows[0].amount;
				var user1 = await global.getUser(rows[0].user1);
				var pid1 = rows[0].pid1;
				if(user1==undefined){
					p.send("**🚫 | "+msg.author.username+"**, I could not find that user",3000);
					return;
				}
				var user2 = await global.getUser(rows[0].user2);
				var pid2 = rows[0].pid2;
				if(user2==undefined){
					p.send("**🚫 | "+msg.author.username+"**, I could not find that user",3000);
					return;
				}
				var win1 = rows[0].win1;
				var win2 = rows[0].win2;
				if(global.isInt(args[1]))
					amount = parseInt(args[1]);
				sql = "SELECT money FROM cowoncy WHERE id IN ("+user1.id+","+user2.id+") AND money >= "+amount+";";
				sql += "UPDATE battleuser SET time = '2017-01-01 10:10:10' WHERE (user1 = "+user1.id+" OR user2 = "+user1.id+") AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 5;";
				con.query(sql,function(err,rows,fields){
					if(err) throw err;
					if(rows[0].length<2){
						p.send("**🚫 | "+msg.author.username+"**, Looks like someone doesn't have enough cowoncy!",3000);
					}else{
						startBattle(con,msg,user1,pid1,user2,pid2,amount,p.send,p);
					}
				});
			}
		});
	}

})

function startBattle(con,msg,user1,pid1,user2,pid2,amount,send,p){
	var sql = "SELECT id,money,nickname,name,lvl,att,hp,lvl,streak,xp, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three "+
		"FROM (cowoncy NATURAL JOIN animal) LEFT JOIN (animal_food NATURAL JOIN food) "+
		"ON animal.pid = animal_food.pid "+
		"WHERE id = "+user1.id+" AND animal.pid = "+pid1+" GROUP BY animal.pid;";
	sql += "SELECT id,money,nickname,name,lvl,att,hp,lvl,streak,xp, "+
			"GROUP_CONCAT((CASE WHEN pfid = 1 THEN fname ELSE NULL END)) AS one, "+
			"GROUP_CONCAT((CASE WHEN pfid = 2 THEN fname ELSE NULL END)) AS two, "+
			"GROUP_CONCAT((CASE WHEN pfid = 3 THEN fname ELSE NULL END)) AS three "+
		"FROM (cowoncy NATURAL JOIN animal) LEFT JOIN (animal_food NATURAL JOIN food) "+
		"ON animal.pid = animal_food.pid "+
		"WHERE id = "+user2.id+" AND animal.pid = "+pid2+" GROUP BY animal.pid;";
	sql += "UPDATE cowoncy SET money = money - "+amount+" WHERE id IN ("+user1.id+","+user2.id+");"
	con.query(sql,function(err,rows,fields){
		p.logger.value('cowoncy',(amount*-1),['command:battleuser','id:'+user1.id]);
		p.logger.value('cowoncy',(amount*-1),['command:battleuser','id:'+user2.id]);
		if(err) throw err;

		//Grab pet info
		var upet = battleUtil.extractInfo(rows[0][0],user1);
		var opet = battleUtil.extractInfo(rows[1][0],user2);

		//Check if pets are valid
		if(upet == undefined){
			send("**🚫 | "+user1.username+"** doesn't have a pet!",3000);
			return;
		}
		if(opet == undefined){
			send("**🚫 | "+user2.username+"** doesn't have a pet!",3000);
			return;
		}

		var betmsg = "**"+user1.username+"** and **"+user2.username+"** bet <:cowoncy:416043450337853441> "+(global.toFancyNum(amount))+" to fight!";
		if(amount==0)
			betmsg = "**"+user1.username+"** and **"+user2.username+"** goes into battle!";

		var battleInfo = {count:0,color:4886754,line1:"-----------------------",line2:"-----------------------",line3:"",line4:""};
		var embed = battleUtil.createDisplay(upet,opet,battleInfo);
		var battleLog = [embed];

		//Fight 3 times
		var prize1 = amount;
		var prize2 = amount;
		for(var i=0;i<3;i++){
			var result = battleUtil.battleTurn(upet,opet,battleInfo);
			if(result){
				//Check who won and give xp
				if(result=="won"){
					prize1 = amount*2;
					prize2 = 0;
					if(amount==0)
						battleInfo.line4 = user1.username+" earned bragging rights!";
					else
						battleInfo.line4 = user1.username+" won "+(global.toFancyNum(amount*2))+" cowoncy!";
				}else if(result=="lost"){
					prize1 = 0;
					prize2 = amount*2;
					if(amount==0)
						battleInfo.line4 = user2.username+" earned bragging rights!";
					else
						battleInfo.line4 = user2.username+" won "+(global.toFancyNum(amount*2))+" cowoncy!";
				}else{
					if(upet.hp>opet.hp){
						prize1 = amount*2;
						prize2 = 0;
						if(amount==0)
							battleInfo.line4 = user1.username+" earned bragging rights!";
						else
							battleInfo.line4 = user1.username+" won "+(global.toFancyNum(amount*2))+" cowoncy!";
					}else if(opet.hp>upet.hp){
						prize1 = 0;
						prize2 = amount*2;
						if(amount==0)
							battleInfo.line4 = user2.username+" earned bragging rights!";
						else
							battleInfo.line4 = user2.username+" won "+(global.toFancyNum(amount*2))+" cowoncy!";
					}else{
						battleInfo.line4 = "No one wins cowoncy!";
					}

				}

				var sql = "UPDATE cowoncy SET money = money + "+prize1+" WHERE id = "+user1.id+";";
				sql += "UPDATE cowoncy SET money = money + "+prize2+" WHERE id = "+user2.id+";";
				con.query(sql,function(err,rows,fields){
					if(err){console.error(err);return;}
					p.logger.value('cowoncy',prize1,['command:battleuser','id:'+user1.id]);
					p.logger.value('cowoncy',prize2,['command:battleuser','id:'+user2.id]);
				});

			}
			var embed = battleUtil.createDisplay(upet,opet,battleInfo);
			battleLog.push(embed);
		}

		//Display the fight
		msg.channel.send(betmsg,battleLog[0])
		.then(message => setTimeout(function(){

				if(battleLog[1]){message.edit(betmsg,battleLog[1])
				.then(message => setTimeout(function(){

				if(battleLog[2]){message.edit(betmsg,battleLog[2])
				.then(message => setTimeout(function(){

				if(battleLog[3]){message.edit(betmsg,battleLog[3])
				.then(message => setTimeout(function(){

				},1000)).catch(err=>console.error(err));}
				},1000)).catch(err=>console.error(err));}
				},1000)).catch(err=>console.error(err));}

		},1000)).catch(err => msg.channel.send("**🚫 | "+msg.author.username+"**, I don't have permission to send embeded messages!")
		.catch(err => console.error(err)));
	});
}
