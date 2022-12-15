/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const Base = require('eris-sharder').Base;
const EventHandler = require('./eventHandlers/EventHandler');
const { DBL_TOKEN } = process.env;

// Discordbots.org api
const DBL = require('dblapi.js');
const dbl = new DBL(DBL_TOKEN);

class OwO extends Base {
	constructor(bot) {
		super(bot);
		this.dbl = dbl;

		// Mysql connection
		this.mysql = require('./utils/mysql');

		// Redis connection
		this.redis = require('./utils/redis');

		// Neo4j Logging
		this.neo4j = require('./utils/neo4j');

		// Redis pubsub to communicate with all the other shards/processes
		this.pubsub = new (require('./utils/pubsub'))(this);

		// Handles discord interaction events
		this.interactionHandlers = new (require('./interactionHandlers'))(this);

		// Creates a pageable message
		this.PagedMessage = require('./utils/PagedMessage');

		// Websockets
		this.streamSocket = new (require('./utils/streamSocket'))(this);
		this.snailSocket = new (require('./utils/snailSocket'))(this);

		// Logger
		this.logger = require('./utils/logger');

		// Bot config file
		this.config = require('./data/config');
		this.debug = this.config.debug;
		this.prefix = this.config.prefix;

		// Ban check 
		this.ban = require('./utils/ban');

		// Cooldown check 
		this.cooldown = require('./utils/cooldown');

		// Quest Handler
		this.questHandler = new (require('./botHandlers/questHandler'))();

		// Mysql Query Handler
		this.mysqlhandler = require('./botHandlers/mysqlHandler');
		this.query = this.mysqlhandler.query;

		// Global helper methods
		this.global = require('./utils/global');
		this.global.client(this.bot);
		this.global.con(this.mysql.con);

		// Message sender helper methods
		this.sender = require('./utils/sender');
		this.sender.init(this);

		// Date utility
		this.dateUtil = require('./utils/dateUtil');

		// Hidden macro detection file
		this.macro = require('./../../tokens/macro');
		this.macro.bind(this,require('merge-images'), require('canvas'));
		this.cooldown.setMacro(this.macro);

		// Allows me to check catch before any fetch requests (reduces api calls)
		this.fetch = new (require('./utils/fetch'))(this);

		// Creates a reaction collector for a message (works for uncached messages too)
		this.reactionCollector = new (require('./utils/reactionCollector'))(this);

		// Creates a reaction collector for a message (works for uncached messages too)
		this.interactionCollector = new (require('./utils/interactionCollector'))(this);

		// Fetches images and converts them to buffers
		this.DataResolver = require('./utils/dataResolver');

		// Ability to add emojis to guilds
		this.EmojiAdder = require('./utils/EmojiAdder');

		// Helper for patreon benefits
		this.patreon = require('./utils/patreon');
		this.patreon.init(this);

		// Create commands
		this.command = new (require('./commands/command'))(this);
	}

	launch() {
		// Bind bot events 
		this.eventHandler = new EventHandler(this);

		// Send info to our main server every X seconds
		this.InfoUpdater = new (require('./utils/InfoUpdater'))(this);
	}
};

module.exports = OwO;
