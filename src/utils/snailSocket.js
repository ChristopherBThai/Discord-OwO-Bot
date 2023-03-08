/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const io = require('socket.io-client');

class SnailSocket {
	constructor(main) {
		this.main = main;
		this.socket = io(process.env.SNAIL_SOCKET, {
			auth: {
				token: process.env.SNAIL_TOKEN,
			},
		});
		this.socket.on('error', (_error) => {
			console.error('SnailSocket error');
		});
		this.socket.on('disconnect', (_reason) => {
			console.error('SnailSocket disconnect');
		});
		this.socket.on('connect', () => {
			console.log('SnailSocket connected');
		});
		this.socket.on('connect_error', (_error) => {
			console.error('SnailSocket connect_error');
		});
	}

	messageChannel(channelId, contents) {
		this.socket.emit('message-channel', { channelId, contents });
	}

	userBanned(userId, isBanned) {
		this.socket.emit('user-banned', { userId, isBanned });
	}
}

module.exports = SnailSocket;
