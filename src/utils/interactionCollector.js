/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const EventEmitter = require("eventemitter3");
const axios = require('axios');

class InteractionCollector{
	constructor (main){
		this.main = main;
		this.listeners = {};
	}

	create (msg, filter, opt= {}){
		delete this.listeners[msg.id];
		let iee = new InteractionEventEmitter(filter, opt);
		iee.on('end',() => delete this.listeners[msg.id]);
		this.listeners[msg.id] = iee;

		return iee;
	}

	interact ({ member, message, data, id, token }){
		const listener = this.listeners[message.id] || this.listeners[message.interaction?.id]
		if(!listener) return
		listener.interact(data, member.user, id, token);
	}
}

class InteractionEventEmitter extends EventEmitter{
	constructor (filter, { time=null, idle=null }){
		super();
		this.filter = filter;
		this.ended = false;
		this.idleTimeout = idle;

		if(time) this.time = setTimeout(() => this.stop('time'), time);
		if(idle) this.idle = setTimeout(() => this.stop('idle'), idle);
	}

	checkFilter (componentName, user) {
		if(!this.filter) return true;
		return this.filter(componentName, user);
	}

	interact (component, user, id, token) {
		if(!this.checkFilter(component.custom_id, user)) return;
		if(this.ended) return;

		const url = `https://discord.com/api/v8/interactions/${id}/${token}/callback`
		function ack (content) {
			if (content) {
				if (typeof content === "string") {
					content = { content }
				}
				if (content.embed) {
					content.embeds = [ content.embed ];
					delete content.embed;
				}
				return axios.post(url, {
					type: 7,
					data: content
				});
			} else {
				return axios.post(url, { type: 1 });
			}
		}

		this.emit('collect', component.custom_id, user, ack);

		if(this.idleTimeout) {
			clearTimeout(this.idle);
			this.idle = setTimeout(() => this.stop('idle'), this.idleTimeout);
		}
	}

	stop (reason) {
		if(this.ended) return;
		this.ended = true;

		if(this.time) {
			clearTimeout(this.time);
			this.time = null;
		}

		if(this.idle) {
			clearTimeout(this.idle);
			this.idle = null;
		}

		this.emit('end', reason);
		this.removeAllListeners();
	}
	
}

module.exports = InteractionCollector;
