//+========================================+
//||					  ||
//||		HELPER METHODS		  ||
//||					  ||
//+========================================+


/**
 * Checks if its an integer
 * @param {string}	value - value to check if integer
 *
 */
exports.isInt = function(value){
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value,10));
}

/**
 * Shows the help message
 * @param {discord.Channel}	channel - The channel the message was sent in
 *
 */
exports.showHelp = function(channel){
	const embed = {
		"title":"OwO Bot Commands List",
		"url":"https://discordapp.com/oauth2/authorize?client_id=408785106942164992&permissions=2048&scope=bot",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
		"footer":{"text":"owo has a 10 second cooldown for counting"},
		"description": "\n**owo help** - Displays this commands list!"+
			"\n\n**owo rank [global] {count}** - displays the ranking of OwOs \ne.g `owo rank global`, `owo rank 25`, `owo rank global 25`"+
			"\n\n**owo {question}?** - replies as a yes/no answer \ne.g. `owo Am I cute?`"+
			"\n\n**owo feedback|suggestion|report {message}** - sends a message to an admin who will reply back \ne.g `owo feedback I love this bot!`"+
			"\n\n**owo disablerank|removerank** - disables the command 'owo rank' on the current channel"+
			"\n\n**owo enablerank|addrank** - enables the command 'owo rank' on the current channel\n"
	};
	channel.send({embed});
}

/**
 * Shows a link to invite this bot
 * @param {discord.Channel}	channel - The channel the message was sent in
 *
 */
exports.showLink = function(channel){
	const embed = {
		"title":"OwO! Click me to invite me to your server!",
		"url":"https://discordapp.com/oauth2/authorize?client_id=408785106942164992&permissions=2048&scope=bot",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
	};
	channel.send({embed});
}
