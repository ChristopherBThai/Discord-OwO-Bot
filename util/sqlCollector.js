/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

/* Utility to manage collections of sql statements */
class SqlCollector {

	constructor(){
		this.s = [];
		this.statements = {};
	}

	add(name,stmt){
		i = this.s.push([name,stmt]);
		this.statements[name] = {'index': i - 1};
	}

	remove(name){
		this.s.splice(statements[name].index);
		delete this.statements[name];
		this.reindex();
	}

	render(){
		return this.s.map(x => x[1]).join(' ');
	}

	reindex(){
		for(i = 0; i < this.statements.length; i++){
			this.statements[s[i][0]].index = i;
		}
	}

	indexOf(name){
		return this.statements[name].index;
	}
}

module.exports = SqlCollector;
