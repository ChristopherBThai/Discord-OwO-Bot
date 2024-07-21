/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

let animalJson = require('../data/animal.json');
const mysql = require('./../botHandlers/mysqlHandler.js');

class AnimalJson {
	constructor() {
		this.initialize = this.initialize.bind(this);
		this.parseAnimal = this.parseAnimal.bind(this);
		this.parseRank = this.parseRank.bind(this);
		this.getAnimal = this.getAnimal.bind(this);
		this.getRank = this.getRank.bind(this);
		this.getRanks = this.getRanks.bind(this);
		this.getOrder = this.getOrder.bind(this);

		this.initialize();
	}

	async initialize() {
		this.animalNameToKey = {};
		this.animals = {};
		this.order = [];
		this.ranks = {};
		this.rankNameToKey = {};

		const result = await mysql.query(`SELECT * FROM animals;`);

		result.forEach(this.parseAnimal);
		Object.keys(animalJson.ranks).forEach(this.parseRank);
		this.updateAnimalsAndRanks();

		this.order = Object.keys(animalJson.ranks);
		this.order = this.order.sort((a, b) => {
			return animalJson.ranks[a].order - animalJson.ranks[b].order;
		});
	}

	/**
	 * Parse animal for db
	 */
	parseAnimal(rawAnimal) {
		const animal = new Animal(rawAnimal);
		this.addAnimalKeyMap(animal);
		this.animals[animal.value] = animal;
	}

	/**
	 * Parse rank information
	 */
	parseRank(rankName) {
		const rank = new AnimalRank(rankName);
		this.addRankKeyMap(rank);
		this.ranks[rank.id] = rank;
	}

	updateAnimalsAndRanks() {
		for (let key in this.animals) {
			const animal = this.animals[key];
			const rank = this.getRank(animal.rank);
			rank.addAnimal(animal);
		}
	}

	getRank(rankName) {
		rankName = this.rankNameToKey[rankName?.toLowerCase()];
		return this.ranks[rankName];
	}

	getOrder() {
		return this.order;
	}

	getRanks() {
		return this.ranks;
	}

	getAnimal(animalName) {
		animalName = this.animalNameToKey[animalName?.toLowerCase()];
		return this.animals[animalName];
	}

	/**
	 * Add animal to animalNameToKey map
	 *
	 * Ex:
	 * [...
	 *   "gsquid": "<a:gsquid:417968419984375808>",
	 *   "squid": "<a:gsquid:417968419984375808>",
	 *   "<a:gsquid:417968419984375808>": "<a:gsquid:417968419984375808>",
	 * ...]
	 */
	addAnimalKeyMap(animal) {
		animal.alt.forEach((value) => {
			this.animalNameToKey[value.toLowerCase()] = animal.value;
		});
		this.animalNameToKey[animal.value.toLowerCase()] = animal.value;
	}

	/**
	 * Add rank to rankNameToKey map
	 *
	 * Ex:
	 * [...
	 *   "common": "common",
	 *   "c": "common",
	 * ...]
	 */
	addRankKeyMap(rank) {
		rank.alias.forEach((value) => {
			this.rankNameToKey[value.toLowerCase()] = rank.id;
		});
		this.rankNameToKey[rank.id.toLowerCase()] = rank.id;
	}
}

class Animal {
	constructor(rawAnimal) {
		const alt = rawAnimal.alt.split(',');
		this.description = rawAnimal.description;
		this.rank = rawAnimal.rank;
		this.alt = alt;
		this.value = rawAnimal.name;
		this.emoji = rawAnimal.name;
		this.name = alt[0];
		this.hpr = this.hp = rawAnimal.hp;
		this.attr = this.att = rawAnimal.att;
		this.prr = this.pr = rawAnimal.pr;
		this.wpr = this.wp = rawAnimal.wp;
		this.magr = this.mag = rawAnimal.mag;
		this.mrr = this.mr = rawAnimal.mr;
	}

	setRank(rank) {
		this.rank = rank.rank;
		this.price = rank.price;
		this.points = rank.points;
		this.essence = rank.essence;
	}
}

class AnimalRank {
	constructor(rank) {
		this.id = rank;
		this.rank = rank;
		this.name = rank;
		this.emoji = animalJson.ranks[rank].emoji;
		this.alias = [rank, ...animalJson.ranks[rank].alias];
		this.price = animalJson.ranks[rank].price;
		this.points = animalJson.ranks[rank].points;
		this.essence = animalJson.ranks[rank].essence;
		this.animals = [];
		this.placeholder = animalJson.ranks[rank].placeholder;
		this.conditional = animalJson.ranks[rank].conditional;
		this.rarity = animalJson.ranks[rank].rarity;
		this.xp = animalJson.ranks[rank].xp;
		this.order = animalJson.ranks[rank].order;
	}

	addAnimal(animal) {
		this.animals.push(animal.value);
		animal.setRank(this);
	}
}

module.exports = new AnimalJson();
