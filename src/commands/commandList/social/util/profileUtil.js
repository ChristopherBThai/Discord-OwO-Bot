/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const request = require('request');
const rings = require('../../../../data/rings.json');
const levels = require('../../../../utils/levels.js');
const animalUtil = require('../../battle/util/animalUtil.js');
const offsetID = 200;
const settingEmoji = '⚙';

var display = (exports.display = async function (p, user) {
	/* Construct json for POST request */
	let info = await generateJson(p, user);
	info.password = process.env.GEN_PASS;

	/* Returns a promise to avoid callback hell */
	try {
		return new Promise((resolve, _reject) => {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/profilegen`,
					json: true,
					body: info,
				},
				(error, res, body) => {
					if (error) {
						resolve('');
						return;
					}
					if (res.statusCode == 200) resolve(body);
					else resolve('');
				}
			);
		});
	} catch (err) {
		console.err(err);
		return '';
	}
});

async function generateJson(p, user) {
	let avatarURL = user.dynamicAvatarURL('png');
	avatarURL = avatarURL.replace(/\?[a-zA-Z0-9=?&]+/gi, '');

	let promises = [
		getMarriage(p, user),
		getRank(p, user),
		getCookie(p, user),
		getTeam(p, user),
		getBackground(p, user),
		levels.getUserLevel(user.id),
		getInfo(p, user),
	];
	promises = await Promise.all(promises);

	let marriage = promises[0];
	let rank = promises[1];
	let cookie = promises[2];
	let team = promises[3];
	let background = promises[4];
	let level = promises[5];
	let userInfo = promises[6];

	let aboutme = userInfo.about;
	let title = userInfo.title;
	let accent = userInfo.accent;
	let accent2 = userInfo.accent2;
	if (accent) background.color = accent;

	level = { lvl: level.level, maxxp: level.maxxp, currentxp: level.currentxp };

	let info = [];
	if (rank) info.push(rank);
	if (cookie) info.push(cookie);
	if (marriage) info.push(marriage);

	return {
		theme: {
			background: background.id,
			name_color: background.color,
			accent,
			accent2,
		},
		user: {
			avatarURL,
			name: user.username,
			discriminator: user.discriminator,
			title,
		},
		aboutme,
		level,
		info,
		team,
		rank,
		cookie,
		marriage,
	};
}

async function getRank(p, user) {
	let rank = p.global.toFancyNum(await levels.getUserRank(user.id));
	return {
		img: 'trophy.png',
		text: '#' + rank,
	};
}

async function getCookie(p, user) {
	let result = await p.query(`SELECT count FROM rep WHERE id = ${user.id};`);
	if (!result || !result[0]) return { img: 'cookie.png', text: '+0' };

	let count = result[0].count;
	count = '+' + shortenInt(count);
	return { img: 'cookie.png', text: count };
}

async function getMarriage(p, user) {
	let sql = `SELECT 
			u1.id AS id1,u2.id AS id2,TIMESTAMPDIFF(DAY,marriedDate,NOW()) as days,marriage.* 
		FROM marriage 
			LEFT JOIN user AS u1 ON marriage.uid1 = u1.uid 
			LEFT JOIN user AS u2 ON marriage.uid2 = u2.uid 
		WHERE u1.id = ${user.id} OR u2.id = ${user.id};`;
	let result = await p.query(sql);

	if (result.length < 1) return;

	// Grab user and ring information
	let ring = rings[result[0].rid];
	let so = user.id == result[0].id1 ? result[0].id2 : result[0].id1;
	so = await p.fetch.getUser(so);
	let tag = '';
	if (!so) so = 'Someone';
	else {
		tag = '#' + so.discriminator;
		so = so.username;
	}
	return { img: 'ring_' + ring.id + '.png', text: so, tag };
}

function shortenInt(value) {
	let newValue = value;
	if (value >= 1000) {
		let suffixes = ['', 'K', 'M', 'B', 'T'];
		let suffixNum = Math.floor((('' + value).length - 1) / 3);
		let shortValue = value / Math.pow(10, suffixNum * 3);
		let offset = Math.pow(10, 2 - Math.floor(Math.log10(shortValue)));
		if (offset == 0) shortValue = Math.round(shortValue);
		else shortValue = Math.round(shortValue * offset) / offset;
		newValue = shortValue + suffixes[suffixNum];
	}
	return newValue;
}

async function getTeam(p, user) {
	let sql = `SELECT tname,name,xp
		FROM pet_team
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid 
		WHERE pet_team.pgid = (
			SELECT pt2.pgid FROM user u2
				INNER JOIN pet_team pt2
					ON pt2.uid = u2.uid
				LEFT JOIN pet_team_active pt_act
					ON pt2.pgid = pt_act.pgid
			WHERE u2.id = ${user.id}
			ORDER BY pt_act.pgid DESC, pt2.pgid ASC
			LIMIT 1)
		ORDER BY pos DESC`;
	let result = await p.query(sql);
	if (!result || !result[0]) return;
	let animals = [];
	for (let i in result) {
		let animal = p.global.validAnimal(result[i].name);
		if (animal) {
			let animalID = animal.value.match(/:[0-9]+>/g);
			if (animalID) animalID = animalID[0].match(/[0-9]+/g)[0];
			else animalID = animal.value.substring(1, animal.value.length - 1);
			if (animal.hidden) animalID = animal.hidden;
			animals.push({ img: animalID, info: animalUtil.toLvl(result[i].xp) });
		}
	}
	let name = result[0].tname;
	if (!name) name = 'My Team';
	return { name, animals };
}

async function getBackground(p, user) {
	let sql = `SELECT b.name_color,b.bid FROM user u INNER JOIN user_profile up ON u.uid = up.uid INNER JOIN backgrounds b ON up.bid = b.bid WHERE id = ${user.id};`;
	let result = await p.query(sql);
	if (!result[0]) return { id: 1 };
	return { id: result[0].bid, color: result[0].name_color };
}

async function getInfo(p, user) {
	let sql = `SELECT user_profile.* from user_profile INNER JOIN user ON user.uid = user_profile.uid WHERE user.id = ${user.id};`;
	let result = await p.query(sql);
	let info = {
		about: "I'm just a plain human.",
		title: 'An OwO Bot User',
	};
	if (result[0]) {
		if (result[0].about) info.about = result[0].about;
		if (result[0].accent) info.accent = result[0].accent;
		if (result[0].accent2) info.accent2 = result[0].accent2;
		if (result[0].title) info.title = result[0].title;
	}
	return info;
}

//======================================================= PROFILE EDITS =========================================

var displayProfile = (exports.displayProfile = async function (p, user) {
	try {
		let uuid = await display(p, user);
		let url = `${process.env.GEN_HOST}/profile/${uuid}.png`;
		let data = await p.DataResolver.urlToBuffer(url);
		if (uuid) {
			await p.send('', null, { file: data, name: 'profile.png' });
		} else throw 'Not found';
	} catch (e) {
		console.error(e);
		p.errorMsg(', failed to create profile image... Try again later :(', 3000);
	}
});

exports.editBackground = async function (p) {
	// Arg check
	if (p.args.length < 3) {
		p.errorMsg(', the correct command is `owo profile set wallpaper {wallpaperID}`', 3000);
		return;
	}

	// parse bid
	let bid = p.args[2];
	if (!p.global.isInt(bid)) {
		p.errorMsg(', the correct command is `owo profile set wallpaper {wallpaperID}`', 3000);
		return;
	}
	bid = parseInt(bid) - offsetID;

	// Check if user has bid
	let sql = `SELECT u.uid,b.* FROM user u INNER JOIN user_backgrounds ub ON u.uid = ub.uid INNER JOIN backgrounds b ON ub.bid = b.bid WHERE u.id = ${p.msg.author.id} AND ub.bid = ${bid}`;
	let result = await p.query(sql);
	if (!result[0]) {
		p.errorMsg(", You don't have a wallpaper with this id! Please buy one from `owo shop`!", 3000);
		return;
	}

	// Equip
	sql = `INSERT INTO user_profile (uid,bid) VALUES (${result[0].uid},${result[0].bid}) ON DUPLICATE KEY UPDATE bid = ${result[0].bid};`;
	await p.query(sql);
	await displayProfile(p, p.msg.author);
};

exports.editAbout = async function (p) {
	if (p.args.length < 3) {
		p.errorMsg(', Invalid arguments! Please use `owo profile set about {text}`', 6000);
		return;
	}

	let uid = await getUid(p);

	if (!uid) {
		p.errorMsg(', failed to change settings', 3000);
		return;
	}

	let about = p.args.slice(2, p.args.length).join(' ');

	let sql = `INSERT INTO user_profile (uid,about) VALUES (${uid},?) ON DUPLICATE KEY UPDATE about = ?;`;
	await p.query(sql, [about, about]);
	await displayProfile(p, p.msg.author);
};

exports.editTitle = async function (p) {
	if (p.args.length < 3) {
		p.errorMsg(', Invalid arguments! Please use `owo profile set title {text}`', 6000);
		return;
	}

	let uid = await getUid(p);

	if (!uid) {
		p.errorMsg(', failed to change settings', 3000);
		return;
	}

	let title = p.args.slice(2, p.args.length).join(' ');

	let sql = `INSERT INTO user_profile (uid,title) VALUES (${uid},?) ON DUPLICATE KEY UPDATE title = ?;`;
	await p.query(sql, [title, title]);
	await displayProfile(p, p.msg.author);
};

exports.editAccent = async function (p) {
	if (p.args.length < 3) {
		p.errorMsg(', Invalid arguments! Please use `owo profile set accent {#rgb}`', 6000);
		return;
	}

	let rgb = p.args
		.slice(2, p.args.length)
		.join('')
		.replace(/[#, ]+/gi, '')
		.toLowerCase();
	if (rgb.length != 6) {
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`', 6000);
		return;
	}
	rgb = parseRGB(rgb);
	if (!rgb) {
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`', 6000);
		return;
	}

	let uid = await getUid(p);
	if (!uid) {
		p.errorMsg(', failed to change settings', 3000);
		return;
	}
	let sql = `INSERT INTO user_profile (uid,accent) VALUES (${uid},?) ON DUPLICATE KEY UPDATE accent = ?;`;
	await p.query(sql, [rgb, rgb]);
	await displayProfile(p, p.msg.author);
};

exports.editAccent2 = async function (p) {
	if (p.args.length < 3) {
		p.errorMsg(', Invalid arguments! Please use `owo profile set accent2 {#rgb}`', 6000);
		return;
	}

	let rgb = p.args
		.slice(2, p.args.length)
		.join('')
		.replace(/[#, ]+/gi, '')
		.toLowerCase();
	if (rgb.length != 6) {
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`', 6000);
		return;
	}
	rgb = parseRGB(rgb);
	if (!rgb) {
		p.errorMsg(', Invalid RGB! The correct format should look like `#FFFFFF`', 6000);
		return;
	}

	let uid = await getUid(p);
	if (!uid) {
		p.errorMsg(', failed to change settings', 3000);
		return;
	}
	let sql = `INSERT INTO user_profile (uid,accent2) VALUES (${uid},?) ON DUPLICATE KEY UPDATE accent2 = ?;`;
	await p.query(sql, [rgb, rgb]);
	await displayProfile(p, p.msg.author);
};

exports.setPublic = async function (p) {
	let uid = await getUid(p);
	if (!uid) {
		p.errorMsg(', failed to change settings', 3000);
		return;
	}
	let sql = `INSERT INTO user_profile (uid,private) VALUES (${uid},0) ON DUPLICATE KEY UPDATE private = 0;`;
	await p.query(sql);

	p.replyMsg(settingEmoji, ', Your profile can now be seen by anyone!');
};

exports.setPrivate = async function (p) {
	let uid = await getUid(p);
	if (!uid) {
		p.errorMsg(', failed to change settings', 3000);
		return;
	}
	let sql = `INSERT INTO user_profile (uid,private) VALUES (${uid},1) ON DUPLICATE KEY UPDATE private = 1;`;
	await p.query(sql);

	p.replyMsg(settingEmoji, ', Your profile can **not** be seen by anyone!');
};

async function getUid(p) {
	let sql = `SELECT uid FROM user WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	let uid;
	if (!result || !result[0]) {
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0);`;
		result = await p.query(sql);
		uid = result.insertId;
	} else {
		uid = result[0].uid;
	}
	return uid;
}

function parseRGB(rgb) {
	let rgb1 = parseInt(rgb.substring(0, 2), 16);
	if (rgb1 < 0 || rgb1 > 255) return;
	let rgb2 = parseInt(rgb.substring(2, 4), 16);
	if (rgb2 < 0 || rgb2 > 255) return;
	let rgb3 = parseInt(rgb.substring(4, 6), 16);
	if (rgb3 < 0 || rgb3 > 255) return;
	return rgb1 + ',' + rgb2 + ',' + rgb3 + ',255';
}
