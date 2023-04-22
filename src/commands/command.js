/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const requireDir = require('require-dir');
const dir = requireDir('./commandList', { recurse: true });

const CommandInterface = require('./CommandInterface.js');

const commands = {};
const adminCommands = {};

const aliasToCommand = {};
const mcommands = {};
const commandGroups = {};

class Command {
	constructor(main) {
		this.main = main;
		this.prefix = main.prefix;
		initCommands();
		this.commands = commands;
	}

	async execute(msg, raw) {
		// Parse content info
		let { args, context } = (await checkPrefix(this.main, msg)) || {};
		const containsPoints =
			msg.content.toLowerCase().includes('owo') || msg.content.toLowerCase().includes('uwu');
		if (!args) {
			//if user said owo/uwu
			if (containsPoints) {
				executeCommand(this.main, initParam(msg, 'points', [], this.main));
			}
			return;
		}

		//Get command name
		let command = args.shift().toLowerCase();

		//  Check if that command exists
		if (!commands[command]) {
			if (containsPoints) {
				executeCommand(this.main, initParam(msg, 'points', [], this.main));
			}
			return;
		}

		// Make sure user accepts rules first
		if (!(await acceptedRules(this.main, msg))) {
			executeCommand(this.main, initParam(msg, 'rule', [], this.main));
			return;
		}

		// Init params to pass into command
		let param = initParam(msg, command, args, this.main, context);

		// Parse user raw data, so our cache is up to date
		this.checkRaw(raw);

		// Execute the command
		await executeCommand(this.main, param);
	}

	async executeInteraction(interaction) {
		//Get command name
		let command = interaction.command.toLowerCase();

		// Make sure user accepts rules first
		if (!(await acceptedRules(this.main, interaction))) {
			executeCommand(this.main, initParam(interaction, 'rule', [], this.main));
			return;
		}

		// Init params to pass into command
		let param = initParam(interaction, command, interaction.args, this.main);

		// Execute the command
		await executeCommand(this.main, param);
	}

	async executeAdmin(msg) {
		if (msg.content.toLowerCase().indexOf(this.prefix) !== 0) {
			return false;
		}
		let { args, context } = (await checkPrefix(this.main, msg)) || {};
		let command = args.shift().toLowerCase();
		let commandObj = adminCommands[command];
		if (!commandObj) {
			return false;
		}
		let param = initParam(msg, command, args, this.main, context);

		if (commandObj.owner && msg.author.id === this.main.config.owner) {
			adminCommands[command].execute(param);
			return true;
		} else if (this.main.config.modChannels.includes(msg.channel.id)) {
			if (
				commandObj.admin &&
				this.main.config.role.admin.find((id) => msg.member?.roles.includes(id))
			) {
				adminCommands[command].execute(param);
				return true;
			} else if (
				commandObj.manager &&
				this.main.config.role.manager.find((id) => msg.member?.roles.includes(id))
			) {
				adminCommands[command].execute(param);
				return true;
			} else if (
				commandObj.helper &&
				this.main.config.role.helper.find((id) => msg.member?.roles.includes(id))
			) {
				adminCommands[command].execute(param);
				return true;
			}
		}
		return false;
	}

	checkRaw(raw) {
		if (raw?.author) {
			this.updateUser(raw.author);
		}
		raw?.mentions?.forEach((user) => this.updateUser(user));
	}

	updateUser(rawUser) {
		const user = this.main.bot.users.get(rawUser.id);
		let update = false;
		if (
			user &&
			(user.username !== rawUser.username ||
				user.avatar !== rawUser.avatar ||
				user.discriminator !== rawUser.discriminator)
		) {
			update = true;
		}
		if (!user || update) {
			this.main.bot.users.update(rawUser, this.main.bot);
		}
	}
}

async function executeCommand(main, p) {
	let { ban, cooldown, logger } = main;

	// Check if the command/user/channel is banned
	if (!(await ban.check(p, p.commandAlias))) return;

	// Check for cooldowns
	if (!(await cooldown.check(p, p.commandAlias))) return;

	// Execute command
	await commands[p.command].execute(p);

	// Log stats to statsd
	logger.command(p.commandAlias, p.msg);
	logger.logstash(p.commandAlias, p);
}

/**
 * Reads and initializes the commands
 * Will sort them by type and aliases
 */
