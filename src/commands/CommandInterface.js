/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

module.exports = class CommandInterface {
	constructor(args) {
		for (let key in args) {
			if (key == 'execute') {
				this.executeCommand = args[key];
			} else {
				this[key] = args[key];
			}
		}
	}

	async execute(params) {
		// Check if the bot has the correct perms first
		if (params.msg.channel.type === 0 && this.permissions) {
			let channel = params.msg.channel;
			let channelPerms = channel.permissionsOf(params.client.user.id);
			for (let i in this.permissions) {
				if (!channelPerms.has(this.permissions[i])) {
					if (channelPerms.has('sendMessages') && channelPerms.has('readMessages'))
						params.errorMsg(
							', the bot does not have the `' +
								this.permissions[i] +
								'` permission! Please reinvite the bot, or contact your server admin!',
							4000
						);
					params.logger.incr('noperms', 1, { permission: this.permissions }, params.msg);
					return;
				}
			}
		}

		// Check if command is for nsfw only
		if (this.nsfw && !params.msg.channel.nsfw) {
			params.errorMsg(', This command can only be used in **nsfw** channels!', 5000);
			return;
		}
		await this.executeCommand.bind(params)(params);
	}
};
