const mysql = require('../util/mysql.js');
const con = mysql.con;
const supportGuild = "420104212895105044";


exports.startPoll = function(client, modChannel){
    //check if guild is correct
    const guild = client.guilds.get(supportGuild);
    if (guild === undefined) return;
	setInterval(clearExpired,60*1000,guild,modChannel); //every minute
}

function clearExpired(guild,modChannel) {
    const sql = "SELECT id FROM mutes WHERE expire < NOW();";
    con.query(sql,async function(err,result) {
        if(err) throw err;
        for (const user of result) {
            try {
                let member = await guild.fetchMember(user.id);
                await member.removeRole("536311748517691406");
                await guild.channels.get(modChannel).send(`Mute for ${member.user.username} has expired.`)
                const sql2 = `DELETE FROM mutes WHERE id = ${user.id}`;
                con.query(sql2, function(err,result) {
                    if(err) throw err;
                });
                await member.user.send(`Your mute has expired!`);
            } catch (err) {
                console.log(err);
            }
        }
    });
}

exports.checkNewUser = function(member) {
    if (member.guild.id !== supportGuild) return;

    const sql = `SELECT * FROM mutes WHERE id = ${member.id};`;
    con.query(sql,function(err,result) {
        if(err) throw err;
        if (result.length > 0) {
            member.addRole("536311748517691406");
        }
    });
}