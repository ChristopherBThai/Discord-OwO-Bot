/**
 * Commands to disable commands
 */

const global = require('./global.js');
const help = require('../json/help.json');

/**
 * Disables a command
 */
exports.disable = function(con,msg,command){
	var name = command;
	if(command == "all"){
		var list = "";
		for(var key in help){
			if(!help[key].global)
				list += "("+msg.channel.id+",'"+help[key].name+"'),";
		}
		list = list.slice(0,-1);
		var sql = "INSERT IGNORE INTO disabled (channel,command) VALUES "+list+";";
		con.query(sql,function(err,rows,field){
			if(err) throw err;
			msg.channel.send("**All** commands have been **disabled** for this channel!")
				.catch(err => console.error(err));
		});
		return;
	}
	command = global.validCommand(command);
	if(command == undefined)
		return;
	if(command.global){
		msg.channel.send("You cant disable that silly!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var sql = "INSERT IGNORE INTO disabled (channel,command) VALUES ("+msg.channel.id+",'"+command.name+"');";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		msg.channel.send("The command **"+name+"** has been **disabled** for this channel!")
			.catch(err => console.error(err));
	});
}

/**
 * Enable a command
 */
exports.enable = function(con,msg,command){
	var name = command;
	if(command == "all"){
		var list = "";
		for(var key in help){
			if(!help[key].global)
				list += "'"+help[key].name+"',";
		}
		list = list.slice(0,-1);
		var sql = "DELETE FROM disabled WHERE channel = "+msg.channel.id+" AND command IN ("+list+");";
		con.query(sql,function(err,rows,field){
			if(err) throw err;
			msg.channel.send("**All** commands have been **enable** for this channel!")
				.catch(err => console.error(err));
		});
		return;
	}
	command = global.validCommand(command);
	if(command == undefined)
		return;
	if(command.global){
		msg.channel.send("You cant enable that silly!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var sql = "DELETE FROM disabled WHERE channel = "+msg.channel.id+" AND command = '"+command.name+"';";
	con.query(sql,function(err,rows,field){
		if(err) throw err;
		msg.channel.send("The command **"+name+"** has been **enabled** for this channel!")
			.catch(err => console.error(err));
	});
}
