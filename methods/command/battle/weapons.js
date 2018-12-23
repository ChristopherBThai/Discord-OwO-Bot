const CommandInterface = require('../../commandinterface.js');

const weaponUtil = require('./util/weaponUtil.js');

module.exports = new CommandInterface({
	
	alias:["weapon","w","weapons"],

	args:"",

	desc:"",

	example:[],

	related:["owo crate","owo battle"],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
	}

})
