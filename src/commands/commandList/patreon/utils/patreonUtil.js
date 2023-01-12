/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.giveCustomBattle = async function (p, id) {
	const sql = `INSERT into alterbattle (uid, type, color, footer, author) VALUES
		((SELECT uid FROM user WHERE id = ${id}), 'win', 65280,
			'You won in {turns} turns! Your team gained {xp} xp! Streak: {streak}', '{username} goes into battle'),
		((SELECT uid FROM user WHERE id = ${id}), 'lose', 16711680,
			'You lost in {turns} turns! Your team gained {xp} xp! You lost your streak of {streak} wins...', '{username} goes into battle'),
		((SELECT uid FROM user WHERE id = ${id}), 'tie', 6381923,
			"It\'s a tie in {turns} turns! Your team gained {xp} xp! Streak: {streak}", '{username} goes into battle');`;
	await p.query(sql);
};

exports.giveCustomHunt = async function (p, id) {
	const sql = `INSERT INTO alterhunt (uid, type) VALUES
		((SELECT uid FROM user WHERE id = ${id}), 'gems'),
		((SELECT uid FROM user WHERE id = ${id}), 'nogems');`;
	await p.query(sql);
};
