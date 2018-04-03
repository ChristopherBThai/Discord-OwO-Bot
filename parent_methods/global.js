var manager;
const login = require('../../tokens/owo-login.json');

//Establish mysql connection
var mysql = require('mysql');
var con = mysql.createConnection({
	host: "localhost",
	user: login.user,
	password: login.pass,
	database: "owo",
	supportBigNumbers: true,
	bigNumberStrings: true,
	multipleStatements: true,
	charset: "utf8mb4"
});

//Display log when connected to mysql
con.connect(function(err){
	if(err) throw err;
	console.log("Vote sql Connected!");
});

exports.setManager = function(manageri){
	manager = manageri;
}

exports.msgUser = function(id,msg){
	var rand = Math.floor(Math.random()*manager.totalShards);
	manager.broadcastEval(`
		if(this.shard.id==${rand}){
			this.fetchUser('${id}')
			.then(user => {
				if(user!=undefined)
					user.send('${msg}')
					.catch(err => console.error(err));
			}).catch(err => console.error(err));
		}
	`);
}

exports.con = function(){
	return con;
}
