/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const PageClass = require('./../PageClass.js');

const imagegen = require('../../../../../tokens/imagegen.json');
const perPage = 10;
const pictureEmoji = '🖼';
const idOffset = 200;

module.exports = class WallpaperPage extends PageClass {

    constructor(p){
		super(p);
		this.id = 2;
	}

	async totalPages(){
		let sql = `SELECT COUNT(bid) AS count FROM backgrounds;`;
		let result = await this.p.query(sql);
		let pages = Math.ceil(result[0].count/perPage);
		return pages;
	}

	async getPage(page,embed){
		embed.author.name = "OwO Shop: Wallpapers";
		embed.description = "Purchase a wallpaper for your profile!\n- **`owo buy ${id}`** to buy an item\n- **`owo wallpaper`** to view your wallpapers\n- **`owo profile set wallpaper {id}`** to use it\n"+('═'.repeat(this.charLen+2));
		let sql = `SELECT user_backgrounds.uid,backgrounds.* FROM backgrounds LEFT JOIN user_backgrounds ON backgrounds.bid = user_backgrounds.bid WHERE uid = (SELECT uid FROM user WHERE id = ${this.p.msg.author.id}) OR uid IS NULL LIMIT ${perPage} OFFSET ${perPage*(page-1)};`;
		let result = await this.p.query(sql);
		for(let i in result){
			let wallpaper = result[i];
			let price = this.p.global.toShortNum(wallpaper.price);
			let cLength = this.charLen-wallpaper.bname.length+(4-(""+price).length);
			if(cLength<0) cLength = 0;
			embed.description += "\n";
			if(wallpaper.uid) embed.description += "~~";
			embed.description += `\`${idOffset+wallpaper.bid}\` ${pictureEmoji} **[\`${wallpaper.bname}\`](${imagegen.assetUrl}/background/${wallpaper.bid}.png)**\`${"-".repeat(cLength)} ${price}\` <:cowoncy:416043450337853441>`;
			if(wallpaper.uid) embed.description += "~~";
		}
		return embed;
	}
}
