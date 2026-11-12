# OwO Bot

[![Discord Bots](https://discordbots.org/api/widget/status/408785106942164992.svg)](https://discordbots.org/bot/408785106942164992) [![Discord Bots](https://discordbots.org/api/widget/servers/408785106942164992.svg)](https://discordbots.org/bot/408785106942164992) [![Discord Bots](https://discordbots.org/api/widget/lib/408785106942164992.svg)](https://discordbots.org/bot/408785106942164992)

Here are the codes for OwO Bot! Feel free to submit an issue or open a pull request!

## Self hosting

This discord bot uses [MariaDB](https://mariadb.org/) and [Redis](https://redis.io/) for its databases. Some files may be missing due to security reasons and can be found [here](https://github.com/ChristopherBThai/Discord-OwO-Bot/tree/master/secret).

### Installing on Debian or Ubuntu

Use Node.js 22 and npm 11. The native dependencies in the lockfile are not compatible
with every newer Node.js release. Install Git and the build dependencies for `canvas`
and other native modules:

```bash
sudo apt-get update
sudo apt-get install -y git build-essential python3 pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libpixman-1-dev
```

In the repository directory, install the exact versions in the lockfile:

```bash
npm ci --allow-git=all
```

`--allow-git=all` permits Git dependencies for this command only. Use it only if
you trust the repository and its dependencies; an organizational policy may prohibit
it. This project uses Git dependencies, including a customized `merge-images` fork
and a transitive Eris fork, so simply removing `merge-images` or replacing it with
the npm package is not equivalent. Git access to GitHub must be available; if npm
tries SSH, configure GitHub SSH authentication or an appropriate Git HTTPS rewrite.

Do not skip install scripts: native modules and the Git-hosted `merge-images` fork
need them to build. The bot also requires its database and configuration files; the
installation steps alone do not configure MariaDB, Redis, or missing private files.

### Troubleshooting local startup

- If `canvas.node` is missing, verify `node -v` is 22.x and
  `npm config get ignore-scripts` is `false`, install the native build packages
  above, then run `npm ci --allow-git=all --ignore-scripts=false`. Verify with
  `node -e "require('canvas'); console.log('canvas OK')"`. Do not start the bot
  until the installation and this check succeed.
- For a local Redis instance without authentication, leave `REDIS_PASS` empty in
  the active environment file. Set it to the Redis password when authentication is
  enabled. Passwordless Redis should not be exposed to untrusted networks.
- The database name is `owo`. `MYSQL_USER` and `MYSQL_PASS` must identify a MariaDB
  account that has access to that database. An administrator can inspect permissions
  with `SHOW GRANTS FOR 'owobot'@'localhost';` and, if appropriate, grant access with
  `GRANT ALL PRIVILEGES ON owo.* TO 'owobot'@'localhost';`. Replace the account name
  and host as needed; create the database and account separately if they do not
  exist. The supplied SQL dumps contain destructive `DROP TABLE` statements, so do
  not import them into an existing database without a backup.
- `INFLUXDB_HOST` is optional for local logging. If unset, InfluxDB metrics are
  disabled. `SNAIL_SOCKET` refers to a separate service; an unset or unreachable
  endpoint can produce connection warnings.

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
