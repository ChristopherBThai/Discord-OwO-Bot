/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const patreonHandler = require('../../../handler/patreonHandler.js');

module.exports = new CommandInterface({

	alias:["patreontest"],

	admin:true,
	dm:true,

	execute: function(p){

	}

})
