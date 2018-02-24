
/**
 * Displays user's cowoncy
 * @param {mysql.Connection}	con 	- Mysql.createConnection()
 * @param {discord.Client}	client	- Discord.js's client
 * @param {discord.Message}	msg 	- Discord's message
 */
exports.display = function(con, client, msg){
	//Check if its disabled
	var sql = "SELECT * FROM cowoncy WHERE id = "+msg.author.id+";";

	con.query(sql,function(err,rows,fields){
		if(err) throw err;
		if(rows[0]==undefined)
			msg.channel.send("<:cowoncy:416043450337853441>** "+msg.author.username+", you currently have __"+rows[0].money+"__ cowoncy!**");
		else
			msg.channel.send("<:cowoncy:416043450337853441>** "+msg.author.username+", you currently have __"+rows[0].money+"__ cowoncy!**");
	});
}

/**
 * Daily cowoncy
 */
exports.daily = function(con,msg){
	var sql = "SELECT TIMESTAMPDIFF(HOUR,daily,NOW()) AS hour,TIMESTAMPDIFF(MINUTE,daily,NOW()) AS minute,TIMESTAMPDIFF(SECOND,daily,NOW()) AS second FROM cowoncy WHERE id = "+msg.author.id+";UPDATE cowoncy SET daily = NOW(), money = money + 100 WHERE id = "+msg.author.id+" AND TIMESTAMPDIFF(DAY,daily,NOW()) >= 1;";
	con.query(sql,function(err,rows,fields){
		if(rows[0][0]==undefined)
			msg.channel.send("*OwO* uh-oh! Something went wrong! I'll try to fix it as soon as I can!");
		else if(rows[1].affectedRows==0){
			var hour = 23 - rows[0][0].hour;
			var min= 59 - (rows[0][0].minute%60);
			var sec = 59 - (rows[0][0].second%60);
			msg.channel.send("<:cowoncy:416043450337853441> Nu! You need to wait **"+hour+" H "+min+" M "+sec+" S**");
		}else{
			msg.channel.send("<:cowoncy:416043450337853441> *OwO What's this?*  Here's your daily **100** Cowoncy!");
		}
	});
}


