
/**
 * Sends a link to voting
 */
exports.link = function(msg){
	const embed = {
		"title":"Vote for me daily to receive 200+ Cowoncy!",
		"url":"https://discordbots.org/bot/408785106942164992/vote",
		"color": 4886754,
		"thumbnail":{"url":"https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png"},
	};
	msg.channel.send({embed})
		.catch(err => msg.channel.send("I don't have permission to send embedded links! :c")
			.catch(err => console.error(err)));
}