function initCommands() {
	let groupCommand = function (command, name) {
		let groups = command.group;
		if (groups && groups.length) {
			for (let i in groups) {
				let group = groups[i];
				if (!commandGroups[group]) commandGroups[group] = [];
				commandGroups[group].push(name);
			}
		} else {
			if (!commandGroups['undefined']) commandGroups['undefined'] = [];
			commandGroups['undefined'].push(name);
		}
	};

	let addCommand = function (command) {
		if (command.owner || command.admin || command.manager || command.helper) {
			return addAdminCommand(command);
		}
		let alias = command.alias;
		let name = alias[0];
		if (alias) {
			for (let i = 0; i < alias.length; i++) {
				commands[alias[i]] = command;
				if (command.distinctAlias) {
					aliasToCommand[alias[i]] = alias[i];
					groupCommand(command, alias[i]);
					mcommands[alias[i]] = {
						botcheck: command.bot,
						cd: command.cooldown,
						ban: 12,
						half: command.half,
						six: command.six,
						group: command.group,
					};
				} else aliasToCommand[alias[i]] = name;
			}
		}
		if (!command.distinctAlias) groupCommand(command, name);
		mcommands[name] = {
			botcheck: command.bot,
			cd: command.cooldown,
			ban: 12,
			half: command.half,
			six: command.six,
			group: command.group,
		};
	};

	let addAdminCommand = function (command) {
		let alias = command.alias;
		if (alias) {
			for (let i = 0; i < alias.length; i++) {
				adminCommands[alias[i]] = command;
			}
		}
	};
	for (let key in dir) {
		if (dir[key] instanceof CommandInterface) {
			addCommand(dir[key]);
		} else if (Array.isArray(dir[key])) {
			dir[key].forEach((val) => {
				if (val instanceof CommandInterface) {
					addCommand(val);
				}
			});
		} else {
			for (let key2 in dir[key]) {
				if (dir[key][key2] instanceof CommandInterface) {
					addCommand(dir[key][key2]);
				} else if (Array.isArray(dir[key][key2])) {
					dir[key][key2].forEach((val) => {
						if (val instanceof CommandInterface) {
							addCommand(val);
						}
					});
				}
			}
		}
	}
}

/**
 * Initializes the resources/utilities required for each command
 */
function initParam(msg, command, args, main, context) {
	let param = {
		msg: msg,
		options: msg.options || {},
		args: args,
		context: context,
		command: command,
		client: main.bot,
		animals: main.animals,
		dbl: main.dbl,
		mysql: main.mysql,
		con: main.mysql.con,
		startTransaction: main.mysqlhandler.startTransaction,
		redis: main.redis,
		query: main.query,
		send: main.sender.send(msg),
		replyMsg: main.sender.reply(msg),
		errorMsg: main.sender.error(main.config.emoji.invalid, msg),
		sender: main.sender,
		macro: main.macro,
		global: main.global,
		event: main.event,
		aliasToCommand: aliasToCommand,
		commandAlias: aliasToCommand[command],
		commands: commands,
		mcommands: mcommands,
		commandGroups: commandGroups,
		logger: main.logger,
		log: main.logger.log,
		config: main.config,
		fetch: main.fetch,
		pubsub: main.pubsub,
		DataResolver: main.DataResolver,
		EmojiAdder: main.EmojiAdder,
		badwords: main.badwords,
		quest: function (questName, count, extra) {
			main.questHandler.increment(msg, questName, count, extra).catch(console.error);
		},
		reactionCollector: main.reactionCollector,
		interactionCollector: main.interactionCollector,
		PagedMessage: main.PagedMessage,
		dateUtil: main.dateUtil,
		neo4j: main.neo4j,
		giveaway: main.giveaway,
	};
	param.setCooldown = function (cooldown) {
		main.cooldown.setCooldown(param, aliasToCommand[command], cooldown);
	};
	param.getMention = function (id) {
		if (!id) return;
		id = id.match(/[0-9]+/);
		if (!id) return;
		id = id[0];
		for (let i in param.msg.mentions) {
			let tempUser = param.msg.mentions[i];
			if (tempUser.id == id) {
				return tempUser;
			}
		}
	};
	param.getRole = function (id) {
		id = id.match(/[0-9]+/);
		if (!id) return;
		id = id[0];
		return param.msg.channel.guild.roles.get(id);
	};
	param.replaceMentions = function (text) {
		if (!text) return;
		let userMentions = text.match(/<@!?\d+>/g);
		let roleMentions = text.match(/<@&\d+>/g);

		for (let i in userMentions) {
			let mention = userMentions[i];
			let user = param.getMention(mention);
			if (user) text = text.replace(mention, '@' + user.username);
		}

		for (let i in roleMentions) {
			let mention = roleMentions[i];
			let role = param.getRole(mention);
			if (role) text = text.replace(mention, '@' + role.name);
		}
		return text;
	};
	return param;
}

async function checkPrefix(main, msg) {
	const content = msg.content.toLowerCase();
	if (content.startsWith(main.prefix)) {
		let args = msg.content.slice(main.prefix.length).trim().split(/ +/g);
		let context = getContext(args, main.prefix, msg.content);
		return { args, context };
	}

	if (!msg.channel.guild) return {};

	// If prefix isn't saved, fetch it
	if (msg.channel.guild.prefix === undefined) {
		let prefix = await main.redis.hget(msg.channel.guild.id, 'prefix');
		if (prefix) msg.channel.guild.prefix = prefix;
		else msg.channel.guild.prefix = false;
	}

	// check with custom prefix
	if (msg.channel.guild.prefix && content.startsWith(msg.channel.guild.prefix)) {
		let args = msg.content.slice(msg.channel.guild.prefix.length).trim().split(/ +/g);
		let context = getContext(args, msg.channel.guild.prefix, msg.content);
		return { args, context };
	}
}

function getContext(args, prefix, content) {
	return content.trim().replace(prefix, '').trim().replace(/^\S+/i, '').trim();
}

async function acceptedRules(main, msg) {
	if (!msg.author.acceptedRules) {
		let sql = `SELECT rules.* FROM rules INNER JOIN user ON user.uid = rules.uid WHERE id = ${msg.author.id};`;
		let result = await main.mysqlhandler.query(sql);
		msg.author.acceptedRules = !!result[0];
	}
	return msg.author.acceptedRules;
}

module.exports = Command;
