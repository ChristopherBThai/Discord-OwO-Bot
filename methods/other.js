//+========================================+
//||					  ||
//||		OTHER METHODS		  ||
//||					  ||
//+========================================+

var eightballCount = 46;

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
