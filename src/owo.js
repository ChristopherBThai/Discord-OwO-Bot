/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const Base = require('eris-sharder').Base;
const EventHandler = require('./eventHandlers/EventHandler.js');

// Discordbots.org api
const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL_TOKEN);

class OwO extends Base{
	constructor(bot){
		super(bot);
		this.dbl = dbl;
		
		const importNames = [
			'mysql', 'redis', 'neo4j', 
			'pubsub', 'PagedMessage', 'streamSocket', 
			'snailSocket', 'logger', 'ban', 
			'cooldown', 'global', 'sender', 
			'dateUtil', 'fetch', 'reactionCollector', 
			'dataResolver', 'EmojiAdder', 'patreon'
		];
		
		const importObject = importNames.reduce(
			(obj, current) => (
				{ 
					...obj, 
					[current]: require(`./utils/${current}.js`)
				}
			), {});
		
		this = {
			...this,
			...importObject
		}
		
		// Mysql connection, Optimized in the above function!

		// Redis connection, Optimized in the above function!

		// Neo4j Logging, Optimized in the above function!

		// Redis pubsub to communicate with all the other shards/processes
		this.pubsub = new (this.pubsub)(this);

		// Handles discord interaction events
		this.interactionHandlers = new (require('./interactionHandlers'))(this);

		// Creates a pageable message, this.pubsub

		// Websockets
		this.streamSocket = new (this.streamSocket)(this);
		this.snailSocket = new (this.snailSocket)(this);

		// Logger, Optimized in the above function!

		// Bot config file
		this.config = require('./data/config.json');
		this.debug = this.config.debug;
		this.prefix = this.config.prefix;

		// Ban check , Optimized in the above function!

		// Cooldown check, Optimized in the above function!

		// Quest Handler
		this.questHandler = new (require("./botHandlers/questHandler.js"))();

		// Mysql Query Handler
		this.mysqlhandler = require("./botHandlers/mysqlHandler.js")
		this.query = this.mysqlhandler.query;

		// Global helper methods
		this.global.client(this.bot);
		this.global.con(this.mysql.con);

		// Message sender helper methods
		this.sender.init(this);

		// Date utility, Optimized in the above function!

		// Hidden macro detection file
		this.macro = require('./../../tokens/macro.js');
		this.macro.bind(this,require('merge-images'),require('canvas'));
		this.cooldown.setMacro(this.macro);

		// Allows me to check catch before any fetch requests (reduces api calls)
		this.fetch = new (this.fetch)(this);

		// Creates a reaction collector for a message (works for uncached messages too)
		this.reactionCollector = new (this.reactionCollector)(this);

		// Creates a reaction collector for a message (works for uncached messages too)
		this.interactionCollector = new (this.interactionCollector)(this);

		// Fetches images and converts them to buffers, Optimized in the above function!
		this.DataResolver = require('./utils/dataResolver.js');

		// Ability to add emojis to guilds, Optimized in the above function!

		// Helper for patreon benefits
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
