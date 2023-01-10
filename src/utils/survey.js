/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const surveyEmoji = '📝';
const surveyLogChannel = '882521311371485184';

exports.handle = async function (msg, _ack) {
	const survey = await getSurvey.bind(this)(msg.author.id);
	if (!survey.length) return;

	const currentQuestion = survey.find((question) => question.question_number === question.number);
	if (!currentQuestion) return;

	const embed = {
		title: currentQuestion.question,
		author: {
			name: `Question ${currentQuestion.sid}.${currentQuestion.number}`,
		},
		description: msg.content.trim(),
		color: this.config.embed_color,
	};
	this.snailSocket.messageChannel(surveyLogChannel, { embed });

	await sendNextQuestion.bind(this)(msg, survey);
};

async function getSurvey(userId) {
	const sql = `SELECT us.*, sq.*
			FROM user u
				INNER JOIN user_survey us ON u.uid = us.uid
				INNER JOIN survey_question sq ON sq.sid = us.sid
			WHERE u.id = ${userId}
				AND in_progress = 1;`;
	return (await this.query(sql)) || [];
}

async function sendNextQuestion(msg, survey) {
	const currentQuestion = survey.find((question) => question.question_number === question.number);
	const { uid, sid, number } = currentQuestion;
	const nextQuestion = survey.find((question) => number + 1 === question.number);

	const con = await this.mysqlhandler.startTransaction();
	try {
		if (nextQuestion) {
			const sql = `UPDATE user_survey
					SET question_number = question_number + 1
					WHERE uid = ${uid}
						AND sid = ${sid}
						AND in_progress = 1
						AND is_done = 0
						AND question_number = ${number};`;
			const result = await con.query(sql);
			if (result.changedRows) {
				const text = `**Question ${nextQuestion.number}:** *${nextQuestion.question}*`;
				await this.sender.msgUser(msg.author.id, text);
			} else {
				throw 'Failed to update question';
			}
		} else {
			let sql = `UPDATE user_survey
					SET question_number = question_number + 1,
						in_progress = 0,
						is_done = 1
					WHERE uid = ${uid}
						AND sid = ${sid}
						AND in_progress = 1
						AND is_done = 0
						AND question_number = ${number};`;
			sql += `INSERT INTO lootbox (id, boxcount, claimcount, claim)
					VALUES (${msg.author.id}, 5, 0, '2017-01-01')
					ON DUPLICATE KEY UPDATE boxcount = boxcount + 5;`;
			sql += `INSERT INTO crate (uid, cratetype, boxcount, claimcount, claim)
					VALUES (${uid}, 0, 5, 0, '2017-01-01')
					ON DUPLICATE KEY UPDATE boxcount = boxcount + 5;`;
			const result = await con.query(sql);
			if (result[0].changedRows) {
				const text = `${surveyEmoji} **|** Thanks for completing the survey! You have received 5 ${this.config.emoji.lootbox} and 5 ${this.config.emoji.crate}`;
				await this.sender.msgUser(msg.author.id, text);
			} else {
				throw 'Failed to give rewards';
			}
		}

		con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
	}
}
