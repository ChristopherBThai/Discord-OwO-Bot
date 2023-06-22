/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (main, message) {
	let { link, image } = JSON.parse(message);
	main.macro.setCaptchaLink(!!link);
	main.macro.setCaptchaImage(!!image);
};
