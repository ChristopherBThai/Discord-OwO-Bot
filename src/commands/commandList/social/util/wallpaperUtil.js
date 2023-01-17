/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const offsetID = 200;
const wallpaperEmoji = '🖼';

exports.buy = async function (p, id) {
	let sql = `SELECT * FROM backgrounds WHERE bid = ${id - offsetID} AND active = 1;`;
	sql += `SELECT u.uid,b.bid FROM user u LEFT JOIN user_backgrounds b ON u.uid = b.uid AND b.bid = ${
		id - offsetID
	} WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	// Check if valid id
	if (!result[0] || !result[0][0]) {
		p.errorMsg(', That wallpaper id is not available!', 3000);
		return;
	}

	// First check if the user owns it
	if (result[1][0] && result[1][0].bid) {
		p.errorMsg(', you already own that wallpaper!', 3000);
		return;
	}

	// Decrement cowoncy
	let price = result[0][0].price;
	sql = `UPDATE cowoncy SET money = money - ${price} WHERE id = ${p.msg.author.id} AND money >= ${price};`;
	let result2 = await p.query(sql);
	if (result2.affectedRows <= 0) {
		p.errorMsg(", you don't have enough cowoncy! :c", 3000);
		return;
	}

	// Add wallpaper to their inventory
	let uid;
	if (!result[1][0]) {
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0);`;
		result2 = await p.query(sql);
		uid = result2.insertId;
	} else uid = result[1][0].uid;
	let bid = result[0][0].bid;
	sql = `INSERT INTO user_backgrounds (uid,bid) VALUES (${uid},${bid});`;
	await p.query(sql);

	// Send reply
	let embed = {
		author: {
			name:
				p.msg.author.username + ', you have successfully purchased "' + result[0][0].bname + '"!',
			icon_url: p.msg.author.avatarURL,
		},
		color: p.config.embed_color,
		image: {
			url: `${process.env.GEN_HOST}/background/${bid}/.png`,
		},
	};
	await p.send({ embed });
};

exports.getItems = async function (p) {
	let sql = `SELECT COUNT(bid) AS count FROM user INNER JOIN user_backgrounds ON user.uid = user_backgrounds.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	if (!result[0]) {
		return {};
	}
	if (result[0].count <= 0) {
		return {};
	}

	let items = {
		'2--': {
			emoji: wallpaperEmoji,
			id: '2--',
			count: result[0].count,
		},
	};

	return items;
};
