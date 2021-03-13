/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const Base = require('eris-sharder').Base;
const EventHandler = require('./eventHandlers/EventHandler.js');

// Secret file
const auth = require('../../tokens/owo-auth.json');

// Discordbots.org api
const DBL = require("dblapi.js");
const dbl = new DBL(auth.dbl);

class OwO extends Base{
	constructor(bot){
		super(bot);
		this.auth = auth;
		this.dbl = dbl;

		// Mysql connection
		this.mysql = require('./utils/mysql.js');

		// Redis connection
		this.redis = require('./utils/redis.js');


		// Neo4j Logging
		this.neo4j = require('./utils/neo4j.js');

		// Redis pubsub to communicate with all the other shards/processes
		this.pubsub = new (require('./utils/pubsub.js'))(this);

		// Logger
		this.logger = require('./utils/logger.js');

		// Bot config file
		this.config = require('./data/config.json');
		this.debug = this.config.debug;
		this.prefix = this.config.prefix;

		// Ban check 
		this.ban = require('./utils/ban.js');

		// Cooldown check 
		this.cooldown = require('./utils/cooldown.js');

		// Quest Handler
		this.questHandler = new (require("./botHandlers/questHandler.js"))();

		// Mysql Query Handler
		this.mysqlhandler = require("./botHandlers/mysqlHandler.js")
		this.query = this.mysqlhandler.query;

		// Global helper methods
		this.global = require('./utils/global.js');
		this.global.client(this.bot);
		this.global.con(this.mysql.con);

		// Message sender helper methods
		this.sender = require('./utils/sender.js');
		this.sender.init(this);

		// Date utility
		this.dateUtil = require('./utils/dateUtil.js');

		// Hidden macro detection file
		this.macro = require('./../../tokens/macro.js');
		this.macro.bind(this,require('merge-images'),require('canvas'));
		this.cooldown.setMacro(this.macro);

		// Allows me to check catch before any fetch requests (reduces api calls)
		this.fetch = new (require('./utils/fetch.js'))(this);

		// Creates a reaction collector for a message (works for uncached messages too)
		this.reactionCollector = new (require('./utils/reactionCollector.js'))(this);

		// Fetches images and converts them to buffers
		this.DataResolver = require('./utils/dataResolver.js');

		// Ability to add emojis to guilds
		this.EmojiAdder = require('./utils/EmojiAdder.js');

		// Helper for patreon benefits
		this.patreon = require('./utils/patreon.js');
		this.patreon.init(this);

		// Create commands
		this.command = new (require('./commands/command.js'))(this);
	}

	launch(){
		// Bind bot events 
		this.eventHandler = new EventHandler(this);

		// sends info to our main server every X seconds
		this.InfoUpdater = new (require('./utils/InfoUpdater.js'))(this);
	}
}

module.exports = OwO;
