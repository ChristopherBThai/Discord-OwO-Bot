/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const weeb = require('weeb.js');
const { stripIntents } = require('common-tags');
const { WEEBSH_TOKEN } = process.env;
const sh = new weeb('Wolke ' + WEEBSH_TOKEN, 'owo/1.0');

/**
 * Gets an image from weeb.sh
 */
exports.grab = function(p, ptype, ftype, text, notsfw, retry) {
	ftype = ftype.toLowerCase();
	ptype = ptype.toLowerCase();
	let nsfwt = false;
	let retryt = true;
	if (typeof notsfw == 'boolean' && notsfw) nsfwt = 'only';
	if (retryt && typeof retry == 'boolean') retryt = retry;
	sh.getRandom({ type: ptype, nsfw: nsfwt, filetype: ftype }).then(array => {
		if (!array) {
			return;
		}
		let embed = {
			'color': p.config.embed_color,
			'image': {
				'url': array.url
			},
			'author': {
				'name' : text,
				'url': array.url,
				'icon_url': p.msg.author.avatarURL
			}
		};
		return p.send({ embed });
	}).catch(err => {
		if (retryt && (ftype == 'jpg' || ftype == 'png')) {
			this.grab(p, ptype, (ftype == 'jpg') ? 'png' : 'jpg', text, notsfw, false);
		} else {
			return p.errorMsg(stripIntents`
				, I couldn\'t find that image type! :c 
				Type \`owo help gif\` for the list of types!
			`, 3000);
		}
	});
};

/**
 * Lists all weeb.sh types
 */
exports.getTypes = function(p) {
	sh.getTypes().then(array => {
		let txt = 'Available Image Types:\n';
		for (let i = 0; i < array.length; i++) txt += '`' + array[i] + '`, ';
		txt += '`nsfw`';
		txt += '\n*Some types will not work on pic*';
		return p.send(txt);
	});
};
