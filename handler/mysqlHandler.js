/*
 * Handles MySQL queries 
 */

module.exports = class MySQL{

	/* Constructer to grab mysql connection */
	constructor(connection) {
		if(connection)
			this.con = connection
		else
			this.con =  require('../util/mysql.js').con;
	}

	/* Converts mysql queries to Promises */
	query(sql,variables = []) {
		return new Promise( (resolve, reject) => {
			var query = this.con.query(sql,variables,function(err,rows){
				if(err) return reject(err);
				resolve(rows);
			});
			//console.log(query.sql);
		});
	}
}
