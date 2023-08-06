/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const battleUtil = require('./util/battleUtil.js');

module.exports = new CommandInterface({
	alias: ['battlesetting', 'bs', 'battlesettings'],

	args: '',

	desc: '',

	example: [''],

	related: ['owo battle'],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['animals'],

	cooldown: 3000,
	half: 80,
	six: 500,

	execute: async function (p) {
		if (p.args.length == 0) await display(p);
		else await changeSettings(p);
	},
});

async function display(p) {
	let settings = await battleUtil.getBattleSetting.bind(p)();

	//let text = (settings.showLogs?"~~":"")+"**Auto = ** `"+settings.auto+"`"+(settings.showLogs?"~~":"")+"\n";
	let text = '**Display = ** `' + settings.display + '`\n';
	text += '**Speed = ** `' + settings.speed + '`';
	text += '\n**Logs = ** `' + settings.showLogs + '`';

	let embed = {
		color: p.config.embed_color,
		author: {
			name: p.getName() + "'s battle settings",
			icon_url: p.msg.author.avatarURL,
		},
		description: text,
	};

	p.send({ embed });
}

async function changeSettings(p) {
	let args = p.args.join('');
	args = args.toLowerCase();
	args = args.split('=');
	if (args.length != 2) {
		p.errorMsg(', The correct command is `owo battlesetting {settingName=setting}`');
		return;
	}

	let field = '';
	let setting = '';

	if (args[0] == 'display') {
		field = 'display';
		if (args[1] == 'image') {
			setting = "'image'";
		} else if (args[1] == 'text') {
			setting = "'text'";
		} else if (args[1] == 'compact') {
			setting = "'compact'";
		} else {
			p.errorMsg(', the display settings can only be `image`, `compact`, or `text`!');
			return;
		}
	} else if (args[0] == 'speed') {
		field = 'speed';
		if (args[1] == '0' || args[1] == 'instant') {
			setting = 0;
		} else if (args[1] == '1' || args[1] == 'short') {
			setting = 1;
		} else if (args[1] == '2' || args[1] == 'lengthy') {
			setting = 2;
		} else {
			p.errorMsg(', the speed settings can only be `instant`, `short`, or `lengthy`!');
			return;
		}
	} else if (args[0] == 'log' || args[0] == 'logs') {
		field = 'logs';
		if (args[1] == 'false') {
			setting = 0;
		} else if (args[1] == 'true') {
			setting = 1;
		} else if (args[1] == 'link') {
			setting = 2;
		} else {
			p.errorMsg(', the log settings can only be `true`, or `false`!');
			return;
		}
	} else {
		p.errorMsg(', the display settings can only be `logs`, `display`, or `speed`!');
		return;
	}

	let sql = `INSERT IGNORE INTO battle_settings (uid,${field}) VALUES
		((SELECT uid FROM user WHERE id = ${p.msg.author.id}),
		 ${setting})
		ON DUPLICATE KEY UPDATE
			${field} = ${setting};`;

	let result = await p.query(sql);
	if (result.affectedRows == 0) {
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0); ${sql}`;
		result = await p.query(sql);
	}

	display(p);
}
