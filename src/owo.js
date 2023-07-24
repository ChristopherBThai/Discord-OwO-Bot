/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Base = require('eris-sharder').Base;
const EventHandler = require('./eventHandlers/EventHandler.js');

// Discordbots.org api
const DBL = require('dblapi.js');
const dbl = new DBL(process.env.DBL_TOKEN);

class OwO extends Base {
	constructor(bot) {
		super(bot);
		this.dbl = dbl;

		// Mysql connection
		this.mysql = require('./utils/mysql.js');

		// Redis connection
		this.redis = require('./utils/redis.js');

		// Neo4j Logging
		this.neo4j = require('./utils/neo4j.js');

		// Redis pubsub to communicate with all the other shards/processes
		this.pubsub = new (require('./utils/pubsub.js'))(this);

		// Handles discord interaction events
		this.interactionHandlers = new (require('./interactionHandlers'))(this);

		// Creates a pageable message
		this.PagedMessage = require('./utils/PagedMessage.js');

		// Websockets
		this.streamSocket = new (require('./utils/streamSocket.js'))(this);
		this.snailSocket = new (require('./utils/snailSocket.js'))(this);

		// Logger
		this.logger = require('./utils/logger.js');

		// Bot config file
		this.config = require('./data/config.json');
		this.debug = this.config.debug;
		this.prefix = this.config.prefix;
		this.optOut = {};
		this.setOptOut();

		// Ban check
		this.ban = require('./utils/ban.js');

		// Cooldown check
		this.cooldown = require('./utils/cooldown.js');

		// Quest Handler
		this.questHandler = new (require('./botHandlers/questHandler.js'))();

		// Mysql Query Handler
		this.mysqlhandler = require('./botHandlers/mysqlHandler.js');
		this.query = this.mysqlhandler.query;

		try {
			this.animals = require('./../../tokens/owo-animals.json');
		} catch (err) {
			console.error('Could not find owo-animals.json, attempting to use ./secret file...');
			this.animals = require('../secret/owo-animals.json');
			console.log('Found owo-animals.json file in secret folder!');
		}

		// Global helper methods
		this.global = require('./utils/global.js');
		this.global.init(this);

		this.event = require('./utils/eventUtil.js');

		// Message sender helper methods
		this.sender = require('./utils/sender.js');
		this.sender.init(this);

		// Date utility
		this.dateUtil = require('./utils/dateUtil.js');

		// Hidden macro detection file
		try {
			this.macro = require('./../../tokens/macro.js');
		} catch (err) {
			console.error('Could not find macro.js, attempting to use ./secret file...');
			this.macro = require('../secret/macro.js');
			console.log('Found macro.js file in secret folder!');
		}
		this.macro.bind(this, require('merge-images'), require('canvas'));
		this.cooldown.setMacro(this.macro);

		// Allows me to check catch before any fetch requests (reduces api calls)
		this.fetch = new (require('./utils/fetch.js'))(this);

		// Creates a reaction collector for a message (works for uncached messages too)
		this.reactionCollector = new (require('./utils/reactionCollector.js'))(this);

		// Creates a reaction collector for a message (works for uncached messages too)
		this.interactionCollector = new (require('./utils/interactionCollector.js'))(this);

		// Fetches images and converts them to buffers
		this.DataResolver = require('./utils/dataResolver.js');

		// Ability to add emojis to guilds
		this.EmojiAdder = require('./utils/EmojiAdder.js');

		// Helper for patreon benefits
		this.patreon = require('./utils/patreon.js');
		this.patreon.init(this);

		try {
			this.badwords = require('./../../tokens/badwords.json');
		} catch (err) {
			console.error('Could not find badwords.json, attempting to use ./secret file...');
			this.badwords = require('../secret/badwords.json');
			console.log('Found badwords.json file in secret folder!');
		}

		this.giveaway = require('./utils/giveaway.js');
		this.giveaway.checkGiveawayTimeout(this);

		// Create commands
		this.command = new (require('./commands/command.js'))(this);
	}

	launch() {
		// Bind bot events
		this.eventHandler = new EventHandler(this);

		// sends info to our main server every X seconds
		this.InfoUpdater = new (require('./utils/InfoUpdater.js'))(this);
	}

	async setOptOut() {
		const ids = await this.redis.hgetall('optOut');
		for (let id in ids) {
			this.optOut[id] = true;
		}
	}
}

module.exports = OwO;
