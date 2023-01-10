/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PageClass = require('./../PageClass.js');

const perPage = 10;
const pictureEmoji = '🖼';
const idOffset = 200;

module.exports = class WallpaperPage extends PageClass {
	constructor(p) {
		super(p);
		this.id = 2;
	}

	async totalPages() {
		let sql = 'SELECT COUNT(bid) AS count FROM backgrounds WHERE active = 1;';
		let result = await this.p.query(sql);
		let pages = Math.ceil(result[0].count / perPage);
		return pages;
	}

	async getPage(page, embed) {
		embed.author.name = 'OwO Shop: Wallpapers';
		embed.description =
			'Purchase a wallpaper for your profile!\n- **`owo shop wp {page}`** to view the wallpaper as images\n- **`owo buy {id}`** to buy an item\n- **`owo wallpaper`** to view your wallpapers\n- **`owo profile set wallpaper {id}`** to use it\n' +
			'═'.repeat(this.charLen + 2) +
			'\n';
		let sql = `SELECT b.*,user_backgrounds.uid  FROM backgrounds b LEFT JOIN (user INNER JOIN user_backgrounds ON user.uid = user_backgrounds.uid AND id = ${
			this.p.msg.author.id
		}) ON b.bid = user_backgrounds.bid WHERE b.active = 1 LIMIT ${perPage} OFFSET ${
			perPage * (page - 1)
		};`;
		let result = await this.p.query(sql);
		for (let i in result) {
			let wallpaper = result[i];
			embed.description += this.toItem({
				id: idOffset + wallpaper.bid,
				emoji: pictureEmoji,
				name: wallpaper.bname,
				url: `${process.env.GEN_HOST}/background/${wallpaper.bid}.png`,
				price: this.p.global.toShortNum(wallpaper.price),
				priceEmoji: '<:cowoncy:416043450337853441>',
				lineThrough: !!wallpaper.uid,
			});
		}
		return embed;
	}
};
