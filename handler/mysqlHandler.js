/*
 * Handles MySQL queries 
 */

module.exports = class MySQL{

	/* Constructer to grab mysql connection */
	constructor(connection) {
		this.con = connection
	}

	/* Converts mysql queries to Promises */
	query(sql) {
		return new Promise( (resolve, reject) => {
			this.con.query(sql,function(err,rows){
				if(err) return reject(err);
				resolve(rows);
			});
		});
	}
}
