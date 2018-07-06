const animal = "";
const daily = "";
const con = require('./mysql.js').con;
const sender = require('./sender.js');

exports.update = function(oldMember,newMember){
	if(newMember.guild.id != '420104212895105044')
		return;
	if(oldMember.roles.has('449429399217897473')){
		if(!newMember.roles.has('449429399217897473')){
			lostDaily(newMember);
		}
	}else{
		if(newMember.roles.has('449429399217897473')){
			gainedDaily(newMember);
		}
	}
	if(oldMember.roles.has('449429255781351435')){
		if(!newMember.roles.has('449429255781351435')){
			lostAnimal(newMember);
		}
	}else{
		if(newMember.roles.has('449429255781351435')){
			gainedAnimal(newMember);
		}
	}
}

exports.left = function(member){
	if(member.guild.id != '420104212895105044')
		return;
	var patreon = false;
	if(member.roles.has('449429255781351435')||member.roles.has('449429399217897473')){
		patreon = true;
	}

	if(patreon){
		var sql = "UPDATE IGNORE user SET patreonDaily = 0,patreonAnimal = 0 WHERE id = "+member.id+";";
		con.query(sql,function(err,result){
			if(err) {console.error(err);return;}
			member.send("Just a heads up! Your Patreon benefits will not work if you leave the guild!");
		});
	}
}

function messageUser(user){
	user.send("Thank you for supporting owo bot! Every dollar counts and I appreciate your donation!! If you encounter any problems, let me know!\n\nXOXO,\n**Scuttler#0001**")
		.catch(err => console.error(err));
}

function gainedDaily(user){
	var sql = "INSERT INTO user (id,count,patreonDaily) VALUES ("+user.id+",0,1) ON DUPLICATE KEY "+
		"UPDATE patreonDaily = 1;";
	sql += "SELECT * FROM user WHERE id = "+user.id+";";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(result[1][0]&&result[1][0].patreonAnimal== 0)
			messageUser(user);
		console.log(user.user.username+"["+user.id+"] gained patreon daily perk!");
	});
}

function lostDaily(user){
	var sql = "UPDATE IGNORE user SET patreonDaily = 0 WHERE id = "+user.id+";";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		user.send("Your patreon donation has expired! Thank you **so** much for supporting OwO bot! <3\n\nXOXO,\n**Scuttler#0001**")
		.catch(err => console.error(err));
		console.log(user.user.username+"["+user.id+"] lost patreon daily perk!");
	});
}

function gainedAnimal(user){
	var sql = "INSERT INTO user (id,count,patreonAnimal) VALUES ("+user.id+",0,1) ON DUPLICATE KEY "+
		"UPDATE patreonAnimal = 1;";
	sql += "SELECT * FROM user WHERE id = "+user.id+";";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		if(result[1][0]&&result[1][0].patreonDaily == 0)
			messageUser(user);
		console.log(user.user.username+"["+user.id+"] gained patreon animal perk!");
	});
}

function lostAnimal(user){
	var sql = "UPDATE IGNORE user SET patreonAnimal = 0 WHERE id = "+user.id+";";
	con.query(sql,function(err,result){
		if(err) {console.error(err);return;}
		user.send("Your patreon donation has expired! Thank you **so** much for supporting OwO bot! <3\n\nXOXO,\n**Scuttler#0001**")
		.catch(err => console.error(err));
		console.log(user.user.username+"["+user.id+"] lost patreon animal perk!");
	});
}

