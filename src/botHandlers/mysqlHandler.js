/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/*
 * Handles MySQL queries
 */

module.exports = class MySQL{

	/* Constructer to grab mysql connection */
	constructor(connection) {
		if(connection)
			this.con = connection
		else{
			this.con =  require('../utils/mysql.js').con;
		}
	}

	/* Converts mysql queries to Promises */
	query(sql,variables = []) {
		return new Promise( (resolve, reject) => {
			let query = this.con.query(sql,variables,function(err,rows){
				if(err) return reject(err);
				resolve(rows);
			});
		});
	}
}
