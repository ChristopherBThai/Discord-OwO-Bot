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
		this.reinitialize = this.reinitialize.bind(this);
		this.parseAnimal = this.parseAnimal.bind(this);
		this.parseRank = this.parseRank.bind(this);
		this.getAnimal = this.getAnimal.bind(this);
		this.getRank = this.getRank.bind(this);
		this.getRanks = this.getRanks.bind(this);
		this.getOrder = this.getOrder.bind(this);
	}

	async initialize() {
		this.animalNameToKey = {};
		this.animals = {};
		this.order = [];
		this.ranks = {};
		this.rankNameToKey = {};

		let result;
		try {
			result = await mysql.query(`SELECT * FROM animals;`);
		} catch (err) {
			console.error(err);
			console.error('Failed to fetch animals, retrying in 10s');
			return new Promise((res) => {
				setTimeout(() => {
					res(this.initialize());
				}, 5000);
			});
		}

		result.forEach(this.parseAnimal);
		Object.keys(animalJson.ranks).forEach(this.parseRank);
		this.updateAnimalsAndRanks();

		this.order = Object.keys(animalJson.ranks);
		this.order = this.order.sort((a, b) => {
			return animalJson.ranks[a].order - animalJson.ranks[b].order;
		});
	}

	async reinitialize(animalName) {
		if (animalName) {
			animalName = this.animalNameToKey[animalName] || animalName;
			return this.reinitializeAnimal(animalName);
		}
		const newAnimalJson = new AnimalJson();
		await newAnimalJson.initialize();
		this.copy(newAnimalJson);
	}

	async reinitializeAnimal(animalName) {
		const result = await mysql.query(`SELECT * FROM animals WHERE name = ?`, animalName);
		this.parseAnimal(result[0]);
		this.updateAnimalsAndRanks();
	}

	copy(newAnimalJson) {
		this.animalNameToKey = newAnimalJson.animalNameToKey;
		this.animals = newAnimalJson.animals;
		this.order = newAnimalJson.order;
		this.ranks = newAnimalJson.ranks;
		this.rankNameToKey = newAnimalJson.rankNameToKey;
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
			rank.addAnimalToTemp(animal);
		}
		Object.values(this.ranks).forEach((rank) => {
			rank.useTemp();
		});
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
		this.tempAnimals = [];
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

	addAnimalToTemp(animal) {
		this.tempAnimals.push(animal.value);
		animal.setRank(this);
	}

	useTemp() {
		this.animals = this.tempAnimals;
		this.tempAnimals = [];
	}
}

const obj = new AnimalJson();
obj.initialize();
module.exports = obj;
