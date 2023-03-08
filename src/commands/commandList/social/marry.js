/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const alterMarry = require('../patreon/alterMarry.js');
const rings = require('../../../data/rings.json');
const dateOptions = {
	weekday: 'short',
	year: 'numeric',
	month: 'short',
	day: 'numeric',
};
const quotes = [
	'How cute!',
	'You look wonderful together!',
	'You guys are adorable!',
	'The perfect pair!',
	'Too cute~!!!',
	'Now kiss!',
];
const quotes2 = [
	'（´・｀ ）♡',
	'(๑°꒵°๑)･*♡',
	'♡´･ᴗ･`♡',
	'(*´c_,｀*)',
	'(●´Д`●)',
	'(つω`●）',
	'(◕ᴗ◕✿)',
	'(●⌒ｖ⌒●)',
	'(´ ꒳ ` ✿)',
	'OwO',
	'<3',
	';3',
	'c;',
];
const yes = '✅';
const no = '❎';

module.exports = new CommandInterface({
	alias: ['propose', 'marry', 'marriage', 'wife', 'husband'],

	args: '{ringID} {@user1}',

	desc: 'Use a ring to marry another user for extra daily rewards! You can reuse the command to upgrade a ring. All rings are the same, there are no extra benefits for a better ring.',

	example: ['owo marry 2 @Scuttler#0001'],

	related: ['owo daily', 'owo shop'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['social'],

	cooldown: 30000,

	execute: async function (p) {
		/* Multiple validation checks on user arguments */
		if (p.args.length <= 1) {
			display(p);
			return;
		}

		/* Parse user id and ring id from arguments */
		let id;
		let ringId;
		if (p.global.isUser(p.args[0]) && p.global.isInt(p.args[1])) {
			id = p.args[0].match(/[0-9]+/)[0];
			ringId = parseInt(p.args[1]);
		} else if (p.global.isUser(p.args[1]) && p.global.isInt(p.args[0])) {
			id = p.args[1].match(/[0-9]+/)[0];
			ringId = parseInt(p.args[0]);
		} else {
			p.errorMsg(
				", invalid arguments! Please include the person you're marrying and the ring id.",
				3000
			);
			return;
		}

		/* More validation checks */
		if (ringId < 1 || ringId > 7) {
			p.errorMsg(", that's not a valid ring id!", 3000);
			return;
		} else if (id == p.msg.author.id) {
			p.errorMsg(", silly. You can't marry yourself!", 3000);
			return;
		} else if (id == p.client.user.id) {
			p.errorMsg(", sorry love! I'm already taken c;", 3000);
			return;
		}

		let user = await p.getMention(id);
		if (!user) {
			p.errorMsg(', please tag a user to marry them!', 3000);
			return;
		} else if (user.bot) {
			p.errorMsg(", you silly hooman! You can't marry a bot!", 3000);
			return;
		}

		/* Send proposal*/
		await propose(p, user, ringId);
	},
});

async function propose(p, user, ringId) {
	/* Check if the opponent or user already has a request */
	let sql = `SELECT 
			(SELECT id FROM user WHERE uid = uid1) AS id1,
			(SELECT id FROM user WHERE uid = uid2) AS id2,
			marriage.* 
		FROM marriage WHERE uid1 IN (SELECT uid FROM user WHERE id IN (${p.msg.author.id},${user.id})) OR uid2 IN (SELECT uid FROM user WHERE id IN (${p.msg.author.id},${user.id}));`;
	sql += `SELECT * FROM propose WHERE sender IN (${p.msg.author.id},${user.id}) OR receiver IN (${p.msg.author.id},${user.id});`;
	sql += `SELECT * FROM user_ring INNER JOIN user ON user_ring.uid = user.uid WHERE id = ${p.msg.author.id} AND rid = ${ringId} AND rcount > 0;`;
	let result = await p.query(sql);
	if (result[0].length > 0) {
		upgradeRing(p, user, ringId, result[0][0], result[2]);
		return;
	}
	if (result[1].length > 0) {
		p.errorMsg(', you or your friend already has a marriage pending!');
		return;
	}

	/* Check if the user has the specified ring */
	sql = `UPDATE user_ring INNER JOIN user ON user_ring.uid = user.uid SET rcount = rcount - 1 WHERE id = ${p.msg.author.id} AND rid = ${ringId} AND rcount > 0;`;
	sql += `SELECT * FROM user WHERE id = ${user.id}`;
	result = await p.query(sql);
	if (result[0].changedRows < 1) {
		p.errorMsg(", You don't have this ring! Please buy one at `owo shop`!");
		return;
	}

	/* Insert proposal to the database */
	sql = `INSERT INTO propose (sender,receiver,rid) VALUES (${p.msg.author.id},${user.id},${ringId});`;
	if (result[1].length < 1) sql += `INSERT IGNORE INTO user (id,count) VALUES (${user.id},0);`;
	result = await p.query(sql);

	/* send proposal message to discord */
	let ring = rings[ringId];
	let embed = {
		fields: [
			{
				name: 'Once you have accepted, you will receive an extra lootbox or weapon crate when you both complete your daily!',
				value:
					'`owo am` to accept  |  `owo dm` to decline\nYou can divorce anytime with `owo divorce` or upgrade your marriage ring with `owo marry @' +
					user.username +
					'#' +
					user.discriminator +
					' {ringID}`',
			},
		],
		color: p.config.embed_color,
		author: {
			name:
				p.msg.author.username + ' has proposed to ' + user.username + ' with a ' + ring.name + '!',
			icon_url: p.msg.author.avatarURL,
		},
		timestamp: new Date(),
		thumbnail: {
			url:
				'https://cdn.discordapp.com/emojis/' +
				ring.emoji.match(/[0-9]+/)[0] +
				'.' +
				(ringId > 5 ? 'gif' : 'png'),
		},
	};
	p.send({ embed });
}

async function upgradeRing(p, user, ringId, result, ringResult) {
	// Validation checks
	if (
		!(
			(p.msg.author.id == result.id1 && user.id == result.id2) ||
			(p.msg.author.id == result.id2 && user.id == result.id1)
		)
	) {
		p.errorMsg(', you or your friend is already married!');
		return;
	} else if (ringResult.length < 1) {
		p.errorMsg(", you cannot upgrade your ring if you don't have it silly!", 3000);
		return;
	} else if (ringId == result.rid) {
		p.errorMsg(', you silly. You are already using a ring with the same rarity!');
		return;
	}

	// Send confirmation message
	let currentRing = rings[result.rid];
	let newRing = rings[ringId];
	let embed = {
		description:
			'**' +
			p.msg.author.username +
			'**, are you sure you want to change your **' +
			currentRing.name +
			'** to a' +
			(p.global.isVowel(newRing.name) ? 'n' : '') +
			' **' +
			newRing.name +
			'**?\n*You will not get your ring back!*',
		thumbnail: {
			url:
				'https://cdn.discordapp.com/emojis/' +
				currentRing.emoji.match(/[0-9]+/)[0] +
				'.' +
				(currentRing.id > 5 ? 'gif' : 'png'),
		},
		color: p.config.embed_color,
	};
	let msg = await p.send({ embed });

	// Add reaction collector
	await msg.addReaction(yes);
	await msg.addReaction(no);
	let filter = (emoji, userID) =>
		(emoji.name === yes || emoji.name === no) && userID === p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, { time: 60000 });
	let reacted = false;
	collector.on('collect', async function (emoji) {
		if (reacted) return;
		reacted = true;
		collector.stop('done');
		if (emoji.name == yes) {
			embed.color = 6381923;

			// Delete ring from user inventory
			let sql = `UPDATE user_ring INNER JOIN user ON user_ring.uid = user.uid SET rcount = rcount - 1 WHERE id = ${p.msg.author.id} AND rid = ${ringId} AND rcount > 0;`;
			let iresult = await p.query(sql);
			if (iresult.changedRows < 1) {
				embed.description =
					embed.description + "\n\n🚫 I don't see the ring in your inventory... 😏";
				msg.edit({ embed });
				return;
			}

			// Add ring to marriage
			sql = `UPDATE marriage SET rid = ${ringId} WHERE uid1 = ${result.uid1} AND uid2 = ${result.uid2}`;
			iresult = await p.query(sql);
			if (iresult.changedRows < 1) {
				sql = `UPDATE user_ring INNER JOIN user ON user_ring.uid = user.uid SET rcount = rcount + 1 WHERE id = ${p.msg.author.id} AND rid = ${ringId};`;
				p.query(sql);
				embed.description = embed.description + '\n\n🚫 You are currently not married...';
				msg.edit({ embed });
				return;
			}

			// Update message
			embed.description =
				embed.description + '\n\n' + newRing.emoji + ' You decided to change the ring!';
			embed.thumbnail.url =
				'https://cdn.discordapp.com/emojis/' +
				newRing.emoji.match(/[0-9]+/)[0] +
				'.' +
				(newRing.id > 5 ? 'gif' : 'png');
			msg.edit({ embed });
		} else {
			embed.color = 6381923;
			embed.description =
				embed.description + '\n\n' + currentRing.emoji + ' You decided not to upgrade';
			msg.edit({ embed });
		}
	});

	// Once reaction collector ends, change color of embed message
	collector.on('end', async function (collected, reason) {
		if (reason == 'done') return;
		embed.color = 6381923;
		await msg.edit({ embed });
	});
}

