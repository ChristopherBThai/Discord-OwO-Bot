/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

let con = require('../utils/mysql.js').con;
const acquireTimeLimit = 10000;

/* Converts mysql queries to Promises */
exports.query = function (sql, variables = []) {
	return new Promise((resolve, reject) => {
		con.query(sql, variables, function (err, rows) {
			if (err) return reject(err);
			resolve(rows);
		});
	});
};

exports.startTransaction = () => {
	return new Promise((res, rej) => {
		con.getConnection((err, acon) => {
			if (err) return rej(err);
			acon.beginTransaction((err) => {
				if (err) throw err;
			});

			const result = {
				commit: () => {
					delete result.commit;
					delete result.rollback;
					delete result.query;
					clearTimeout(releaseTimer);
					return new Promise((res, rej) => {
						acon.commit((err) => {
							if (err)
								return acon.rollback(() => {
									rej(err);
								});
							acon.release();
							res();
						});
					});
				},
				rollback: () => {
					delete result.commit;
					delete result.rollback;
					delete result.query;
					clearTimeout(releaseTimer);
					return new Promise((res) => {
						acon.rollback(() => {
							acon.release();
							res();
						});
					});
				},
				query: (sql, variables = []) => {
					return new Promise((res2, rej2) => {
						acon.query(sql, variables, (err, rows) => {
							if (err) return rej2(err);
							res2(rows);
						});
					});
				},
			};

			let releaseTimer = setTimeout(() => {
				console.error(`[${acon.threadId}] Mysql connection was not released!`);
				result.rollback();
			}, acquireTimeLimit);

			res(result);
		});
	});
};
