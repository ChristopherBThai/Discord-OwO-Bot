/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (main, message) {
	const { js, channel } = JSON.parse(message);
	const shardId = main.bot.shards.values().next().value.id;
	setTimeout(() => {
		let result;
		try {
			result = evalInContext(js, main);
		} catch (err) {
			result = err;
		}
		main.bot.createMessage(channel, `\`\`\`js\n${result}\n\`\`\``);
	}, shardId * 500);
};

function evalInContext(js, context) {
	return function () {
		return eval(js);
	}.call(context);
}
