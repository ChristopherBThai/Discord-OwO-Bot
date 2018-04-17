//+========================================+
//||					  ||
//||		OTHER METHODS		  ||
//||					  ||
//+========================================+

const ud = require('urban-dictionary');
var eightballCount = 55;

/**
 * Disables 'owo rank'
 * @param {mysql.con}	con
 * @param {int} 	id - id of guild
 */
exports.disable = function(con, id){
	var sql = "INSERT IGNORE INTO blacklist (id) VALUES ("+id+");"

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
}

/**
 * Enables 'owo rank'
 * @param {mysql.con}	con
 * @param {int} 	id - id of guild
 */
exports.enable = function(con, id){
	var sql = "DELETE FROM blacklist WHERE id = "+id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
	});
}

/**
 * Eightball that replies as a yes/no answer
 * @param {mysql.con} 		con
 * @param {discord.Message} 	msg - Discord's message
 * @param {boolean}		isMention - if the command was called as a mention or not
 */
exports.eightball = function(con,msg,isMention,prefix){
	var id = Math.ceil(Math.random()*eightballCount);
	var sql = "SELECT answer FROM eightball WHERE id = "+id+";";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		var question = msg.content;
		if(isMention)
			question = question.substring(question.indexOf(" ")+1);
		else
			question = question.substring(prefix.length+1);
			
		msg.channel.send("**🎱 | "+msg.author+" asked:**  "+question+"\n**<:blank:427371936482328596> | Answer:**  "+rows[0].answer)
			.catch(err => console.error(err));
		console.log("\x1b[36m%s\x1b[0m","    question: "+question);
		console.log("\x1b[36m%s\x1b[0m","    answer: "+rows[0].answer);
	});
}

/**
 * Defines a word via urban dictionary
 * @param 
 */
exports.define = function(msg,word){
	ud.term(word, function(error,entries,tags,sounds){
		if(word==""){
			msg.channel.send("Silly human! Makes sure to add a word to define!")
				.catch(err => console.error(err));
		}else if(error){
			msg.channel.send("I couldn't find that word! :c")
				.catch(err => console.error(err));
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

				msg.channel.send({ embed })
					.catch(err => msg.channel.send("I don't have permission to send embedded links! :c")
						.catch(err => console.error(err)));
			}while(run);
		}
	});
}

/**
 * Kisses a user!
 * @param {discord.Message} 	msg - Discord's message
 * @param {String[]}		args - arguments
 */
exports.kiss = function(msg,args){
	if(args[0]!=undefined)
		msg.channel.send("*OwO What's This?*\n"+msg.author+" kissed "+args.join(" ")+"!")
			.catch(err => console.error(err));
}

