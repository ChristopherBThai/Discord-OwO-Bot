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
			
		msg.channel.send("**"+msg.author+" asked:**  "+question+
			"\n**Answer:**  "+rows[0].answer);
		console.log("	question: "+question);
		console.log("	answer: "+rows[0].answer);
	});
}

/**
 * Defines a word via urban dictionary
 * @param 
 */
exports.define = function(msg,word){
	ud.term(word, function(error,entries,tags,sounds){
		if(error){
			msg.channel.send("I couldn't find that word! :c");
		}else{
			msg.channel.send(entries[0].word);
			msg.channel.send(entries[0].definition);
		}
	});
}

/**
 * Kisses a user!
 * @param {discord.Message} 	msg - Discord's message
 * @param {String[]}		args - arguments
 */
exports.kiss = function(msg,args){
	msg.channel.send("*OwO What's This?*\n"+msg.author+" kissed "+args[0]+"!");
}

/**
 * spanks a user!
 * @param {discord.Message} 	msg - Discord's message
 * @param {String[]}		args - arguments
 */
exports.spank = function(msg,args){
	msg.channel.send("*Naughty!*\n"+msg.author+" spanked "+args[0]+"!");
}

/**
 * hugs a user!
 * @param {discord.Message} 	msg - Discord's message
 * @param {String[]}		args - arguments
 */
exports.hug = function(msg,args){
	msg.channel.send("*Awww!!! adorable!*\n"+msg.author+" hugs "+args[0]+"!");
}

/**
 * Slaps a user!
 * @param {discord.Message} 	msg - Discord's message
 * @param {String[]}		args - arguments
 */
exports.slap= function(msg,args){
	msg.channel.send("*owie!*\n"+msg.author+" slaps "+args[0]+"!");
}
