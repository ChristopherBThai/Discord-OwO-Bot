/*
 * Shared axios instance for interaction callbacks.
 *
 * Discord requires an answer to an interaction within 3 seconds. Node's default https agent
 * closes idle sockets after 5 seconds, so the first click after a short pause had to open a
 * brand new TLS connection, which can take more than 3 seconds on slow networks ("The
 * application did not respond"). This agent keeps sockets open longer and `keepWarm` pings
 * Discord while a message with buttons is active so a ready connection always exists.
 */

const https = require('https');
const axios = require('axios');

const agent = new https.Agent({
	keepAlive: true,
	keepAliveMsecs: 10000,
	timeout: 60000,
	maxFreeSockets: 8,
});

const http = axios.create({ httpsAgent: agent });

function warm() {
	return http.get('https://discord.com/api/v10/gateway', { timeout: 10000 }).catch(() => {});
}

/**
 * Keeps a connection to discord ready until the emitter fires 'end'.
 * @param {EventEmitter} emitter an interaction collector
 * @param {number} [interval] ping interval in ms
 */
function keepWarm(emitter, interval = 15000) {
	warm();
	const timer = setInterval(warm, interval);
	emitter.once('end', () => clearInterval(timer));
}

module.exports = { http, warm, keepWarm };
