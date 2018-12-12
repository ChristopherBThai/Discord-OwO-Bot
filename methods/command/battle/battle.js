const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const battleUtil = require('./battleutil.js');
const petUtil = require('./petutil.js');

module.exports = new CommandInterface({

	alias:["battle","b","fight"],

	args:"{@user} {bet}",

	desc:"Use your pets to fight against other players! As you fight, your pet will become stronger! You can only add pets from your current zoo.",

	example:["owo battle","owo battle @scuttler 100"],

	related:["owo zoo","owo pet"],

	cooldown:15000,
	half:80,
	six:500,
	bot:true,

	execute: function(p){
	}

})
