/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const workerpool = require('workerpool');
const { create, all } = require('mathjs');
const math = create(all);
const limitedEvaluate = math.evaluate;
math.import(
	{
		import: function () {
			throw new Error('Function import is disabled');
		},
		createUnit: function () {
			throw new Error('Function createUnit is disabled');
		},
		evaluate: function () {
			throw new Error('Function evaluate is disabled');
		},
		parse: function () {
			throw new Error('Function parse is disabled');
		},
		simplify: function () {
			throw new Error('Function simplify is disabled');
		},
		derivative: function () {
			throw new Error('Function derivative is disabled');
		},
	},
	{ override: true }
);

function compute(expression) {
	return limitedEvaluate(expression);
}

workerpool.worker({ compute: compute });
