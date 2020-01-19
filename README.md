# OwO Bot
[![Discord Bots](https://discordbots.org/api/widget/status/408785106942164992.svg)](https://discordbots.org/bot/408785106942164992)  [![Discord Bots](https://discordbots.org/api/widget/servers/408785106942164992.svg)](https://discordbots.org/bot/408785106942164992)  [![Discord Bots](https://discordbots.org/api/widget/lib/408785106942164992.svg)](https://discordbots.org/bot/408785106942164992)

Here are the codes for OwO Bot! Feel free to submit an issue or open a pull request!

## Self hosting
This discord bot uses [MariaDB](https://mariadb.org/) and [Redis](https://redis.io/) for its databases. Some files may be missing due to security reasons.

#### Guide (tips) for self hosting:  
Install Redis and MySQL or MariaDB. A local website / server is optional.  

Refactor the code to replace every instance of '../tokens/x' to '../secret/x' 
 
In index.js replace the code for determining shards with:  
		shards = 1;  
		clusters = 1;  
		firstShardID = 0;  
		lastShardID = 0;

Fill in owo-login with your database login, fill in owo auth with the bot token and your discord id.
wsserver.json can be left blank, or fill in your local server.  

If redis and the database are up and running you can do npm install to install owobot and than run node index.js.  
  
If everything went correctly you should be able to invite the bot into your own server.   
Note: because files are missing functionality is limited.
  

## License
OwO Bot is licensed under the terms of [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://github.com/ChristopherBThai/Discord-OwO-Bot/blob/master/LICENSE) ("CC-BY-NC-SA-4.0"). Commercial use is not allowed under this license. This includes any kind of revenue made with or based upon the software, even donations.

The CC-BY-NC-SA-4.0 allows you to:
- [x] **Share** -- copy and redistribute the material in any medium or format
- [x] **Adapt** -- remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- **NonCommercial** — You may not use the material for commercial purposes. 
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

More information can be found [here](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## Contributing
All merge requests are welcome! Just make sure to sign the [CLA](https://cla-assistant.io/ChristopherBThai/Discord-OwO-Bot) or else we cannot merge your changes.
