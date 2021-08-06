/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const io = require('socket.io-client');

class SocketIo {
	constructor(main){
		this.main = main;
		/*
		const socket = io()
		socket.on('hello', (test) => { console.log(test) })
		socket.on('pong', (test) => { console.log('pong') })
		*/
	}
}

module.exports = SocketIo;
