/* eslint-disable */

// Checks for macros
exports.check = async function (p, command, { diff, now }) {
	return true;
};

// Generates HB image buffers
exports.generateBuffer = async function (word, callback) {};

// Verifies captcha from DMs
exports.verify = async function (msg, text) {};

// Binds needed files to macro.js
exports.bind = function (main, tmergeImages, canvas) {};

// Binds level check files
exports.initLevelCheck = function (uBan) {};

// Check for xp macros
exports.levelCheck = function (msg, limit) {
	return true;
};