async function display(p) {
	// Grab marriage information
	let sql = `SELECT 
			u1.id AS id1,u2.id AS id2,TIMESTAMPDIFF(DAY,marriedDate,NOW()) as days,marriage.* 
		FROM marriage 
			LEFT JOIN user AS u1 ON marriage.uid1 = u1.uid 
			LEFT JOIN user AS u2 ON marriage.uid2 = u2.uid 
		WHERE u1.id = ${p.msg.author.id} OR u2.id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	if (result.length < 1) {
		p.errorMsg(
			', you are not married! Please purchase and include the ring id in the command! ex. `owo marry @user {ringID}`',
			3000
		);
		return;
	}

	// Grab user and ring information
	let ring = rings[result[0].rid];
	let so = p.msg.author.id == result[0].id1 ? result[0].id2 : result[0].id1;
	so = await p.fetch.getUser(so);

	// Display marriage info
	let embed = {
		author: {
			name:
				p.msg.author.username +
				', you are happily married to ' +
				(so ? so.username : 'someone') +
				'!',
			icon_url: p.msg.author.avatarURL,
		},
		description:
			'Married since **' +
			new Date(result[0].marriedDate).toLocaleDateString('default', dateOptions) +
			'** (**' +
			result[0].days +
			' days**)\nYou have claimed **' +
			result[0].dailies +
			' dailies** together!\n' +
			quotes[Math.floor(Math.random() * quotes.length)] +
			' ' +
			quotes2[Math.floor(Math.random() * quotes2.length)],
		thumbnail: {
			url:
				'https://cdn.discordapp.com/emojis/' +
				ring.emoji.match(/[0-9]+/)[0] +
				'.' +
				(ring.id > 5 ? 'gif' : 'png'),
		},
		color: p.config.embed_color,
	};

	embed = alterMarry.alter(p, embed, {
		user: p.msg.author,
		so: so,
		marriedSince: new Date(result[0].marriedDate).toLocaleDateString('default', dateOptions),
		marriedDays: result[0].days,
		marriedClaims: result[0].dailies,
	});
	p.send({ embed });
}
